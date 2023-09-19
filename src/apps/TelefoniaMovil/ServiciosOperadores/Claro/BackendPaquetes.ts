import { useCallback, useState } from "react";
import {
  ParamsError,
  fetchCustom,
  FuctionEvaluateResponse,
  defaultParamsError,
} from "../../DynamicTelefoniaMovil/utils/fetchUtils";
import {
  TypeInputDataGetPaquetes,
  TypeInputTrxPaquetes,
  TypeOutputDataGetPaquetes,
  TypeOutputTrxPaquetes,
} from "../../DynamicTelefoniaMovil/TypeDinamic";
import { notify } from "../../../../utils/notify";

const url_get_paquetes = `${process.env.REACT_APP_URL_MOVISTAR}/servicio-compra-paquetes/get-paque`;
const url_trx_compra_paquete = `${process.env.REACT_APP_URL_MOVISTAR}/servicio-compra-paquetes/metodo1/trx-compra-p`;
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

export const useBackendPaquetesClaro = (
  name_operador: string,
  module: string
) => {
  const [loadingPeticion, setLoadingPeticion] = useState({
    getPaquetes: false,
    trx: false,
  });

  const PeticionGetPaquetes = useCallback(
    async (
      dataInputPromises: TypeInputDataGetPaquetes
    ): Promise<TypeOutputDataGetPaquetes> => {
      let fetchGetPaquetesResult;
      let response = {
        maxElems: 1,
        maxPages: 1,
        results: [],
      };
      try {
        setLoadingPeticion((old) => ({ ...old, getPaquetes: true }));

        fetchGetPaquetesResult = await fetchCustom(
          url_get_paquetes,
          "GET",
          `${name_operador} - consultar paquetes`,
          {}
        );

        const data = fetchGetPaquetesResult?.obj?.result?.results ?? [];
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
          maxElems: fetchGetPaquetesResult?.obj?.result?.maxElems,
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
      const response = {
        status: true,
        id_trx: null,
        ticket: null,
      };

      return response;
    },
    []
  );

  return [loadingPeticion, PeticionGetPaquetes, PeticionTrx] as const;
};
