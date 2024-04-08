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
} from "../../../utils/fetchCustomPdp";
import {
  TypingCheckPay,
  TypingDataComercioSimple,
  TypingDataPath,
  TypingDataSettingTime,
  TypingSummaryTrx,
  TypingTrx,
  TypingTypeSettingTime,
} from "../utils/utils_typing";
import { constMsgTrx } from "../utils/utils_const";

//FRAGMENT ******************** TYPING *******************************
export type TypeUseHookGouCheckPay = () => {
  loadingPeticion: boolean;
  loadingPeticionBlocking: boolean;
  PeticionCheckPay: (
    dataComercioSimple: TypingDataComercioSimple,
    dataPath: TypingDataPath
  ) => Promise<TypingCheckPay>;
  DetectionInitial: (id_trx: number, id_uuid_trx: string) => any;
  trx: TypingTrx;
  summaryTrx: TypingSummaryTrx;
};

//FRAGMENT ******************** CONST *******************************
const URL_GOU = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}`;

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
      status?: "Aprobada" | "Rechazada" | "Pendiente"
    ) => {
      const res_obj = res.obj ?? {};

      if (status === undefined) {
        setSummaryTrx((old) => ({
          ...old,
          id_log: res.obj?.ids?.id_log,
        }));
        return;
      }

      setSummaryTrx({
        msg: res?.msg,
        summary_trx: {
          ...res_obj.result?.summary_trx_add,
          "Id transacción": res_obj.ids?.id_trx,
          "Num referencia": res_obj.result?.referencia,
          "Estado de la transacción": status,
        },
        valor_trx: res_obj?.result?.valor_trx,
        id_log: res_obj.ids?.id_log,
      });
      setTrx({
        status: status,
        msg: constMsgTrx[status],
      });
    },
    []
  );

  const DetectionInitial = useCallback(
    (id_trx: number, id_uuid_trx: string) => {
      setSummaryTrx({
        summary_trx: {
          "Id transacción": id_trx,
          id_uuid_trx: id_uuid_trx,
        },
      });
    },
    [setSummaryTrx]
  );

  const PeticionSettingTime = useCallback(
    async (
      setting_time: TypingTypeSettingTime
    ): Promise<TypingDataSettingTime> => {
      const function_name = "PeticionSettingTime";
      const name_service = "consultar configuracion time";
      let response: any;
      try {
        const url = `${URL_GOU}/services_gou/check_pay/consult_setting_time/${setting_time}`;
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
        if (!(error instanceof ErrorCustomBackend)) {
          ArmDataOutput(error.res ?? {});
        }
        throw error;
      }
    },
    [ArmDataOutput]
  );

  const PeticionConsultForPay = useCallback(
    async (
      dataComercioSimple: TypingDataComercioSimple,
      id_unique: string,
      dataSettingTime: TypingDataSettingTime
    ): Promise<TypingCheckPay> => {
      const function_name = "PeticionConsultForPay";
      const url_consult_for_pay = `${URL_GOU}/services_gou/check_pay/check_pay_with_pdp`;
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
          id_unique: id_unique,
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
          } else if (error instanceof ErrorCustomBackendRehazada) {
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
          dataSettingTime.retries_consult_for_pay,
          dataSettingTime.delay_consult_for_pay
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
        } else if (error instanceof ErrorCustomBackendRehazada) {
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
    ): Promise<TypingCheckPay> => {
      const function_name = "PeticionCheckPay";
      setloadingPeticion(true);
      setloadingPeticionBlocking(true);
      const name_service = "PeticionCheckPay";
      try {
        const dataSettingTime = await PeticionSettingTime(
          dataPath.type_setting_time
        );
        const dataConsultForPay = await PeticionConsultForPay(
          dataComercioSimple,
          dataPath.id_unique,
          dataSettingTime
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
    [PeticionSettingTime, PeticionConsultForPay]
  );

  return {
    loadingPeticion,
    loadingPeticionBlocking,
    DetectionInitial,
    PeticionCheckPay,
    trx,
    summaryTrx,
  };
  // as const;
};

export default useHookGouCheckPay;
