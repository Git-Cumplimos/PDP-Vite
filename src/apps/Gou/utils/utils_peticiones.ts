import {
  fetchCustomPdp,
  ErrorCustomFetch,
  ErrorCustomFetchCode,
  TempErrorFrontService,
} from "../../../utils/fetchCustomPdp";
import {
  TypingDataSettingTimeCheckPay,
  TypingTypeSettingTime,
} from "./utils_typing";

export const PeticionSettingTime = async (
  url_gou: string,
  type_setting_time: TypingTypeSettingTime
): Promise<TypingDataSettingTimeCheckPay> => {
  const function_name = "PeticionSettingTime";
  const name_service = "consultar configuracion time";
  let response: any;
  try {
    const url = `${url_gou}/services_gou/check_pay/consult_setting/${type_setting_time}`;
    response = await fetchCustomPdp(url, "GET", name_service);
    return {
      check_pay__delay:
        response.obj?.result?.setting?.delay_consult_for_pay ?? 15,
      check_pay__retries:
        response.obj?.result?.setting?.retries_consult_for_pay ?? 4,
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
