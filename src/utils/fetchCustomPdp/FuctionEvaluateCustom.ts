import {
  ErrorCustomBackend,
  ErrorCustomBackendPending,
  ErrorCustomBackendRechazada,
  ErrorCustomBackendUser,
  ErrorCustomFetch,
  ErrorCustomFetchCode,
} from "./ExceptionCustom";
import { TempErrorFrontService } from "./TempCustom";
import { ParamsError } from "./TypingCustom";

export const FuctionEvaluateResponse = (
  peticion_: any,
  name_: string,
  error_: ParamsError
) => {
  const function_name = FuctionEvaluateResponse.name;
  //evaluar el status de la peticion
  try {
    if (peticion_?.status === true) {
      return peticion_;
    }
  } catch (error: any) {
    throw new ErrorCustomFetchCode(
      TempErrorFrontService.replace("%s", name_),
      error.message,
      `${function_name} - evaluar el status de la peticion`,
      error_.errorCustomFetchCode?.typeNotify,
      error_.errorCustomFetchCode?.ignoring,
      error_.errorCustomFetchCode?.console_error
    );
  }
  // trx no exitosa para los errores  del backend
  try {
    if (peticion_?.status === false && peticion_?.obj?.error_status === true) {
      let error_msg_console = "";
      if (Object.keys(peticion_?.obj?.error_msg).length > 0) {
        const errorNameKey = Object.keys(peticion_?.obj?.error_msg);

        error_msg_console = errorNameKey
          .map((nameKey) => {
            return `* ${nameKey}= ${peticion_?.obj?.error_msg[nameKey].error_comment} (${peticion_?.obj?.error_msg[nameKey].blocking})`;
          })
          .join("\n");
      }

      throw new ErrorCustomBackend(
        `${peticion_?.msg}`,
        error_msg_console,
        `${function_name} - trx no exitosa para los errores del backend`,
        error_.errorCustomBackend?.typeNotify,
        error_.errorCustomBackend?.ignoring,
        error_.errorCustomBackend?.console_error,
        peticion_
      );
    }
  } catch (error: any) {
    if (error instanceof ErrorCustomBackend) throw error;
    throw new ErrorCustomFetchCode(
      TempErrorFrontService.replace("%s", name_),
      error.message,
      `${function_name} - trx no exitosa para los errores del backend`,
      error_.errorCustomFetchCode?.typeNotify,
      error_.errorCustomFetchCode?.ignoring,
      error_.errorCustomFetchCode?.console_error
    );
  }

  //trx no exitosa, cuando status es false pero no hay errores
  try {
    if (peticion_?.status === false && peticion_?.obj?.error_status === false) {
      let error_msg_console = "";
      if (Object.keys(peticion_?.obj?.error_msg).length > 0) {
        const errorNameKey = Object.keys(peticion_?.obj?.error_msg);

        error_msg_console = errorNameKey
          .map((nameKey) => {
            return `* ${nameKey}= ${peticion_?.obj?.error_msg[nameKey].error_comment} (${peticion_?.obj?.error_msg[nameKey].blocking})`;
          })
          .join("\n");
      }
      throw new ErrorCustomBackendUser(
        `${peticion_?.msg}`,
        error_msg_console,
        `${function_name} - trx no exitosa, cuando status es false pero no hay errores`,
        error_.errorCustomBackendUser?.typeNotify,
        error_.errorCustomBackendUser?.ignoring,
        error_.errorCustomBackendUser?.console_error,
        peticion_
      );
    }
  } catch (error: any) {
    if (error instanceof ErrorCustomBackendUser) throw error;
    throw new ErrorCustomFetchCode(
      TempErrorFrontService.replace("%s", name_),
      error.message,
      `${function_name} - trx no exitosa, cuando status es false pero no hay errores`,
      error_.errorCustomFetchCode?.typeNotify,
      error_.errorCustomFetchCode?.ignoring,
      error_.errorCustomFetchCode?.console_error
    );
  }
};

export const FuctionEvaluateResponseConsultTrx = (
  peticion_: any,
  name_: string,
  error_: ParamsError
) => {
  const function_name = FuctionEvaluateResponseConsultTrx.name;
  //evaluar el status_
  try {
    if (peticion_?.status === false) {
      if (peticion_?.hasOwnProperty("status_") === true) {
        const status_ = peticion_.status_.toLowerCase();
        switch (status_) {
          case "pendiente":
            throw new ErrorCustomBackendPending(
              peticion_?.msg,
              peticion_?.msg,
              `${function_name} - evaluar el status_ pendiente`,
              error_.errorCustomFetchCode?.typeNotify,
              error_.errorCustomFetchCode?.ignoring,
              error_.errorCustomFetchCode?.console_error,
              peticion_
            );
          // break;
          case "rechazada":
            throw new ErrorCustomBackendRechazada(
              peticion_?.msg,
              peticion_?.msg,
              `${function_name} - evaluar el status_ Rechazada`,
              error_.errorCustomFetchCode?.typeNotify,
              error_.errorCustomFetchCode?.ignoring,
              error_.errorCustomFetchCode?.console_error,
              peticion_
            );
          // break;
        }
      }
    }
    return FuctionEvaluateResponse(peticion_, name_, error_);
  } catch (error: any) {
    if (!(error instanceof ErrorCustomFetch)) {
      throw new ErrorCustomFetchCode(
        TempErrorFrontService.replace("%s", name_),
        error.message,
        `${function_name} - evaluar el status_`,
        error_.errorCustomFetchCode?.typeNotify,
        error_.errorCustomFetchCode?.ignoring,
        error_.errorCustomFetchCode?.console_error
      );
    }
    throw error;
  }
};
