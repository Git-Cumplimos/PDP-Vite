import { Dispatch, SetStateAction, useCallback, useState } from "react";
import {
  ErrorCustomApiGatewayTimeout,
  ErrorCustomFetch,
  ErrorCustomFetchTimeout,
  ErrorCustomUseHookCode,
  FuctionEvaluateResponse,
  defaultParamsError,
  TempErrorFrontService,
  fetchCustomPdp,
  fetchCustomPdpCycle,
} from "../../../utils/fetchCustomPdp";
import {
  TypingDataComercioSimple,
  TypingDataSettingTime,
  TypingTypeSettingTime,
} from "../utils/utils_typing";

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
// const URL_GOU = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}`;
const URL_GOU = `http://127.0.0.1:5000`;

//FRAGMENT ******************** HOOK *******************************
const useHookGouCheckPay = () => {
  const hook_name = "useHookGouCheckPay";
  const [loadingPeticion, setloadingPeticion] = useState<boolean>(false);
  const [loadingPeticionBlocking, setloadingPeticionBlocking] =
    useState<boolean>(false);
  const [dataSeePay, setDataSeePay] = useState<any | null>(null);

  const PeticionSettingTime = useCallback(
    async (
      TypeSettingTime: TypingTypeSettingTime
    ): Promise<TypingDataSettingTime> => {
      const function_name = "PeticionSettingTime";
      const name_service = "consultar configuracion time";
      let response: any;
      try {
        const url = `${URL_GOU}/services_gou/check_pay/consult_setting_time/${TypeSettingTime}`;
        response = await fetchCustomPdp(url, "GET", name_service);
        return {
          delay_consult_for_pay:
            response.obj?.result?.setting?.delay_consult_for_pay ?? 15,
          retries_consult_for_pay:
            response.obj?.result?.setting?.retries_consult_for_pay ?? 4,
        };
      } catch (error: any) {
        if (!(error instanceof ErrorCustomFetch)) {
          throw new ErrorCustomUseHookCode(
            TempErrorFrontService.replace("%s", name_service),
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

  const PeticionConsultForPay = useCallback(
    async (
      dataComercioSimple: TypingDataComercioSimple,
      dataSettingTime: TypingDataSettingTime,
      id_unique: string
    ): Promise<any> => {
      const function_name = "PeticionConsultForPay";
      const url_consult_for_pay = `${URL_GOU}/services_gou/check_pay/check_pay_with_pdp`;
      const name_service = "Verificando Pago";
      let response;
      const body = {
        comercio: {
          id_comercio: dataComercioSimple.id_comercio,
          id_usuario: dataComercioSimple.id_usuario,
          id_terminal: dataComercioSimple.id_terminal,
        },
        id_unique: id_unique,
      };
      try {
        //SECUENCIA ---------------Paso 1-------------------------------
        try {
          response = await fetchCustomPdp(
            url_consult_for_pay,
            "POST",
            name_service,
            {},
            body
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
                TempErrorFrontService.replace("%s", name_service),
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
        try {
          response = await fetchCustomPdpCycle(
            url_consult_for_pay,
            "POST",
            name_service,
            {},
            body,
            dataSettingTime.retries_consult_for_pay,
            dataSettingTime.delay_consult_for_pay
          );
          return {
            ticket: response?.obj?.result?.ticket,
          };
        } catch (error: any) {
          if (!(error instanceof ErrorCustomFetch)) {
            throw new ErrorCustomUseHookCode(
              TempErrorFrontService.replace("%s", name_service),
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
      dataComercioSimple: TypingDataComercioSimple,
      id_unique: string,
      typeSettingTime: TypingTypeSettingTime
    ): Promise<any> => {
      const function_name = "PeticionCheckPay";
      setloadingPeticion(true);
      setloadingPeticionBlocking(true);
      const name_service = "PeticionCheckPay";
      try {
        const dataSettingTime = await PeticionSettingTime(typeSettingTime);
        const da = await PeticionConsultForPay(
          dataComercioSimple,
          dataSettingTime,
          id_unique
        );
        console.log(da);
        return {};
      } catch (error: any) {
        if (!(error instanceof ErrorCustomFetch)) {
          throw new ErrorCustomUseHookCode(
            TempErrorFrontService.replace("%s", name_service),
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
    [PeticionSettingTime, PeticionConsultForPay]
  );

  return {
    loadingPeticion,
    loadingPeticionBlocking,
    PeticionCheckPay,
    dataSeePay,
  };
  // as const;
};

export default useHookGouCheckPay;
