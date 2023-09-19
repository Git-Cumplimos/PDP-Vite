import {
  ErrorCustomBackend,
  ErrorCustomBackendUser,
  ErrorCustomFetchCode,
  ParamsError,
} from "../../DynamicTelefoniaMovil/utils/fetchUtils";

export const trxParamsError: ParamsError = {
  errorCustomFetchCode: {
    typeNotify: "notifyError",
    ignoring: false,
  },
  errorCustomApiGateway: {
    typeNotify: "notifyError",
    ignoring: false,
  },
  errorCustomApiGatewayTimeout: {
    typeNotify: "notifyError",
    ignoring: false,
  },
  errorCustomBackend: {
    typeNotify: "notifyError",
    ignoring: false,
  },
  errorCustomBackendUser: {
    typeNotify: "notify",
    ignoring: true,
  },
};

export const FuctionEvaluateResponseMovistar = (
  peticion_: any,
  name_: string,
  error_: ParamsError
) => {
  const function_name = "FuctionEvaluateResponseMovistar";
  // trx exitosa para el backend
  try {
    if (peticion_?.status === true) {
      return peticion_;
    }
  } catch (error: any) {
    throw new ErrorCustomFetchCode(
      `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_} - 7) [0010002]`,
      error.message,
      `${function_name} - trx exitosa para el backend`,
      error_.errorCustomFetchCode?.typeNotify,
      error_.errorCustomFetchCode?.ignoring
    );
  }
  // trx no exitosa para los errores  del backend
  try {
    if (peticion_?.status === false && peticion_?.obj?.error === true) {
      let error_msg_console = "";
      let error_msg_front = "Error";
      if (Object.keys(peticion_?.obj?.error_msg).length > 0) {
        const errorNameKey = Object.keys(peticion_?.obj?.error_msg);

        error_msg_console = errorNameKey
          .map((nameKey) => {
            if (peticion_?.obj?.error_msg[nameKey].damage) {
              if (error_msg_front === "Error") {
                error_msg_front = `${peticion_?.obj?.error_msg[nameKey].description}`;
              }
            }
            return `-${nameKey}=${peticion_?.obj?.error_msg[nameKey].comment} (${peticion_?.obj?.error_msg[nameKey].damage})`;
          })
          .join("\n");
      }
      throw new ErrorCustomBackend(
        error_msg_front,
        error_msg_console,
        `${function_name} - trx no exitosa para los errores del backend`,
        error_.errorCustomBackend?.typeNotify,
        error_.errorCustomBackend?.ignoring,
        peticion_?.obj?.error_msg
      );
    }
  } catch (error: any) {
    if (error instanceof ErrorCustomBackend) {
      throw error;
    } else {
      throw new ErrorCustomFetchCode(
        `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_} - 8) [0010002]`,
        error.message,
        `${function_name} - trx no exitosa para los errores del backend`,
        error_.errorCustomFetchCode?.typeNotify,
        error_.errorCustomFetchCode?.ignoring
      );
    }
  }

  //trx no exitosa, cuando status es false pero no hay errores
  try {
    if (peticion_?.status === false && peticion_?.obj?.error === false) {
      let error_msg_console = "";
      if (Object.keys(peticion_?.obj?.error_msg).length > 0) {
        const errorNameKey = Object.keys(peticion_?.obj?.error_msg);

        error_msg_console = errorNameKey
          .map((nameKey) => {
            return `-${nameKey}=${peticion_?.obj?.error_msg[nameKey]}`;
          })
          .join("\n");
      }
      throw new ErrorCustomBackendUser(
        `${peticion_?.msg}`,
        error_msg_console,
        error_.errorCustomBackendUser?.typeNotify,
        `${function_name} - trx no exitosa, cuando status es false pero no hay errores`,
        peticion_?.obj?.error_msg
      );
    }
  } catch (error: any) {
    if (error instanceof ErrorCustomBackendUser) {
      throw error;
    } else {
      throw new ErrorCustomFetchCode(
        `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_} - 9) [0010002]`,
        error.message,
        `${function_name} - trx no exitosa, cuando status es false pero no hay errores`,
        error_.errorCustomFetchCode?.typeNotify,
        error_.errorCustomFetchCode?.ignoring
      );
    }
  }
};
