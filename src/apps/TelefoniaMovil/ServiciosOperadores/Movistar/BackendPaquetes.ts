import { useCallback, useState } from "react";
import {
  ParamsError,
  fetchCustom,
  FuctionEvaluateResponse,
  defaultParamsError,
} from "../../DynamicTelefoniaMovil/utils/utils";
import {
  TypeInputDataGetPaquetes,
  TypeInputTrxPaquetes,
  TypeOutputDataGetPaquetes,
  TypeOutputTrxPaquetes,
} from "../../DynamicTelefoniaMovil/TypeDinamic";
import { notify } from "../../../../utils/notify";
import {
  FuctionEvaluateResponseMovistar,
  trxParamsError,
} from "./utilsMovistar";

const url_get_paquetes = `${process.env.REACT_APP_URL_MOVISTAR}/servicio-compra-paquetes/get-paquetes`;
const url_trx_compra_paquete = `${process.env.REACT_APP_URL_MOVISTAR}/servicio-compra-paquetes/metodo1/trx-compra-paquete`;
// const trxParamsError: ParamsError = {
//   errorFetchCustomCode: {
//     typeNotify: "notifyError",
//     ignoring: false,
//   },
//   errorFetchCustomApiGateway: {
//     typeNotify: "notifyError",
//     ignoring: false,
//   },
//   errorFetchCustomApiGatewayTimeout: {
//     typeNotify: undefined,
//     ignoring: true,
//   },
//   errorFetchCustomBackend: {
//     typeNotify: "notifyError",
//     ignoring: false,
//   },
//   errorFetchCustomBackendUser: {
//     typeNotify: "notify",
//     ignoring: true,
//   },
// };

const sleep = (millisecons: number) => {
  return new Promise((resolve) => setTimeout(resolve, millisecons));
};

