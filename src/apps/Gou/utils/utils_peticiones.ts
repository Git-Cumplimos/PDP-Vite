import { formatMoney } from "../../../components/Base/MoneyInput";
import {
  fetchCustomPdp,
  ErrorCustomFetch,
  ErrorCustomFetchCode,
  TempErrorFrontService,
} from "../../../utils/fetchCustomPdp";
import { TypingDataSetting, TypingTypeSettingTime } from "./utils_typing";

export const PeticionSettingBase = async (
  url_gou: string,
  type_setting_time: TypingTypeSettingTime,
  type_operation: number
): Promise<TypingDataSetting> => {
  const function_name = "PeticionSettingBase";
  const name_service = "consultar configuración Gou";
  try {
    const url = `${url_gou}/services_gou/check_pay/consult_setting`;
    const params = {
      type: type_setting_time,
      type_operation,
    };
    const response = await fetchCustomPdp(url, "GET", name_service, params);
    const setting = response?.obj?.result?.setting ?? {};
    const dataSetting: TypingDataSetting = {
      valor_costo_trx: setting?.valor_costo_trx,
      check_url_process__delay: Math.max(
        setting?.time_front?.check_url_process__first_delay,
        setting?.time_front?.check_url_process__second_delay
      ),
      check_url_process__timeout: Math.max(
        setting?.time_front?.check_url_process__first_timeout,
        setting?.time_front?.check_url_process__second_timeout
      ),
      check_pay__delay: setting?.time_front_result?.check_pay__delay,
      check_pay__retries: setting?.time_front_result?.check_pay__retries,
      cant_valor_trx_maximo: 0,
    };
    if (setting?.valor_trx_maximo) {
      dataSetting.valor_trx_maximo = setting?.valor_trx_maximo;
      dataSetting.cant_valor_trx_maximo = `${formatMoney.format(
        setting?.valor_trx_maximo ?? 0
      )}`.length;
    } else {
      dataSetting.valor_trx_maximo_exacto = setting?.valor_trx_maximo_exacto;
      dataSetting.cant_valor_trx_maximo = `${formatMoney.format(
        setting?.valor_trx_maximo_exacto ?? 0
      )}`.length;
    }

    if (setting?.valor_trx_minimo)
      dataSetting.valor_trx_minimo = setting?.valor_trx_minimo;
    else dataSetting.valor_trx_minimo_exacto = setting?.valor_trx_minimo_exacto;

    return dataSetting;
  } catch (error: any) {
    if (!(error instanceof ErrorCustomFetch)) {
      throw new ErrorCustomFetchCode(
        TempErrorFrontService.replace("%s", name_service),
        error.message,
        `${function_name}`,
        "notifyError",
        true
      );
    }
    throw error;
  }
};
