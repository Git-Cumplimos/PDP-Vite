import { useCallback, useState } from "react";
import { TypingDataComercio } from "../../../../utils/TypingUtils";
import {
  ErrorCustomBackendRechazada,
  ErrorCustomFetch,
  ErrorCustomUseHookCode,
  ErrorCustomRaise,
  TempErrorFrontService,
  fetchCustomPdp,
  FuctionEvaluateResponseConsultTrx,
  fetchCustomPdpCycle,
  defaultParamsError,
  ErrorCustomBackendPending,
  ErrorCustomBackend,
} from "../../../../utils/fetchCustomPdp";
import { constMsgTrx } from "../../utils/utils_const";
import { ajust_tam_see } from "../../utils/utils_function";
import {
  TypingOutputCheckPay,
  TypingDataSetting,
  TypingStatusTrx,
  TypingSummaryTrx,
  TypingTrx,
  TypingTypeSettingTime,
} from "../../utils/utils_typing";
import {
  TypingDataInput,
  TypingDataModalAdd,
  TypingPeticionPrePayBase,
  TypingUseHookWithPasarelaPay,
  TypingDataSettingValor,
} from "../utils/utils_typing";
import { PeticionSettingBase } from "../../utils/utils_peticiones";
import { ErrorCustomPeticionPrePayBase } from "../utils/utils_exception";

//FRAGMENT ******************** CONST *******************************
// const URL_GOU = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}`;
const URL_GOU = `http://127.0.0.1:5000`;

//FRAGMENT ******************** TYPING *******************************

