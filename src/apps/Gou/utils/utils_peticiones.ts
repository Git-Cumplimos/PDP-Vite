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
    return {
      valor_costo_trx: setting?.valor_costo_trx,
      valor_trx_maximo: setting?.valor_trx_maximo,
      valor_trx_minimo: setting?.valor_trx_minimo,
      valor_trx_maximo_exacto: !setting?.valor_trx_maximo_exacto, //el contario por que asi funciona el front
      valor_trx_minimo_exacto: !setting?.valor_trx_minimo_exacto, //el contario por que asi funciona el front
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
    };
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
