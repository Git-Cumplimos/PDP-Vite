import { useCallback, useState } from "react";
import {
  ErrorCustomApiGatewayTimeout,
  ErrorCustomFetch,
  ErrorCustomFetchTimeout,
  ErrorCustomUseHookCode,
  defaultParamsError,
  TempErrorFrontService,
  fetchCustomPdp,
  fetchCustomPdpCycle,
  ErrorCustomBackend,
  ErrorCustomBackendPending,
  ErrorCustomBackendRehazada,
  FuctionEvaluateResponseConsultTrx,
} from "../../../../../utils/fetchCustomPdp";
import {
  TypingCheckPay,
  TypingDataComercioSimple,
  TypingDataPath,
  TypingDataSettingTime,
  TypingSummaryTrx,
  TypingTrx,
  TypingTypeSettingTime,
} from "../../../utils/utils_typing";
import { constMsgTrx } from "../../../utils/utils_const";
import { ajust_tam_see_obj } from "../../../utils/utils_function";
import { TypingDataInputAuto } from "../utils_typing";

//FRAGMENT ******************** TYPING *******************************
export type TypeUseHookGouCheckPay = () => {
  loadingPeticion: boolean;
  loadingPeticionBlocking: boolean;
  PeticionCheckPay: (
    dataComercioSimple: TypingDataComercioSimple,
    dataPath: TypingDataPath
  ) => Promise<TypingCheckPay>;
  trx: TypingTrx;
  summaryTrx: TypingSummaryTrx;
};

//FRAGMENT ******************** CONST *******************************
// const URL_GOU = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}`;
const URL_GOU = `http://127.0.0.1:5000`;

//FRAGMENT ******************** HOOK *******************************
const useHookCheckUrlProcess = () => {
  const hook_name = "useHookCheckUrlProcess";
  const [loadingPeticion, setloadingPeticion] = useState<boolean>(false);
  const [loadingPeticionBlocking, setloadingPeticionBlocking] =
    useState<boolean>(false);

  const PeticionCheckUrlProcess = useCallback(
    async (dataInputAuto: TypingDataInputAuto): Promise<any> => {
      const function_name = "PeticionCheckUrlProcess";
      const url_consult_for_pay = `${URL_GOU}/services_gou/check_pay/check_url_process`;
      const name_service = "Obtener url de pago";
      let response;
      let pendiente = 0;
      try {
        const body = {
          id_uuid_trx: dataInputAuto.id_uuid_trx,
        };
        //SECUENCIA ---------------Paso 1-------------------------------
        try {
          response = await fetchCustomPdp(
            url_consult_for_pay,
            "POST",
            name_service,
            {},
            body,
            40,
            defaultParamsError,
            FuctionEvaluateResponseConsultTrx
          );
          console.log();
          return {
            ticket: response.obj?.result?.ticket,
            tipo_tramite: response.obj?.result?.tipo_tramite ?? "",
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
          if (error instanceof ErrorCustomBackendPending) {
          } else if (
            error instanceof ErrorCustomApiGatewayTimeout &&
            error instanceof ErrorCustomFetchTimeout
          ) {
          } else {
            throw error;
          }
        }

        // //SECUENCIA ---------------Paso 2-------------------------------
        // response = await fetchCustomPdpCycle(
        //   url_consult_for_pay,
        //   "POST",
        //   name_service,
        //   {},
        //   body,
        //   dataSettingTime.retries_consult_for_pay,
        //   dataSettingTime.delay_consult_for_pay
        // );
        // ArmDataOutput(response, "Aprobada");
        // return {
        //   ticket: response.obj?.result?.ticket,
        //   tipo_tramite: response.obj?.result?.tipo_tramite ?? "",
        // };
      } catch (error: any) {
        if (!(error instanceof ErrorCustomFetch)) {
          throw new ErrorCustomUseHookCode(
            TempErrorFrontService.replace("%s", name_service),
            error.message,
            `${hook_name} - ${function_name}`,
            "notifyError",
            true
          );
        } else if (error instanceof ErrorCustomBackendRehazada) {
        } else if (error instanceof ErrorCustomBackend) {
        } else if (error instanceof ErrorCustomBackendPending) {
        }
        throw error;
      }
    },
    []
  );

  return {
    loadingPeticion,
    loadingPeticionBlocking,
    PeticionCheckUrlProcess,
  };
  // as const;
};

export default useHookCheckUrlProcess;
