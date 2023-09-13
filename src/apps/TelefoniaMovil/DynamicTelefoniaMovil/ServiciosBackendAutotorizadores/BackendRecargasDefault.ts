import { useState } from "react";
import {
  TypeInputPromisesRecargas,
  TypeOutputDataRecargas,
} from "../TypeDinamic";
import {
  ErrorCustomApiGatewayTimeout,
  ParamsError,
  fetchCustom,
} from "../utils/utils";
import { notify } from "../../../../utils/notify";

const urlRecargasDefault = `http://127.0.0.1:5000/backend-telefonia-movil_broker/manege`;

const customParamsError: ParamsError = {
  errorFetchCustomCode: {
    typeNotify: "notifyError",
    ignoring: false,
  },
  errorFetchCustomApiGateway: {
    typeNotify: undefined,
    ignoring: false,
  },
  errorFetchCustomApiGatewayTimeout: {
    typeNotify: "notifyError",
    ignoring: true,
  },
  errorFetchCustomBackend: {
    typeNotify: "notifyError",
    ignoring: false,
  },
  errorFetchCustomBackendUser: {
    typeNotify: "notify",
    ignoring: true,
  },
};

const sleep = (seconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

export const useBackendRecargasDefault = (
  name_operador: string,
  autorizador: string,
  module_: string
) => {
  const [statePeticion, setStatePeticion] = useState<boolean>(false);
  const [countTimerInterval, setCountTimerInterval] = useState<number>(0);

  const PeticionRecargar = async (
    dataInputPromises: TypeInputPromisesRecargas
  ): Promise<TypeOutputDataRecargas> => {
    let response = {
      status: false,
      ticket: {},
    };
    let fetchResult;

    setStatePeticion(true);

    // //?-----Iniciar intervalo para la alertas del usuario debido a la demora de la transaccion

    const timeSegNotify = dataInputPromises?.parameters_submodule?.time ?? 5;
    let cantTimerInterval = 0;
    // let timerInterval = setInterval(() => {
    //   cantTimerInterval += 1;
    //   if (cantTimerInterval <= 1) {
    //     notify(
    //       "Estamos procesando la transacción, puede tardar hasta 2 minutos"
    //     );
    //   } else if (cantTimerInterval > 1 && cantTimerInterval <= 4) {
    //     notify("Se prolongó el proceso de la transacción, por favor esperar");
    //   } else {
    //     notify("Se prolongó el proceso de la transacción, por favor esperar");
    //   }
    // }, 15000);
    // let prueba = setTimeout(() => {
    //   console.log("rrr");
    //   clearInterval(timerInterval); //reiniciar contador
    //   clearTimeout(prueba);
    // }, 120000);
    // console.log("PPPPl");
    // //?--------------------------------------------------------------------

    try {
      const params = {
        operador: name_operador,
      };
      const tipo_comercio = dataInputPromises.roleInfo.tipo_comercio;
      const body = {
        // ids: {
        //   autorizador: { id_uuid_trx: dataInputPromises.id_uuid },
        // },
        ids: {
          autorizador: {
            id_uuid_trx: dataInputPromises.id_uuid,
            id_trx: 291370,
            id_movistar: 291370,
          },
        },
        comercio: {
          id_comercio: dataInputPromises.roleInfo.id_comercio,
          id_terminal: dataInputPromises.roleInfo.id_dispositivo,
          id_usuario: dataInputPromises.roleInfo.id_usuario,
          nombre_comercio: dataInputPromises.roleInfo["nombre comercio"],
          nombre_usuario: dataInputPromises.pdpUser?.uname,
          oficina_propia:
            tipo_comercio.search("KIOSCO") >= 0 ||
            tipo_comercio.search("OFICINAS PROPIAS") >= 0
              ? true
              : false,
          location: {
            address: dataInputPromises.roleInfo.direccion,
            city: dataInputPromises.roleInfo.ciudad,
            code_dane: dataInputPromises.roleInfo.codigo_dane,
          },
        },
        module_info: {
          celular: dataInputPromises.moduleInfo.celular,
          valor_total_trx: dataInputPromises.moduleInfo.valor_total_trx,
        },
        parameters_operador: dataInputPromises.parameters_operador,
        parameters_submodule: dataInputPromises.parameters_submodule,
      };

      fetchResult = await PeticionInd(
        `${urlRecargasDefault}/${autorizador}/${module_}`,
        "default",
        `Telefonia movil - ${autorizador} - ${module}`,
        params,
        body
      );
      response = {
        status: fetchResult?.status ?? true,
        ticket: fetchResult?.obj?.result?.ticket ?? {},
      };
    } catch (error: any) {
      setStatePeticion(false);
      // clearInterval(timerInterval); //reiniciar contador
      throw error;
    }
    setStatePeticion(false);
    // clearInterval(timerInterval); //reiniciar contador
    return response;
  };

  const PeticionInd = async (
    suburl: string,
    referencia: string,
    name: string,
    params: { [key: string]: any },
    body: { [key: string]: any }
  ): Promise<any> => {
    let response;
    try {
      throw new ErrorCustomApiGatewayTimeout(
        `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name}) [0010002]`,
        "apap",
        `evaluar respuesta de api gateway`
      );
      response = await fetchCustom(
        `${suburl}/${referencia}`,
        "PUT",
        name,
        params,
        body,
        customParamsError
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

      response = await PeticionInd(
        suburl,
        response?.obj?.paso_next_output?.referencia,
        name,
        params,
        body_
      );
      return response;
    } catch (error: any) {
      if (error instanceof ErrorCustomApiGatewayTimeout) {
        response = await PeticionConsultaTimeout(
          suburl,
          "DEFAULT_CONSULT_TIMEOUT",
          name,
          params,
          body,
          2000,
          1
        );
      }

      throw error;
    }
  };

  const PeticionConsultaTimeout = async (
    suburl: string,
    referencia: string,
    name: string,
    params: { [key: string]: any },
    body: { [key: string]: any },
    time: number,
    cant: number
  ): Promise<any> => {
    try {
      const timerInterval = setInterval(
        () => setCountTimerInterval((old) => old + 1),
        1000
      );

      let response = await fetchCustom(
        `${suburl}/${referencia}`,
        "PUT",
        name,
        params,
        body,
        customParamsError
      );
      clearInterval(timerInterval); //reiniciar contador
      console.log(time - countTimerInterval);
      if (time - countTimerInterval > 0) {
        await sleep(time - countTimerInterval);
        setCountTimerInterval(0);
      }
      return response;
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

      response = await PeticionInd(
        suburl,
        response?.obj?.paso_next_output?.referencia,
        name,
        params,
        body_
      );
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  return [statePeticion, PeticionRecargar];
};
