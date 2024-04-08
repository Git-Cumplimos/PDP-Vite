import { Dispatch, SetStateAction, useCallback, useState } from "react";
import {
  ErrorCustomApiGatewayTimeout,
  ErrorCustomFetch,
  ErrorCustomFetchTimeout,
  ErrorCustomUseHookCode,
  FuctionEvaluateResponse,
  defaultParamsError,
  descriptionErrorFront,
  fetchCustom,
  fetchCustomCycle,
} from "../utils/utils_fetch";
import {
  TypingDataComercio,
  TypingDataCrearSesion,
  TypingDataInput,
  TypingDataPay,
} from "../utils/utils_typing";
import { formatMoney } from "../../../../components/Base/MoneyInput";

//FRAGMENT ******************** TYPING *******************************
// export type TypeUseHookRecaudoDirigido = (
//   autorizador: string,
//   urlAutorizador: string
// ) => {
//   loadingPeticion: boolean;
//   loadingPeticionBlocking: boolean;
//   setloadingPeticion: Dispatch<SetStateAction<boolean>>;
//   ResListarConveniosManual: (
//     res: TypingJsonStringAny
//   ) => TypingOutputListarConveniosManual;
//   PeticionConsultConveniosManual: (
//     dataComercio: TypingDataComercio,
//     data: TypingInputConsultConveniosManual
//   ) => Promise<TypingPreconsult>;
//   PeticionConsultConveniosBarcode: (
//     dataComercio: TypingDataComercio,
//     data: TypingInputConsultConveniosBarcode
//   ) => Promise<TypingPreconsult>;
//   PeticionConsultRecaudo: (
//     dataComercio: TypingDataComercio,
//     dataPreconsult: TypingPreconsultDataPreconsult,
//     dataInput: TypingDataInput
//   ) => Promise<TypingOutputConsultRecaudo>;
//   PeticionPayRecaudo: (
//     dataComercio: TypingDataComercio,
//     dataPreconsult: TypingPreconsultDataPreconsult,
//     data: TypingInputPayRecaudo
//   ) => Promise<TypingOutputPayRecaudo>;
// };
//FRAGMENT ******************** CONST *******************************
const URL_RECARGARCUPO_GOU = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}`;

//FRAGMENT ******************** HOOK *******************************
const useHookRecargarCupo = () => {
  const hook_name = "useHookRecargarCupo";
  const [loadingPeticion, setloadingPeticion] = useState<boolean>(false);
  const [loadingPeticionBlocking, setloadingPeticionBlocking] =
    useState<boolean>(false);
  const [dataSeePay, setDataSeePay] = useState<any | null>(null);

  const PeticionCrearSesion = useCallback(
    async (
      dataComercio: TypingDataComercio,
      dataInput: any,
      id_uuid_trx: string
    ): Promise<TypingDataCrearSesion> => {
      const function_name = "PeticionCrearSesion";
      const url = `${URL_RECARGARCUPO_GOU}/services_gou/recargarcupo/create_sesion`;
      const name_service = "Crear sesion";
      let response: any;
      try {
        const body = {
          comercio: {
            id_comercio: dataComercio.id_comercio,
            id_usuario: dataComercio.id_usuario,
            id_terminal: dataComercio.id_terminal,
            nombre_comercio: dataComercio.nombre_comercio,
            nombre_usuario: dataComercio.id_comercio,
          },
          id_uuid_trx: id_uuid_trx,
          referencia: dataInput.referencia,
          valor_trx: parseFloat(dataInput.valor_trx),
          ip_address: "127.0.0.1",
        };
        response = await fetchCustom(url, "POST", name_service, {}, body);
        return {
          id_trx: response.obj?.ids?.id_trx,
          processUrl: response.obj?.result?.processUrl ?? "",
        };
      } catch (error: any) {
        if (!(error instanceof ErrorCustomFetch)) {
          throw new ErrorCustomUseHookCode(
            descriptionErrorFront.replace("%s", name_service),
            error.message,
            `${hook_name} - ${function_name}`,
            "notifyError",
            true
          );
        }
        throw error;
      }
    },
    []
  );

  const PeticionPay = useCallback(
    async (
      dataComercio: TypingDataComercio,
      dataInput: TypingDataInput,
      id_uuid_trx: string,
      dataCrearSesion: TypingDataCrearSesion
    ): Promise<TypingDataPay> => {
      const function_name = "PeticionPay";
      const url_pay = `${URL_RECARGARCUPO_GOU}/services_gou/recargarcupo/pago`;
      const name_service = "Recargar Cupo Pago";
      let response;
      try {
        //SECUENCIA ---------------Paso 1-------------------------------
        try {
          const body = {
            comercio: {
              id_comercio: dataComercio.id_comercio,
              id_usuario: dataComercio.id_usuario,
              id_terminal: dataComercio.id_terminal,
              nombre_comercio: dataComercio.nombre_comercio,
              nombre_usuario: dataComercio.nombre_usuario,
              oficina_propia: dataComercio.oficina_propia,
              location: {
                address: dataComercio.location.address,
                dane_code: dataComercio.location.dane_code,
                city: dataComercio.location.city,
                country: dataComercio.location.country,
              },
            },
            id_trx: dataCrearSesion.id_trx,
            id_uuid_trx: id_uuid_trx,
            valor_trx: dataInput.valor_trx,
            referencia: dataInput.referencia,
            ip_address: "127.0.0.1",
            summary_trx_add: {
              Nombre: dataInput.nombre_completo,
            },
            tipo_tramite: dataInput.tipo_tramite,
          };
          response = await fetchCustom(
            url_pay,
            "POST",
            name_service,
            {},
            body,
            120
          );
          return {
            ticket: response?.obj?.result?.ticket,
          };
        } catch (error: any) {
          if (
            !(error instanceof ErrorCustomApiGatewayTimeout) &&
            !(error instanceof ErrorCustomFetchTimeout)
          ) {
            if (!(error instanceof ErrorCustomFetch)) {
              throw new ErrorCustomUseHookCode(
                descriptionErrorFront.replace("%s", name_service),
                error.message,
                `${hook_name} - ${function_name}`,
                "notifyError",
                true
              );
            }
            throw error;
          }
        }
        //SECUENCIA ---------------Paso 2-------------------------------
        const url_consult_for_pay = `${URL_RECARGARCUPO_GOU}/services_gou/recargarcupo/consult_for_pago`;
        const name_service_consult_for_pay = "Consulta Pago";
        try {
          const bodyConsult = {
            comercio: {
              id_comercio: dataComercio.id_comercio,
              id_terminal: dataComercio.id_terminal,
              id_usuario: dataComercio.id_usuario,
            },
            id_trx: dataCrearSesion.id_trx,
            id_uuid_trx: id_uuid_trx,
          };
          response = await fetchCustomCycle(
            url_consult_for_pay,
            "POST",
            name_service_consult_for_pay,
            {},
            bodyConsult,
            15,
            8
          );
          return {
            ticket: response?.obj?.result?.ticket,
          };
        } catch (error: any) {
          if (!(error instanceof ErrorCustomFetch)) {
            throw new ErrorCustomUseHookCode(
              descriptionErrorFront.replace("%s", name_service),
              error.message,
              `${hook_name} - ${function_name}`,
              "notifyError",
              true
            );
          }
          throw error;
        }
      } catch (error: any) {
        throw error;
      }
    },
    []
  );

  const PeticionCheckPay = useCallback(
    async (
      dataComercio: TypingDataComercio,
      dataInput: TypingDataInput,
      id_uuid_trx: string
    ): Promise<TypingDataPay> => {
      const function_name = "PeticionCheckPay";
      setloadingPeticion(true);
      setloadingPeticionBlocking(true);
      const name_service = "PeticionCheckPay";
      try {
        const dataCrearSesion = await PeticionCrearSesion(
          dataComercio,
          dataInput,
          id_uuid_trx
        );
        setDataSeePay({
          Id_trx: dataCrearSesion.id_trx,
          Referencia: dataInput.referencia,
          // "Valor Trx": formatMoney.format(
          //   dataInput.valor_trx ?? 0
          // ),
        });
        window.open(dataCrearSesion.processUrl);
        setloadingPeticionBlocking(false);
        const dataPay = await PeticionPay(
          dataComercio,
          dataInput,
          id_uuid_trx,
          dataCrearSesion
        );
        return dataPay;
      } catch (error: any) {
        if (!(error instanceof ErrorCustomFetch)) {
          throw new ErrorCustomUseHookCode(
            descriptionErrorFront.replace("%s", name_service),
            error.message,
            `${hook_name} - ${function_name}`,
            "notifyError",
            true
          );
        }
        throw error;
      } finally {
        setloadingPeticion(false);
        setloadingPeticionBlocking(false);
      }
    },
    [PeticionCrearSesion, PeticionPay]
  );

  return {
    loadingPeticion,
    loadingPeticionBlocking,
    PeticionCheckPay,
    dataSeePay,
  };
  // as const;
};

export default useHookRecargarCupo;
