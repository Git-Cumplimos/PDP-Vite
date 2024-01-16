import { useCallback, useState } from "react";
import {
  TypeInputDataGetPaquetes,
  TypeInputTrxPaquetes,
  TypeOutputDataGetPaquetes,
  TypeOutputTrxPaquetes,
  TypeInputDataGetPaquetesFilters,
} from "../../DynamicTelefoniaMovil/TypeDinamic";
import {
  ErrorCustomApiGatewayTimeout,
  ErrorCustomBackend,
  ErrorCustomBackendPendingTrx,
  ErrorCustomFetch,
  ErrorCustomUseHookCode,
  ParamsError,
  descriptionErrorFront,
  fetchCustom,
} from "../utils/fetchUtils";
import { sleep, useTimerCustom } from "./utils";
import { urlPaquetesDefault } from "../urls";

const customParamsErrorCyclePeticion: ParamsError = {
  errorCustomApiGatewayTimeout: {
    typeNotify: "notifyError",
    ignoring: true,
  },
  errorCustomBackend: {
    typeNotify: "notifyError",
    ignoring: true,
  },
};

const customParamsErrorConsultaTimeout: ParamsError = {
  errorCustomBackend: {
    typeNotify: "notifyError",
    ignoring: true,
  },
};

type TypingOutputGetStatusCycleConsultTrx = {
  status: boolean;
  error: any;
};

const get_status_cycle_consult_trx = (
  error_: any,
  id_trx_: number | null,
  error_previous_: { [key: string]: boolean } | null
): TypingOutputGetStatusCycleConsultTrx => {
  const function_name = "get_status_cycle_consult_trx";
  const status_cycle_consult_trx = {
    status: false,
    error: error_,
  };
  let error_msg_equal = undefined;
  if (error_ instanceof ErrorCustomApiGatewayTimeout) {
    status_cycle_consult_trx.status = true;
  } else if (error_ instanceof ErrorCustomBackend) {
    if (error_.res_obj !== undefined) {
      if (
        Object.keys(error_.res_obj?.error_msg ?? {}).includes(
          "error_make_send_timeout"
        )
      ) {
        status_cycle_consult_trx.status = true;
      } else {
        const error_previous: { [key: string]: boolean } =
          error_previous_ !== null ? error_previous_ : {};
        error_msg_equal = Object.keys(error_.res_obj?.error_msg ?? {}).find(
          (error_msg_name: string) =>
            Object.keys(error_previous).find(
              (value: string) => value === error_msg_name
            )
        );
        if (error_msg_equal !== undefined) {
          if (
            error_.res_obj?.ids?.autorizador?.id_trx !== undefined &&
            error_.res_obj?.ids?.autorizador?.id_trx !== null
          ) {
            id_trx_ = error_.res_obj?.ids?.autorizador?.id_trx;
          }
          if (error_previous[error_msg_equal] === true) {
            status_cycle_consult_trx.status = true;
          } else {
            status_cycle_consult_trx.error = new ErrorCustomBackendPendingTrx(
              `${function_name} - throw custom`,
              error_.res_obj,
              id_trx_
            );
          }
        }
      }
    }
  }

  if (
    status_cycle_consult_trx.status === false &&
    error_msg_equal === undefined &&
    error_ instanceof ErrorCustomBackend
  ) {
    status_cycle_consult_trx.error = new ErrorCustomBackend(
      error_.error_msg_front,
      error_.error_msg_console,
      error_.error_msg_sequence,
      "notifyError",
      false,
      true,
      error_.res_obj
    );
  }
  return status_cycle_consult_trx;
};

