import {
  ErrorCustomBackend,
  ErrorCustomFetchCode,
  ParamsError,
} from "../../DynamicTelefoniaMovil/utils/utils";

type TypeAcrominosPractisistemas = {
  [key: string]: { recarga: string; paquetes: { [key: string]: string } };
};

export const AcrominosPractisistemas: TypeAcrominosPractisistemas = {
  Tigo: {
    recarga: "ti",
    paquetes: {
      pi: "Paquetigos Combos",
      pv: "Paquetigos Voz Sms",
      pb: "Bolsa Tigo",
    },
  },
  WOM: { recarga: "wm", paquetes: { pw: "Paquetes WOM" } },
  Uff: { recarga: "uf", paquetes: {} },
  Exito: { recarga: "ex", paquetes: { pe: "Paquetes Exito" } },
  Virgin: { recarga: "vi", paquetes: { vp: "Virgin Paquetes" } },
  "Direct TV": { recarga: "di", paquetes: {} },
  Une: { recarga: "un", paquetes: {} },
  Avantel: { recarga: "av", paquetes: { ap: "Paquetes Avantel" } },
  Etb: { recarga: "et", paquetes: { ep: "Paquetes ETB" } },
  "Flash Mobile": { recarga: "fm", paquetes: {} },
  Comunicate: { recarga: "cm", paquetes: {} },
  Buenofon: { recarga: "bf", paquetes: { pb: "Buenofon Paquetes" } },
};

export const FuctionEvaluateResponsePractisistemas = (
  peticion_: any,
  name_: string,
  error_: ParamsError
) => {
  const function_name = "FuctionEvaluateResponsePractisistemas";
  //trx no exitosa para los errores del backend
  try {
    if (peticion_?.status === true) {
      return peticion_;
    }
  } catch (error: any) {
    throw new ErrorCustomFetchCode(
      `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_}) [0010002]`,
      error.message,
      `${function_name} - trx no exitosa para los errores del backend`,
      error_.errorCustomFetchCode?.typeNotify,
      error_.errorCustomFetchCode?.ignoring
    );
  }
  //trx no exitosa para los errores del backend,

  try {
    if (peticion_?.status === false && peticion_?.obj?.response) {
      throw new ErrorCustomBackend(
        peticion_?.obj?.response,
        peticion_?.obj?.response,
        `${function_name} - trx no exitosa para los errores del backend`,
        error_.errorCustomBackend?.typeNotify,
        error_.errorCustomBackend?.ignoring,
        peticion_?.obj?.error_msg
      );
    } else if (peticion_?.status === false) {
      throw new ErrorCustomBackend(
        peticion_?.msg,
        peticion_?.msg,
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
        `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_}) [0010002]`,
        error.message,
        `${function_name} - trx no exitosa para los errores del backend`,
        error_.errorCustomBackend?.typeNotify,
        error_.errorCustomBackend?.ignoring
      );
    }
  }
};
