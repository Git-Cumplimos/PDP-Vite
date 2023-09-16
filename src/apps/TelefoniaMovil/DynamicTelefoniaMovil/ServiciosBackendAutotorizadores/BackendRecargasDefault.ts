import { useCallback, useState } from "react";
import {
  TypeInputPromisesRecargas,
  TypeOutputDataRecargas,
} from "../TypeDinamic";
import {
  ErrorCustomApiGatewayTimeout,
  ErrorCustomFetch,
  ErrorCustomUseHookCode,
  ParamsError,
  fetchCustom,
  descriptionErrorFront,
  ErrorCustomBackend,
} from "../utils/utils";
import { sleep, useTimerCustom } from "./utils";
import { urlRecargasDefault } from "../urls";

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

export const useBackendRecargasDefault = (
  name_operador: string,
  autorizador: string,
  module_: string
) => {
  const hook_name = useBackendRecargasDefault.name;
  const [statePeticion, setStatePeticion] = useState<boolean>(false);
  const [startTimer, stopTimer] = useTimerCustom();

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
      const function_name = CyclePeticionConsultaTimeout.name;
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
            if (error.res_error_msg === undefined) throw error;
            if (!Object.keys(error.res_error_msg).includes("error_pending_trx"))
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
            error.res_error_msg
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
      cant: number
    ): Promise<any> => {
      let response;
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

        let paso_next_input_: any = {
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
        let body_ = {
          ...body,
          paso_next_input: paso_next_input_,
          ids: response?.obj?.ids,
        };

        response = await CyclePeticion(
          suburl,
          response?.obj?.paso_next_output?.referencia,
          name,
          params,
          body_,
          seconds,
          cant
        );
        return response;
      } catch (error: any) {
        let peticionConsultaTimeout = false;
        if (error instanceof ErrorCustomApiGatewayTimeout) {
          peticionConsultaTimeout = true;
        } else if (error instanceof ErrorCustomBackend) {
          if (error.res_error_msg !== undefined) {
            if (
              Object.keys(error.res_error_msg).includes(
                "error_make_send_timeout"
              )
            ) {
              peticionConsultaTimeout = true;
            }
          }
        }
        if (peticionConsultaTimeout === true) {
          response = await CyclePeticionConsultaTimeout(
            suburl,
            "DEFAULT_CONSULT_TIMEOUT",
            name,
            params,
            body,
            seconds,
            cant
          );
          return response;
        } else if (
          peticionConsultaTimeout === false &&
          error instanceof ErrorCustomBackend
        ) {
          throw new ErrorCustomBackend(
            error.error_msg_front,
            error.error_msg_console,
            error.error_msg_sequence,
            "notifyError",
            false,
            error.res_error_msg
          );
        }
        console.log(error);
        throw error;
      }
    },
    [CyclePeticionConsultaTimeout]
  );

  const PeticionRecargar = useCallback(
    async (
      dataInputPromises: TypeInputPromisesRecargas
    ): Promise<TypeOutputDataRecargas> => {
      let response: TypeOutputDataRecargas = {
        status: false,
        id_trx: null,
        ticket: null,
      };
      let fetchResult;
      const name_service = `Telefonia movil - ${autorizador} - ${module_}`;

      setStatePeticion(true);

      // //?-----Iniciar intervalo para la alertas del usuario debido a la demora de la transaccion
      startTimer();
      // //?--------------------------------------------------------------------

      try {
        const params = {
          operador: name_operador,
        };
        const tipo_comercio = dataInputPromises.roleInfo?.tipo_comercio ?? "h";
        const body = {
          ids: {
            autorizador: {
              id_uuid_trx: dataInputPromises.id_uuid,
            },
          },
          comercio: {
            id_comercio: dataInputPromises.roleInfo?.id_comercio ?? 123,
            id_terminal: dataInputPromises.roleInfo?.id_dispositivo ?? 1,
            id_usuario: dataInputPromises.roleInfo?.id_usuario ?? 1,
            nombre_comercio:
              dataInputPromises.roleInfo?.["nombre comercio"] ?? "rr",
            nombre_usuario: dataInputPromises.pdpUser?.uname ?? "",
            oficina_propia:
              tipo_comercio.search("KIOSCO") >= 0 ||
              tipo_comercio.search("OFICINAS PROPIAS") >= 0
                ? true
                : false,
            location: {
              address: dataInputPromises.roleInfo.direccion ?? "",
              city: dataInputPromises.roleInfo.ciudad ?? "",
              code_dane: dataInputPromises.roleInfo.codigo_dane ?? 1,
            },
          },
          module_info: {
            celular: dataInputPromises.moduleInfo.celular,
            valor_total_trx: dataInputPromises.moduleInfo.valor_total_trx,
          },
          parameters_operador: dataInputPromises.parameters_operador,
          parameters_submodule: dataInputPromises.parameters_submodule,
        };

        fetchResult = await CyclePeticion(
          `${urlRecargasDefault}/${autorizador}/${module_}`,
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
        setStatePeticion(false);
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
      setStatePeticion(false);
      stopTimer();
      return response;
    },
    [autorizador, module_, name_operador, startTimer, stopTimer, CyclePeticion]
  );

  return [statePeticion, PeticionRecargar] as const;
};
