import { useCallback, useState } from "react";
import {
  ErrorCustomFetch,
  ErrorCustomUseHookCode,
  fetchCustom,
} from "../utils/utils";
import { PropOperadoresComponent } from "../TypeDinamic";
import DictServiciosBackendAurorizadores from "../../ServiciosOperadores/DictServiciosBackendAurorizadores";
import {
  permissionAutorizadoresDefault,
  serviciosBackendAutorizadoresDefault,
} from "../../routes";
import { useAuth } from "../../../../hooks/AuthHooks";
import { urlConsultarConfiguracionOperadores } from "../urls";

const name_servicio =
  "Telefonia Movil broker - consultar configuracion operadores";
export const errorFront_servicio = `Error respuesta Frontend PDP: Fallo al consumir el servicio (${name_servicio}) [0010002]"`;

const useHookFetchLayouts = (nameSubModule: string) => {
  const nameHook = "useHookFetchLayouts";

  const [statePeticion, setStatePeticion] = useState<boolean>(false);
  const { userPermissions } = useAuth();

  const peticionOperadoresComponent = useCallback(async (): Promise<
    PropOperadoresComponent[]
  > => {
    try {
      setStatePeticion(true);
      let fetchResponse;

      //SECUENCIA Realizar petición al backend en el hook
      try {
        fetchResponse = await fetchCustom(
          urlConsultarConfiguracionOperadores,
          "GET",
          name_servicio,
          { submodule: nameSubModule },
          {}
        );
      } catch (error: any) {
        if (!(error instanceof ErrorCustomFetch)) {
          throw new ErrorCustomUseHookCode(
            errorFront_servicio,
            error.message,
            `${nameHook} - Realizar petición al backend en el hook`
          );
        }
        throw error;
      }

      //SECUENCIA obtener el backend de cada operador segun sea el caso
      let backend_validate = true;
      let operadoresComponent: PropOperadoresComponent[] = [];
      try {
        fetchResponse?.obj?.result.map((operador: any) => {
          const operadorSubModule = operador[nameSubModule];
          let backend_default =
            DictServiciosBackendAurorizadores?.[operador.autorizador]?.[
              nameSubModule
            ];
          let backend: any;
          if (operadorSubModule?.backend_default === false) {
            if (backend_default !== undefined) {
              backend = backend_default;
              backend_validate =
                backend_default.name
                  .toLowerCase()
                  .search(operador.autorizador) <= 0
                  ? false
                  : true;
            } else {
              backend = serviciosBackendAutorizadoresDefault[nameSubModule];
            }
          } else {
            backend = serviciosBackendAutorizadoresDefault[nameSubModule];
          }
          let permission: number[];
          if (operadorSubModule?.permission !== undefined) {
            permission = operadorSubModule?.permission;
          } else {
            permission = permissionAutorizadoresDefault[nameSubModule];
          }

          //evaluar si el usuario tiene los permisos
          const userPermissions_: any = userPermissions;

          const permissionsAccess = userPermissions_?.find(
            ({ id_permission }: { id_permission: number }) =>
              permission.find((value: number) => value === id_permission)
          );

          if (permissionsAccess !== undefined && backend_validate === true) {
            operadoresComponent.push({
              autorizador: operador?.autorizador ?? "desconocido",
              name: operador?.front_name ?? "desconocido",
              logo: operador?.front_logo ?? "desconocido",
              backend: backend,
              permission: permission,
              parameters_operador: operador?.parameters ?? {},
              parameters_submodule: operadorSubModule?.parameters ?? {},
            });
          }

          if (permissionsAccess !== undefined && backend_validate === false) {
            console.error("Error respuesta Front-end PDP", {
              "Error PDP": errorFront_servicio,
              "Error Sequence": "El autorizador no coincide con el backend",
              "Error Console": `Custom - El autorizador ${operador.autorizador} no coincide con el backend asignado ${backend_default.name}`,
            });
          }
        });
      } catch (error: any) {
        if (!(error instanceof ErrorCustomFetch)) {
          throw new ErrorCustomUseHookCode(
            errorFront_servicio,
            error.message,
            `${nameHook} - obtener el backend de cada operador segun sea el caso`
          );
        }
        throw error;
      }
      setStatePeticion(false);
      return operadoresComponent;
    } catch (error: any) {
      if (!(error instanceof ErrorCustomFetch)) {
        throw new ErrorCustomUseHookCode(
          errorFront_servicio,
          error.message,
          `${nameHook} - error sin controlar en el hook`
        );
      }
      setStatePeticion(false);
      throw error;
    }
  }, [nameSubModule, userPermissions]);

  return [statePeticion, peticionOperadoresComponent] as const;
};

export default useHookFetchLayouts;
