import { useCallback, useState } from "react";
import {
  ParamsError,
  fetchCustom,
  FuctionEvaluateResponse,
  defaultParamsError,
} from "../../DynamicTelefoniaMovil/utils/utils";
import {
  TypeInputPromisesPaquetes,
  TypeOutputDataPaquetes,
} from "../../DynamicTelefoniaMovil/TypeDinamic";
import { notify } from "../../../../utils/notify";
import { FuctionEvaluateResponseMovistar } from "./utilsMovistar";

const url_get_paquetes = `${process.env.REACT_APP_URL_MOVISTAR}/servicio-compra-paquetes/get-paquetes`;
// const url_consulta_recarga = `${process.env.REACT_APP_URL_MOVISTAR}/servicio-recargas/metodo1/consulta-recarga`;
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
  const [statePeticion, setStatePeticion] = useState(false);

  const PeticionGetPaquetes = async (
    dataInputPromises: TypeInputPromisesPaquetes
  ): Promise<TypeOutputDataPaquetes> => {
    let fetchGetPaquetesResult;
    let response = {
      maxElems: 1,
      maxPages: 1,
      results: [],
    };
    //SECUENCIA ---------------Paso 1-------------------------------
    try {
      const tipo_comercio = dataInputPromises.roleInfo.tipo_comercio;

      fetchGetPaquetesResult = await fetchCustom(
        url_get_paquetes,
        "GET",
        `${name_operador} - consultar paquetes`,
        {}
      );
      return {
        maxElems: fetchGetPaquetesResult?.obj?.result?.maxElems,
        maxPages: fetchGetPaquetesResult?.obj?.result?.maxPages,
        results: fetchGetPaquetesResult?.obj?.result?.results,
      };
    } catch (error: any) {
      // throw error;
    }
    return response;
  };

  return [statePeticion, PeticionGetPaquetes];
};