//FRAGMENT ******************** HOOK *******************************
const useHookWithPasarelaPay: TypingUseHookWithPasarelaPay = (
  type_operation: number,
  PeticionPrePayBase: TypingPeticionPrePayBase
) => {
  const hook_name = "useHookWithPasarelaPay";
  const [loadingPeticion, setloadingPeticion] = useState<boolean>(false);
  const [loadingPeticionBlocking, setloadingPeticionBlocking] =
    useState<boolean>(false);
  const [summaryTrx, setSummaryTrx] = useState<TypingSummaryTrx>({});
  const [trx, setTrx] = useState<TypingTrx>({
    status: "Search",
    msg: constMsgTrx.Search,
  });

  const PeticionSetting =
    useCallback(async (): Promise<TypingDataSettingValor> => {
      const function_name = "PeticionSetting";
      const name_service = "consultar configuracion time";
      setloadingPeticionBlocking(true);
      try {
        const dataSetting: TypingDataSetting = await PeticionSettingBase(
          URL_GOU,
          "origin",
          type_operation
        );
        const dataSettingValor: TypingDataSettingValor = {
          valor_costo_trx: dataSetting.valor_costo_trx,
          cant_valor_trx_maximo: dataSetting.cant_valor_trx_maximo,
        };

        if (dataSetting?.valor_trx_maximo)
          dataSettingValor.valor_trx_maximo = dataSetting?.valor_trx_maximo;
        else
          dataSettingValor.valor_trx_maximo_exacto =
            dataSetting?.valor_trx_maximo_exacto;

        if (dataSetting?.valor_trx_minimo)
          dataSettingValor.valor_trx_minimo = dataSetting?.valor_trx_minimo;
        else
          dataSettingValor.valor_trx_minimo_exacto =
            dataSetting?.valor_trx_minimo_exacto;

        return dataSettingValor;
      } catch (error: any) {
        if (!(error instanceof ErrorCustomFetch)) {
          throw new ErrorCustomUseHookCode(
            TempErrorFrontService.replace("%s", name_service),
            error.message,
            `${function_name}`,
            "notifyError",
            true
          );
        }
        throw error;
      } finally {
        setloadingPeticionBlocking(false);
      }
    }, [type_operation]);

  const PeticionPrePay = useCallback(
    async (
      dataComercio: TypingDataComercio,
      dataInput: TypingDataInput
    ): Promise<any> => {
      const function_name = "PeticionPrePay";
      const name_service = "Recargar Cupo Pago";
      let response;
      try {
        response = await PeticionPrePayBase(dataComercio, dataInput);
        return response;
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
    [PeticionPrePayBase]
  );

  const ArmDataOutput = useCallback(
    (res: { [key: string]: any }, status?: TypingStatusTrx) => {
      if (status === undefined) {
        status = "Desconocida";
      }
      let is_change = false;
      const res_obj = res?.obj ?? {};
      const res_obj_result = res_obj?.result ?? {};
      if (Object.keys(res_obj).length !== 0) {
        if (!summaryTrx?.id_trx) {
          setSummaryTrx((old) => ({
            ...old,
            id_trx: res_obj?.ids?.id_trx ? res_obj?.ids?.id_trx : undefined,
            id_log: res.obj?.ids?.id_log,
          }));
          is_change = true;
        }
        if (!summaryTrx?.summary_trx_asterisk) {
          setSummaryTrx((old) => ({
            ...old,
            summary_trx_asterisk: res_obj_result?.asterisk
              ? res_obj_result?.asterisk
              : undefined,
            id_log: res.obj?.ids?.id_log,
          }));
          is_change = true;
        }
        if (is_change === false) {
          setSummaryTrx((old) => ({
            ...old,
            id_log: res.obj?.ids?.id_log,
          }));
        }
      }
      setTrx({
        status: status,
        msg: constMsgTrx[status],
      });
    },
    [summaryTrx?.id_trx, summaryTrx?.summary_trx_asterisk]
  );

  const PeticionCheckPrePay = useCallback(
    async (
      id_unico_modal: string,
      dataComercio: TypingDataComercio,
      dataInput: TypingDataInput,
      dataModalAdd: TypingDataModalAdd
    ): Promise<any> => {
      const function_name = "PeticionCheckPrePay";
      const name_service = "Servicio Proceso Pago";
      setloadingPeticion(true);
      setloadingPeticionBlocking(true);
      let status: TypingStatusTrx = "Pendiente";
      await setSummaryTrx({
        id_unico: id_unico_modal,
        summary_trx_asterisk: dataModalAdd,
        summary_trx_own: {
          fecha: dataInput.fecha,
          tipo_tramite: dataInput.tipo_tramite,
          referencia: dataInput.referencia,
        },
        valor_trx: parseInt(dataInput.valor_trx),
      });

      setTrx({
        status: status,
        msg: constMsgTrx.Pendiente,
      });

      let response: any;
      try {
        //SECUENCIA ---------------Paso 1-------------------------------
        response = await PeticionPrePay(dataComercio, dataInput);
      } catch (error: any) {
        status = "Rechazada";
        setTrx({
          status: status,
          msg: constMsgTrx[status],
        });
        setSummaryTrx((old) => ({
          ...old,
          msg: error.message,
        }));
        if (!(error instanceof ErrorCustomFetch)) {
          throw new ErrorCustomUseHookCode(
            TempErrorFrontService.replace("%s", name_service),
            error.message,
            `${hook_name} - ${function_name}`,
            "notifyError",
            true
          );
        } else if (error instanceof ErrorCustomPeticionPrePayBase) {
          setSummaryTrx((old) => ({
            ...old,
            id_trx: error.outputPrePayBase.id_trx,
            id_log: error.outputPrePayBase.id_log,
            fecha: error.outputPrePayBase.fecha,
          }));
        }
        throw error;
      } finally {
        setloadingPeticion(false);
        setloadingPeticionBlocking(false);
      }
    },
    [PeticionPrePay]
  );

  return {
    loadingPeticion,
    loadingPeticionBlocking,
    PeticionSetting,
    PeticionCheckPrePay,
    summaryTrx,
    trx,
  };
  // as const;
};

export default useHookWithPasarelaPay;