export const useBackendPaquetesDefault = (
  name_operador: string,
  autorizador: string,
  module_: string
) => {
  const hook_name = "useBackendPaquetesDefaul";
  const name_service = `Telefonia movil - ${autorizador} - ${module_}`;
  const [loadingPeticionGetPaquetes, setLoadingPeticionGetPaquetes] =
    useState<boolean>(false);
  const [loadingPeticionTrx, setLoadingPeticionTrx] = useState<boolean>(false);
  const [startTimer, stopTimer] = useTimerCustom();

  const PeticionGetPaquetes = useCallback(
    async (
      dataInputPromises: TypeInputDataGetPaquetes
    ): Promise<TypeOutputDataGetPaquetes> => {
      setLoadingPeticionGetPaquetes(true);
      let response: TypeOutputDataGetPaquetes = {
        maxPages: 1,
        results: [],
      };
      try {
        const params = {
          operador: name_operador,
        };
        const module_info: TypeInputDataGetPaquetesFilters = {
          limit: dataInputPromises.moduleInfo.limit,
          page: dataInputPromises.moduleInfo.page,
        };
        if (dataInputPromises.moduleInfo.codigo) {
          module_info.codigo = dataInputPromises.moduleInfo.codigo;
        }
        if (dataInputPromises.moduleInfo.tipo) {
          module_info.tipo = dataInputPromises.moduleInfo.tipo;
        }
        if (dataInputPromises.moduleInfo.descripcion_corta) {
          module_info.descripcion_corta =
            dataInputPromises.moduleInfo.descripcion_corta;
        }
        if (dataInputPromises.moduleInfo.valor) {
          module_info.valor = dataInputPromises.moduleInfo.valor;
        }

        const body = {
          module_info: module_info,
          parameters_operador: dataInputPromises.parameters_operador,
          parameters_submodule: dataInputPromises.parameters_submodule,
        };
        const responseFetch = await fetchCustom(
          `${urlPaquetesDefault}/${autorizador}/${module_}/get_paquetes`,
          "PUT",
          name_service,
          params,
          body
        );
        response = {
          maxPages: responseFetch?.obj?.result?.maxPages ?? 1,
          results: responseFetch?.obj?.result?.paquetes ?? [],
        };
      } catch (error: any) {
        setLoadingPeticionGetPaquetes(false);
        throw error;
      }
      setLoadingPeticionGetPaquetes(false);
      return response;
    },
    [name_operador, autorizador, module_, name_service]
  );

  const CyclePeticionConsultaTimeout = useCallback(
    async (
      suburl: string,
      referencia: string,
      name: string,
      params: { [key: string]: any },
      body: { [key: string]: any },
      seconds: number,
      cant: number
    ): Promise<any> => {
      const function_name = "CyclePeticionConsultaTimeout";
      try {
        let response;
        let countTimerInterval = 0;
        const timerInterval = setInterval(
          () => (countTimerInterval += 1),
          1000
        );
        for (let i = 1; i <= cant; i++) {
          try {
            response = await fetchCustom(
              `${suburl}/${referencia}`,
              "PUT",
              name,
              params,
              body,
              customParamsErrorConsultaTimeout
            );
            clearInterval(timerInterval); //reiniciar contador
            break;
          } catch (error: any) {
            clearInterval(timerInterval); //reiniciar contador
            if (!(error instanceof ErrorCustomBackend)) throw error;
            if (error.res_obj === undefined) throw error;
            if (
              !Object.keys(error.res_obj?.error_msg ?? {}).includes(
                "error_pending_trx"
              )
            )
              throw error;
            if (i >= cant) throw error;
            if (seconds - countTimerInterval > 0) {
              await sleep(seconds - countTimerInterval);
            }
          }
        }
        return response;
      } catch (error: any) {
        if (error instanceof ErrorCustomFetch) {
          throw new ErrorCustomBackend(
            error.error_msg_front,
            error.error_msg_console,
            `${hook_name} - ${function_name} - ultima consulta`,
            "notifyError",
            false,
            false,
            error.res_obj
          );
        }
        if (!(error instanceof ErrorCustomFetch)) {
          throw new ErrorCustomUseHookCode(
            descriptionErrorFront.replace("%s", name),
            error.message,
            "useBackendRecargasDefault - PeticionConsultaTimeout - realizar ciclo de peticiones de consultas timeout"
          );
        }
        throw error;
      }
    },
    [hook_name]
  );

  const CyclePeticion = useCallback(
    async (
      suburl: string,
      referencia: string,
      name: string,
      params: { [key: string]: any },
      body: { [key: string]: any },
      seconds: number,
      cant: number,
      id_trx: number | null = null,
      error_previous: { [key: string]: boolean } | null = null
    ): Promise<any> => {
      let response;
      let body_ = { ...body };
      try {
        response = await fetchCustom(
          `${suburl}/${referencia}`,
          "PUT",
          name,
          params,
          body,
          customParamsErrorCyclePeticion
        );

        if (response?.obj?.paso_next_output === null) {
          return response;
        }

        error_previous = response?.obj?.paso_next_output?.error_next ?? null;
        id_trx = response?.obj?.ids?.autorizador?.id_trx ?? null;

        let paso_next_input_ = {};
        if (
          response?.obj?.paso_next_output?.inf !== undefined &&
          response?.obj?.paso_next_output?.inf !== null
        )
          paso_next_input_ = {
            ...paso_next_input_,
            inf: response?.obj?.paso_next_output?.inf,
          };

        if (
          response?.obj?.paso_next_output?.cant !== undefined &&
          response?.obj?.paso_next_output?.time !== undefined
        ) {
          paso_next_input_ = {
            ...paso_next_input_,
            cant: response?.obj?.paso_next_output?.cant,
            time: response?.obj?.paso_next_output?.time,
          };
        }
        body_ = {
          ...body_,
          ids: response?.obj?.ids,
        };
        if (Object.keys(paso_next_input_).length > 0) {
          body_ = {
            ...body_,
            paso_next_input: paso_next_input_,
          };
        }
        response = await CyclePeticion(
          suburl,
          response?.obj?.paso_next_output?.referencia,
          name,
          params,
          body_,
          seconds,
          cant,
          id_trx,
          error_previous
        );
        return response;
      } catch (error: any) {
        const status_cycle_consult_trx: TypingOutputGetStatusCycleConsultTrx =
          get_status_cycle_consult_trx(error, id_trx, error_previous);
        if (status_cycle_consult_trx.status === true) {
          response = await CyclePeticionConsultaTimeout(
            suburl,
            "DEFAULT_CONSULT_TIMEOUT",
            name,
            params,
            body_,
            seconds,
            cant
          );
          return response;
        }
        throw status_cycle_consult_trx.error;
      }
    },
    [CyclePeticionConsultaTimeout]
  );

  const PeticionTrx = useCallback(
    async (
      dataInputPromises: TypeInputTrxPaquetes
    ): Promise<TypeOutputTrxPaquetes> => {
      let response: TypeOutputTrxPaquetes = {
        status: false,
        id_trx: null,
        ticket: null,
      };
      let fetchResult;
      setLoadingPeticionTrx(true);
      startTimer(); //Iniciar intervalo para la alertas del usuario debido a la demora de la transaccion

      try {
        const params = {
          operador: name_operador,
        };
        const tipo_comercio = dataInputPromises.roleInfo?.tipo_comercio ?? "";
        const body = {
          ids: {
            autorizador: {
              id_uuid_trx: dataInputPromises.id_uuid,
            },
          },
          comercio: {
            id_comercio: dataInputPromises.roleInfo?.id_comercio ?? 0,
            id_terminal: dataInputPromises.roleInfo?.id_dispositivo ?? 0,
            id_usuario: dataInputPromises.roleInfo?.id_usuario ?? 0,
            nombre_comercio:
              dataInputPromises.roleInfo?.["nombre comercio"] ?? "r",
            nombre_usuario: dataInputPromises.pdpUser?.uname ?? "",
            oficina_propia:
              tipo_comercio.search("KIOSCO") >= 0 ||
              tipo_comercio.search("OFICINAS PROPIAS") >= 0
                ? true
                : false,
            location: {
              address: dataInputPromises.roleInfo.direccion ?? "",
              city: dataInputPromises.roleInfo.ciudad ?? "",
              code_dane: dataInputPromises.roleInfo.codigo_dane ?? 0,
            },
          },
          module_info: {
            celular: dataInputPromises.moduleInfo.celular,
            valor_total_trx: dataInputPromises.moduleInfo.valor_total_trx,
            paquete: {
              codigo: dataInputPromises.moduleInfo.paquete.codigo,
              nombre: dataInputPromises.moduleInfo.paquete.nombre,
              tipo: dataInputPromises.moduleInfo.paquete.tipo,
              descripcion_corta:
                dataInputPromises.moduleInfo.paquete.descripcion_corta,
            },
          },
          parameters_operador: dataInputPromises.parameters_operador ?? {},
          parameters_submodule: dataInputPromises.parameters_submodule ?? {},
        };

        fetchResult = await CyclePeticion(
          `${urlPaquetesDefault}/${autorizador}/${module_}`,
          "default",
          name_service,
          params,
          body,
          dataInputPromises?.parameters_submodule?.seconds ?? 20,
          dataInputPromises?.parameters_submodule?.cant ?? 5
        );
        response = {
          status: fetchResult?.status ?? true,
          id_trx: fetchResult?.obj?.ids?.autorizador?.id_trx ?? null,
          ticket: fetchResult?.obj?.result?.ticket ?? null,
        };
      } catch (error: any) {
        setLoadingPeticionTrx(false);
        stopTimer();
        if (!(error instanceof ErrorCustomFetch)) {
          throw new ErrorCustomUseHookCode(
            descriptionErrorFront.replace("%s", name_service),
            error.message,
            "useBackendRecargasDefault - realizar ciclo de peticiones"
          );
        }
        throw error;
      }
      setLoadingPeticionTrx(false);
      stopTimer();
      return response;
    },
    [
      autorizador,
      module_,
      name_operador,
      startTimer,
      stopTimer,
      CyclePeticion,
      name_service,
    ]
  );

  return [
    loadingPeticionGetPaquetes,
    PeticionGetPaquetes,
    loadingPeticionTrx,
    PeticionTrx,
  ] as const;
};
