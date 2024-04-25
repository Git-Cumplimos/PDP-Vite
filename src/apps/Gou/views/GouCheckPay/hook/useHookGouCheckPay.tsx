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
  ErrorCustomBackendRechazada,
  FuctionEvaluateResponseConsultTrx,
} from "../../../../../utils/fetchCustomPdp";
import {
  TypingOutputCheckPay,
  TypingDataComercioSimple,
  TypingDataPath,
  TypingDataSetting,
  TypingSummaryTrx,
  TypingTrx,
  TypingTypeSettingTime,
} from "../../../utils/utils_typing";
import { constMsgTrx } from "../../../utils/utils_const";
import { ajust_tam_see_obj } from "../../../utils/utils_function";

//FRAGMENT ******************** TYPING *******************************
export type TypeUseHookGouCheckPay = () => {
  loadingPeticion: boolean;
  loadingPeticionBlocking: boolean;
  PeticionCheckPay: (
    dataComercioSimple: TypingDataComercioSimple,
    dataPath: TypingDataPath
  ) => Promise<TypingOutputCheckPay>;
  trx: TypingTrx;
  summaryTrx: TypingSummaryTrx;
};

//FRAGMENT ******************** CONST *******************************
const URL_GOU = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}`;
// const URL_GOU = `http://127.0.0.1:5000`;

//FRAGMENT ******************** HOOK *******************************
const useHookGouCheckPay: TypeUseHookGouCheckPay = () => {
  const hook_name = "useHookGouCheckPay";
  const [loadingPeticion, setloadingPeticion] = useState<boolean>(false);
  const [loadingPeticionBlocking, setloadingPeticionBlocking] =
    useState<boolean>(false);
  const [trx, setTrx] = useState<TypingTrx>({
    status: "Search",
    msg: constMsgTrx.Search,
  });
  const [summaryTrx, setSummaryTrx] = useState<TypingSummaryTrx>({});

  const ArmDataOutput = useCallback(
    (
      res: { [key: string]: any },
      status?: "Aprobada" | "Rechazada" | "Pendiente" | "Desconocida"
    ) => {
      if (status === undefined) {
        status = "Desconocida";
      }
      const res_obj = res?.obj ?? {};
      const res_obj_result = res_obj?.result ?? {};
      let summary_trx: { [key: string]: any } = {};
      if (Object.keys(res_obj_result).length === 0) {
        summary_trx["Id transacción"] =
          res_obj?.ids?.id_trx && res_obj?.ids?.id_trx;
        setSummaryTrx((old) => ({
          ...old,
          id_log: res.obj?.ids?.id_log,
          id_trx: res_obj?.ids?.id_trx,
        }));
      } else {
        summary_trx = {
          ...ajust_tam_see_obj(res_obj.result?.summary_trx_add ?? {}, 26),
          ...summary_trx,
        };
        setSummaryTrx({
          msg: res?.msg,
          summary_trx_asterisk:
            res_obj_result?.tipo_tramite && res_obj_result?.asterisk,
          summary_trx_own: {
            tipo_tramite:
              res_obj_result?.tipo_tramite && res_obj_result?.tipo_tramite,
            referencia:
              res_obj_result?.referencia && res_obj_result?.referencia,
            fecha: res_obj_result?.fecha && res_obj_result?.fecha,
          },
          valor_trx: res_obj_result?.valor_trx,
          id_log: res_obj.ids?.id_log,
          id_trx: res_obj?.ids?.id_trx,
        });
      }

      setTrx({
        status: status,
        msg: constMsgTrx[status],
      });
    },
    []
  );

  const PeticionConsultForPay = useCallback(
    async (
      dataComercioSimple: TypingDataComercioSimple,
      id_hash: string,
      dataSettingTime: any
    ): Promise<TypingOutputCheckPay> => {
      const function_name = "PeticionConsultForPay";
      const url_consult_for_pay = `${URL_GOU}/services_gou/check_pay/check_pay_with_pdp/cross`;
      const name_service = "Verificando Pago";
      let response;
      let pendiente = 0;
      try {
        const body = {
          comercio: {
            id_comercio: dataComercioSimple.id_comercio,
            id_usuario: dataComercioSimple.id_usuario,
            id_terminal: dataComercioSimple.id_terminal,
          },
          id_hash: id_hash,
        };
        //SECUENCIA ---------------Paso 1-------------------------------
        try {
          response = await fetchCustomPdp(
            url_consult_for_pay,
            "POST",
            name_service,
            {},
            body,
            60,
            defaultParamsError,
            FuctionEvaluateResponseConsultTrx
          );
          ArmDataOutput(response, "Aprobada");
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
          } else if (error instanceof ErrorCustomBackendRechazada) {
            ArmDataOutput(error.res ?? {}, "Rechazada");
            throw error;
          } else if (error instanceof ErrorCustomBackend) {
            ArmDataOutput(error.res ?? {});
            throw error;
          } else if (error instanceof ErrorCustomBackendPending) {
            pendiente += 1;
            ArmDataOutput(error.res ?? {}, "Pendiente");
          } else if (
            error instanceof ErrorCustomApiGatewayTimeout &&
            error instanceof ErrorCustomFetchTimeout
          ) {
          } else {
            throw error;
          }
        }

        //SECUENCIA ---------------Paso 2-------------------------------
        response = await fetchCustomPdpCycle(
          url_consult_for_pay,
          "POST",
          name_service,
          {},
          body,
          dataSettingTime.check_pay__retries,
          dataSettingTime.check_pay__delay
        );
        ArmDataOutput(response, "Aprobada");
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
        } else if (error instanceof ErrorCustomBackendRechazada) {
          ArmDataOutput(error.res ?? {}, "Rechazada");
        } else if (error instanceof ErrorCustomBackend && pendiente === 0) {
          ArmDataOutput(error.res ?? {});
        } else if (
          error instanceof ErrorCustomBackendPending &&
          pendiente === 0
        ) {
          ArmDataOutput(error.res ?? {}, "Pendiente");
        }
        throw error;
      }
    },
    [ArmDataOutput]
  );

  const PeticionCheckPay = useCallback(
    async (
      dataComercioSimple: TypingDataComercioSimple,
      dataPath: TypingDataPath
    ): Promise<any> => {
      const function_name = "PeticionCheckPay";
      setloadingPeticion(true);
      setloadingPeticionBlocking(true);
      const name_service = "PeticionCheckPay";
      try {
        // const dataSettingTime = await PeticionSettingTime(
        //   dataPath.type_setting_time
        // );
        const dataConsultForPay = await PeticionConsultForPay(
          dataComercioSimple,
          dataPath.id_hash,
          {
            check_pay__retries: 10,
            check_pay__delay: 30,
          }
        );
        return dataConsultForPay;
      } catch (error: any) {
        if (!(error instanceof ErrorCustomFetch)) {
          throw new ErrorCustomUseHookCode(
            TempErrorFrontService.replace("%s", name_service),
            error.message,
            `${hook_name} - ${function_name}`,
            "notifyError",
            false
          );
        }
        throw error;
      } finally {
        setloadingPeticion(false);
        setloadingPeticionBlocking(false);
      }
    },
    [PeticionConsultForPay]
  );

  return {
    loadingPeticion,
    loadingPeticionBlocking,
    PeticionCheckPay,
    trx,
    summaryTrx,
  };
  // as const;
};

export default useHookGouCheckPay;