export const useBackendPaquetesMovistar = (
  name_operador: string,
  module: string
) => {
  const [loadingPeticion, setLoadingPeticion] = useState({
    getPaquetes: false,
    trx: false,
  });

  const PeticionGetPaquetes = useCallback(
    async (
      dataInput: TypeInputDataGetPaquetes
    ): Promise<TypeOutputDataGetPaquetes> => {
      let fetchGetPaquetesResult;
      let response: TypeOutputDataGetPaquetes = {
        maxPages: 1,
        results: [],
      };
      //SECUENCIA ---------------Paso 1-------------------------------
      try {
        setLoadingPeticion((old) => ({ ...old, getPaquetes: true }));

        const params = {
          page: dataInput.moduleInfo.page,
          limit: dataInput.moduleInfo.limit,
        };
        fetchGetPaquetesResult = await fetchCustom(
          url_get_paquetes,
          "GET",
          `${name_operador} - consultar paquetes`,
          params
        );

        const data = fetchGetPaquetesResult?.obj?.result?.results;
        const results = data?.map((info_: any) => {
          return {
            codigo: info_?.codigodelaoferta,
            tipo: info_?.tipodeoferta,
            descripcion: info_?.descripcioncorta,
            valor: info_?.valordelaoferta,
            additional: { ...info_ },
          };
        });

        response = {
          maxPages: fetchGetPaquetesResult?.obj?.result?.maxPages,
          results: results,
        };
      } catch (error: any) {
        setLoadingPeticion((old) => ({ ...old, getPaquetes: false }));
        throw error;
      }
      setLoadingPeticion((old) => ({ ...old, getPaquetes: false }));
      return response;
    },
    [name_operador]
  );

  const PeticionTrx = useCallback(
    async (dataInput: TypeInputTrxPaquetes): Promise<TypeOutputTrxPaquetes> => {
      let fetchPaso1Result;
      let fetchPaso2Result;
      let fetchPaso3Result;
      let banderaFetchPaso2 = false;
      let banderaFetchPaso3 = false;
      let id_trx = null;
      let id_movistar = null;
      let response = {
        status: false,
        id_trx: null,
        ticket: null,
      };
      setLoadingPeticion((old) => ({ ...old, trx: true }));
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
        const tipo_comercio = dataInput.roleInfo.tipo_comercio;
        let bodyPaso1 = {
          celular: dataInput.moduleInfo.celular,
          valor: dataInput.moduleInfo.valor_total_trx,
          codigodelaoferta: dataInput.moduleInfo.paquete.codigo,
          id_comercio: dataInput.roleInfo.id_comercio,
          tipo_comercio:
            tipo_comercio.search("KIOSCO") >= 0
              ? "OFICINAS PROPIAS"
              : tipo_comercio,
          id_terminal: dataInput.roleInfo.id_dispositivo,
          id_usuario: dataInput.roleInfo.id_usuario,
          direccion: dataInput.roleInfo.direccion,
          ciudad: dataInput.roleInfo.ciudad,
          codigo_dane: dataInput.roleInfo.codigo_dane,
          nombre_comercio: dataInput.roleInfo["nombre comercio"],
          nombre_usuario: dataInput.pdpUser.uname,
          bool_ticket: true,
        };
        fetchPaso1Result = await fetchCustom(
          url_trx_compra_paquete,
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
          setLoadingPeticion((old) => ({ ...old, trx: false }));
          throw error;
        }
      }
      //SECUENCIA ---------------Paso 2-------------------------------
      if (!banderaFetchPaso2) {
        try {
          id_trx = fetchPaso1Result?.obj?.result?.id_trx;
          id_movistar = fetchPaso1Result?.obj?.result?.id_movistar;
          let bodyPaso2 = {
            celular: dataInput.moduleInfo.celular,
            valor: dataInput.moduleInfo.valor_total_trx,
            codigodelaoferta: dataInput.moduleInfo.paquete,
            id_comercio: dataInput.roleInfo.id_comercio,
            id_terminal: dataInput.roleInfo.id_dispositivo,
            id_usuario: dataInput.roleInfo.id_usuario,
            id_trx: id_trx,
            id_movistar: id_movistar,
            nombre_comercio: dataInput.roleInfo["nombre comercio"],
            nombre_usuario: dataInput.pdpUser.uname,
            bool_ticket: true,
          };
          fetchPaso2Result = await fetchCustom(
            url_trx_compra_paquete,
            "PUT",
            `${name_operador} - modificar`,
            {},
            bodyPaso2,
            trxParamsError,
            FuctionEvaluateResponseMovistar
          );
          response = {
            status: fetchPaso2Result?.status,
            id_trx: null,
            ticket: JSON.parse(fetchPaso2Result?.obj?.result?.ticket),
          };
        } catch (error: any) {
          if (error.name === "ErrorCustomTimeout") {
            banderaFetchPaso3 = true;
          } else {
            clearInterval(timerInterval); //reiniciar contador
            setLoadingPeticion((old) => ({ ...old, trx: false }));
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
            id_comercio: dataInput.roleInfo.id_comercio,
            id_terminal: dataInput.roleInfo.id_dispositivo,
            id_usuario: dataInput.roleInfo.id_usuario,
            id_trx: id_trx,
            id_movistar: id_movistar,
          };
          fetchPaso3Result = await fetchCustom(
            url_trx_compra_paquete,
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
          setLoadingPeticion((old) => ({ ...old, trx: false }));
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
            id_trx: null,
            ticket: analysis?.obj?.result?.ticket,
          };
        } catch (error) {
          clearInterval(timerInterval);
          setLoadingPeticion((old) => ({ ...old, trx: false }));
          throw error;
        }
      }
      clearInterval(timerInterval);
      setLoadingPeticion((old) => ({ ...old, trx: false }));
      return response;
    },
    [name_operador]
  );

  return [loadingPeticion, PeticionGetPaquetes, PeticionTrx] as const;
};
