import { useCallback, useState } from "react";
import {
  ParamsError,
  fetchCustom,
  FuctionEvaluateResponse,
  defaultParamsError,
} from "../../DynamicTelefoniaMovil/utils/utils";
import {
  TypeInputPromisesRecargas,
  TypeOutputDataRecargas,
} from "../../DynamicTelefoniaMovil/TypeDinamic";
import { notify } from "../../../../utils/notify";
import { FuctionEvaluateResponseMovistar } from "./utilsMovistar";

const url_trx_recarga = `${process.env.REACT_APP_URL_MOVISTAR}/servicio-recargas/metodo1/trx-recarga`;
const url_consulta_recarga = `${process.env.REACT_APP_URL_MOVISTAR}/servicio-recargas/metodo1/consulta-recarga`;
const trxParamsError: ParamsError = {
  errorFetchCustomCode: {
    typeNotify: "notifyError",
    ignoring: false,
  },
  errorFetchCustomApiGateway: {
    typeNotify: "notifyError",
    ignoring: false,
  },
  errorFetchCustomApiGatewayTimeout: {
    typeNotify: undefined,
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

const sleep = (millisecons: number) => {
  return new Promise((resolve) => setTimeout(resolve, millisecons));
};

export const useBackendRecargasMovistar = (
  name_operador: string,
  module: string
) => {
  const [statePeticion, setStatePeticion] = useState(false);
  const PeticionRecargar = async (
    dataInputPromises: TypeInputPromisesRecargas
  ): Promise<TypeOutputDataRecargas> => {
    let fetchPaso1Result;
    let fetchPaso2Result;
    let fetchPaso3Result;
    let banderaFetchPaso2 = false;
    let banderaFetchPaso3 = false;
    let id_trx = null;
    let id_movistar = null;
    let response = {
      status: false,
      ticket: {},
    };
    setStatePeticion(true);
    //?-----Iniciar intervalo para la alertas del usuario debido a la demora de la transaccion
    let cantTimerInterval = 0;
    let timerInterval = setInterval(() => {
      cantTimerInterval += 1;
      switch (cantTimerInterval) {
        case 1:
          notify(
            "Estamos procesando la transacción, puede tardar hasta 50 segundos"
          );
          break;
        case 3:
          notify("Continuamos procesando la transacción, por favor esperar");
          break;
        default:
          if (cantTimerInterval >= 5) {
            notify(
              "Se prolongó el proceso de la transacción, por favor esperar"
            );
            break;
          }
      }
    }, 10000);
    //?--------------------------------------------------------------------
    //SECUENCIA ---------------Paso 1-------------------------------
    try {
      const tipo_comercio = dataInputPromises.roleInfo.tipo_comercio;
      let bodyPaso1 = {
        celular: dataInputPromises.moduleInfo.celular,
        valor: dataInputPromises.moduleInfo.valor_total_trx,
        id_comercio: dataInputPromises.roleInfo.id_comercio,
        tipo_comercio:
          tipo_comercio.search("KIOSCO") >= 0
            ? "OFICINAS PROPIAS"
            : tipo_comercio,
        id_terminal: dataInputPromises.roleInfo.id_dispositivo,
        id_usuario: dataInputPromises.roleInfo.id_usuario,
        direccion: dataInputPromises.roleInfo.direccion,
        ciudad: dataInputPromises.roleInfo.ciudad,
        codigo_dane: dataInputPromises.roleInfo.codigo_dane,
        nombre_comercio: dataInputPromises.roleInfo["nombre comercio"],
        nombre_usuario: dataInputPromises.pdpUser.uname,
        bool_ticket: true,
      };
      fetchPaso1Result = await fetchCustom(
        url_trx_recarga,
        "POST",
        `${name_operador} - registrar`,
        {},
        bodyPaso1,
        trxParamsError,
        FuctionEvaluateResponseMovistar
      );
    } catch (error: any) {
      banderaFetchPaso2 = true;
      if (error.name === "ErrorCustomTimeout") {
        banderaFetchPaso3 = true;
      } else {
        clearInterval(timerInterval); //reiniciar contador
        setStatePeticion(false);
        throw error;
      }
    }
    //SECUENCIA ---------------Paso 2-------------------------------
    if (!banderaFetchPaso2) {
      try {
        id_trx = fetchPaso1Result?.obj?.result?.id_trx;
        id_movistar = fetchPaso1Result?.obj?.result?.id_movistar;
        let bodyPaso2 = {
          celular: dataInputPromises.moduleInfo.celular,
          valor: dataInputPromises.moduleInfo.valor_total_trx,
          id_comercio: dataInputPromises.roleInfo.id_comercio,
          id_terminal: dataInputPromises.roleInfo.id_dispositivo,
          id_usuario: dataInputPromises.roleInfo.id_usuario,
          id_trx: id_trx,
          id_movistar: id_movistar,
          nombre_comercio: dataInputPromises.roleInfo["nombre comercio"],
          nombre_usuario: dataInputPromises.pdpUser.uname,
          bool_ticket: true,
        };
        fetchPaso2Result = await fetchCustom(
          url_trx_recarga,
          "PUT",
          `${name_operador} - modificar`,
          {},
          bodyPaso2,
          trxParamsError,
          FuctionEvaluateResponseMovistar
        );
        response = {
          status: fetchPaso2Result?.status,
          ticket: JSON.parse(fetchPaso2Result?.obj?.result?.ticket),
        };
      } catch (error: any) {
        if (error.name === "ErrorCustomTimeout") {
          banderaFetchPaso3 = true;
        } else {
          clearInterval(timerInterval); //reiniciar contador
          setStatePeticion(false);
          throw error;
        }
      }
    }
    //SECUENCIA ---------------Paso 3-------------------------------
    if (banderaFetchPaso3) {
      //esperar un tiempo
      await sleep(15000);
      //realizar peticion de consulta
      try {
        if (id_trx == null) {
          id_trx = fetchPaso2Result?.obj?.result?.id_trx;
        }
        if (id_movistar == null) {
          id_movistar = fetchPaso2Result?.obj?.result?.id_movistar;
        }
        let body_consulta = {
          reason: "timeout api gateway",
          id_comercio: dataInputPromises.roleInfo.id_comercio,
          id_terminal: dataInputPromises.roleInfo.id_dispositivo,
          id_usuario: dataInputPromises.roleInfo.id_usuario,
          id_trx: id_trx,
          id_movistar: id_movistar,
        };
        fetchPaso3Result = await fetchCustom(
          url_consulta_recarga,
          "PUT",
          `${name_operador} - consultar`,
          {},
          body_consulta,
          defaultParamsError,
          (peticion_: any, name_: string, error_: ParamsError) => {
            return peticion_;
          }
        );
      } catch (error) {
        clearInterval(timerInterval);
        setStatePeticion(false);
        throw error;
      }
      //evaluar respuesta de la consulta
      try {
        const analysis = FuctionEvaluateResponse(
          fetchPaso3Result?.obj?.result?.result_trx,
          `${name_operador} - analizar`,
          defaultParamsError
        );
        response = {
          status: analysis?.status,
          ticket: analysis?.obj?.result?.ticket,
        };
      } catch (error) {
        clearInterval(timerInterval);
        setStatePeticion(false);
        throw error;
      }
    }
    clearInterval(timerInterval);
    setStatePeticion(false);
    return response;
  };

  return [statePeticion, PeticionRecargar];
};
