import { useCallback, useState } from "react";
import { TypingDataComercio } from "../../../../utils/TypingUtils";
import {
  ErrorCustomFetch,
  ErrorCustomUseHookCode,
  TempErrorFrontService,
} from "../../../../utils/fetchCustomPdp";
import { constMsgTrx } from "../../utils/utils_const";
import {
  TypingDataSetting,
  TypingStatusTrx,
  TypingSummaryTrx,
  TypingTrx,
} from "../../utils/utils_typing";
import {
  TypingDataInput,
  TypingDataModalAdd,
  TypingPeticionPrePayBase,
  TypingUseHookWithPasarelaPay,
  TypingDataSettingValor,
  TypingOutputPrePay,
  TypingOutputPrePayBase,
} from "../utils/utils_typing";
import { PeticionSettingBase } from "../../utils/utils_peticiones";
import { ErrorCustomPeticionPrePayBase } from "../utils/utils_exception";
import { URL_PASARELA_CHECK_PAY_CONSULT_SETTING } from "../../routes_backend";

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
          URL_PASARELA_CHECK_PAY_CONSULT_SETTING,
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
    ): Promise<TypingOutputPrePay> => {
      const function_name = "PeticionPrePay";
      const name_service = "Servicio Proceso Pago";
      try {
        const outputPrePayBase: TypingOutputPrePayBase =
          await PeticionPrePayBase(dataComercio, dataInput);

        setSummaryTrx((old) => ({
          ...old,
          msg: "Por favor continuar el pago, generando el link de pago",
          id_trx: outputPrePayBase.id_trx,
          id_log: outputPrePayBase.id_log,
          summary_trx_own: {
            ...old.summary_trx_own,
            fecha: outputPrePayBase?.fecha
              ? outputPrePayBase?.fecha
              : dataInput.fecha,
          },
          summary_trx_asterisk: outputPrePayBase.asterisk,
        }));

        return {
          url_process: outputPrePayBase.url_process,
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
        } else if (error instanceof ErrorCustomPeticionPrePayBase) {
          setSummaryTrx((old) => ({
            ...old,
            id_trx: error.outputPrePayBase?.id_trx,
            id_log: error.outputPrePayBase?.id_log,
            fecha: error.outputPrePayBase?.fecha
              ? error.outputPrePayBase?.fecha
              : dataInput.fecha,
            summary_trx_asterisk: error.outputPrePayBase?.asterisk ?? [],
          }));
        }
        throw error;
      }
    },
    [PeticionPrePayBase]
  );

  const PeticionCheckPrePay = useCallback(
    async (
      id_unico_modal: string,
      dataComercio: TypingDataComercio,
      dataInput: TypingDataInput,
      dataModalAdd: TypingDataModalAdd
    ): Promise<TypingOutputPrePay> => {
      const function_name = "PeticionCheckPrePay";
      const name_service = "Servicio Proceso Pago";
      setloadingPeticion(true);
      setloadingPeticionBlocking(true);
      let status: TypingStatusTrx = "Pendiente";
      setSummaryTrx({
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

      try {
        const outputPrePay: TypingOutputPrePay = await PeticionPrePay(
          dataComercio,
          dataInput
        );
        return outputPrePay;
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
