import fetchData from "../../../utils/fetchData";
import { notify, notifyError } from "../../../utils/notify";

type ParamsSubError = {
  typeNotify?: string | undefined;
  ignoring?: boolean;
  console_error?: boolean;
};

export type ParamsError = {
  errorCustomFetchCode?: ParamsSubError;
  errorCustomApiGateway?: ParamsSubError;
  errorCustomApiGatewayTimeout?: ParamsSubError;
  errorCustomBackend?: ParamsSubError;
  errorCustomBackendUser?: ParamsSubError;
};

export const defaultParamsError: ParamsError = {
  errorCustomFetchCode: {
    typeNotify: "notifyError",
    ignoring: true,
    console_error: true,
  },
  errorCustomApiGateway: {
    typeNotify: "notifyError",
    ignoring: true,
    console_error: true,
  },
  errorCustomApiGatewayTimeout: {
    typeNotify: "notifyError",
    ignoring: true,
    console_error: true,
  },
  errorCustomBackend: {
    typeNotify: "notifyError",
    ignoring: true,
    console_error: true,
  },
  errorCustomBackendUser: {
    typeNotify: "notify",
    ignoring: true,
    console_error: true,
  },
};

export const descriptionErrorFront: string =
  "Error respuesta Front-end PDP: Fallo al consumir el servicio (%s) [0010002]";

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
      descriptionErrorFront.replace("%s", name_),
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
        peticion_?.obj
      );
    }
  } catch (error: any) {
    if (error instanceof ErrorCustomBackend) {
      throw error;
    } else {
      throw new ErrorCustomFetchCode(
        descriptionErrorFront.replace("%s", name_),
        error.message,
        `${function_name} - trx no exitosa para los errores del backend`,
        error_.errorCustomFetchCode?.typeNotify,
        error_.errorCustomFetchCode?.ignoring,
        error_.errorCustomFetchCode?.console_error
      );
    }
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
        peticion_?.obj
      );
    }
  } catch (error: any) {
    if (error instanceof ErrorCustomBackendUser) {
      throw error;
    } else {
      throw new ErrorCustomFetchCode(
        descriptionErrorFront.replace("%s", name_),
        error.message,
        `${function_name} - trx no exitosa, cuando status es false pero no hay errores`,
        error_.errorCustomFetchCode?.typeNotify,
        error_.errorCustomFetchCode?.ignoring,
        error_.errorCustomFetchCode?.console_error
      );
    }
  }
};

export const fetchCustom = async (
  url_: string,
  metodo_: "POST" | "PUT" | "GET",
  name_: string,
  params_: { [key: string]: any } = {},
  body_: { [key: string]: any } = {},
  error_: ParamsError = defaultParamsError,
  functionEvaluateResponse_: Function = FuctionEvaluateResponse
) => {
  const function_name = fetchCustom.name;
  let urlCompleto = url_;

  //armar error_
  try {
    const defaultParamsError_: any = { ...defaultParamsError };
    let assemble_error: any = { ...error_ };
    for (let key in defaultParamsError_) {
      if (assemble_error?.[key] === undefined)
        assemble_error[key] = defaultParamsError_[key];
    }
    error_ = { ...assemble_error };
  } catch (error: any) {
    throw new ErrorCustomFetchCode(
      descriptionErrorFront.replace("%s", name_),
      error.message,
      `${function_name} - armar error_`,
      error_.errorCustomFetchCode?.typeNotify,
      error_.errorCustomFetchCode?.ignoring,
      error_.errorCustomFetchCode?.console_error
    );
  }

  //armar parametros
  try {
    if (metodo_ === "GET" || metodo_ === "PUT") {
      if (Object.keys(params_).length > 0) {
        let paramsVector = Object.keys(params_);

        paramsVector = paramsVector.map((valueKey) => {
          return `${valueKey}=${params_[valueKey]}`;
        });
        urlCompleto += `?${paramsVector.join("&")}`;
      }
    }
  } catch (error: any) {
    throw new ErrorCustomFetchCode(
      descriptionErrorFront.replace("%s", name_),
      error.message,
      `${function_name} - armar parametros`,
      error_.errorCustomFetchCode?.typeNotify,
      error_.errorCustomFetchCode?.ignoring,
      error_.errorCustomFetchCode?.console_error
    );
  }

  //Realizar Petición
  let Peticion;
  try {
    if (metodo_ === "GET") {
      Peticion = await fetchData(urlCompleto, "GET", {}, {}, {}, true);
    } else if (metodo_ === "PUT") {
      Peticion = await fetchData(urlCompleto, "PUT", {}, body_, {}, true);
    } else if (metodo_ === "POST") {
      Peticion = await fetchData(urlCompleto, "POST", {}, body_, {}, true);
    }
  } catch (error: any) {
    throw new ErrorCustomFetchCode(
      descriptionErrorFront.replace("%s", name_),
      error.message,
      `${function_name} - Realizar Petición`,
      error_.errorCustomFetchCode?.typeNotify,
      error_.errorCustomFetchCode?.ignoring,
      error_.errorCustomFetchCode?.console_error
    );
  }
  //Evaluar si la respuesta es json
  try {
    if (typeof Peticion !== "object") {
      throw new ErrorCustomFetchCode(
        descriptionErrorFront.replace("%s", name_),
        "404 not found",
        `${function_name} - Evaluar si la respuesta es json`,
        error_.errorCustomFetchCode?.typeNotify,
        error_.errorCustomFetchCode?.ignoring,
        error_.errorCustomFetchCode?.console_error
      );
    }
  } catch (error) {
    throw error;
  }

  //evaluar respuesta de api gateway
  try {
    if (Peticion?.hasOwnProperty("status") === false) {
      //No es una respuesta directamente del servicio sino del api gateway
      if (Peticion?.hasOwnProperty("message") === true) {
        if (Peticion.message === "Endpoint request timed out") {
          throw new ErrorCustomApiGatewayTimeout(
            descriptionErrorFront.replace("%s", name_),
            Peticion.message,
            `${function_name} - evaluar respuesta de api gateway`,
            error_.errorCustomApiGatewayTimeout?.typeNotify,
            error_.errorCustomApiGatewayTimeout?.ignoring,
            error_.errorCustomApiGatewayTimeout?.console_error
          );
        } else {
          throw new ErrorCustomApiGateway(
            descriptionErrorFront.replace("%s", name_),
            Peticion.message,
            `${function_name} - evaluar respuesta de api gateway`,
            error_.errorCustomApiGateway?.typeNotify,
            error_.errorCustomApiGateway?.ignoring,
            error_.errorCustomApiGateway?.console_error
          );
        }
      }
    }
  } catch (error: any) {
    if (
      error instanceof ErrorCustomApiGateway ||
      error instanceof ErrorCustomApiGatewayTimeout
    ) {
      throw error;
    } else {
      throw new ErrorCustomFetchCode(
        descriptionErrorFront.replace("%s", name_),
        error.message,
        `${function_name} - evaluar respuesta de api gateway`,
        error_.errorCustomFetchCode?.typeNotify,
        error_.errorCustomFetchCode?.ignoring,
        error_.errorCustomFetchCode?.console_error
      );
    }
  }

  //evaluar la respuesta que llega del backend
  try {
    return functionEvaluateResponse_(Peticion, name_, error_);
  } catch (error) {
    throw error;
  }
};

export class ErrorCustomFetch extends Error {
  error_name: string;
  error_msg_front: string;
  error_msg_console: string;
  error_msg_sequence: string;
  typeNotify: string | undefined;
  ignoring: boolean;
  console_error: boolean;
  res_obj: { [key: string]: any } | undefined;

  constructor(
    error_name: string,
    error_msg_front: string,
    error_msg_console: string,
    error_msg_sequence: string,
    typeNotify: string | undefined,
    ignoring: boolean,
    console_error: boolean,
    res_obj?: { [key: string]: any }
  ) {
    super(error_msg_front);
    this.error_name = error_name;
    this.error_msg_front = error_msg_front;
    this.error_msg_console = error_msg_console;
    this.error_msg_sequence = error_msg_sequence;
    this.typeNotify = typeNotify;
    this.ignoring = ignoring;
    this.console_error = console_error;
    this.res_obj = res_obj;
    if (this.ignoring === false && this.typeNotify !== undefined) {
      if (this.typeNotify === "notifyError") {
        notifyError(this.error_msg_front, 5000, { toastId: "notify-lot" });
      } else if (this.typeNotify === "notify") {
        notify(this.error_msg_front);
      }
    }
    if (console_error === true) {
      const name_console_error = this.error_msg_front.split(":");
      console.error(name_console_error[0], {
        "Error Name": error_name,
        "Error PDP": this.error_msg_front,
        "Error Sequence": this.error_msg_sequence,
        "Error Console": `${this.error_msg_console}`,
      });
    }
  }
}

export class ErrorCustomFetchCode extends ErrorCustomFetch {
  constructor(
    error_msg_front: string,
    error_msg_console: string,
    error_msg_sequence: string,
    typeNotify: string = "notifyError",
    ignoring: boolean = false,
    console_error: boolean = true
  ) {
    super(
      "ErrorCustomFetchCode",
      error_msg_front,
      error_msg_console,
      error_msg_sequence,
      typeNotify,
      ignoring,
      console_error
    );
  }
}

export class ErrorCustomUseHookCode extends ErrorCustomFetch {
  constructor(
    error_msg_front: string,
    error_msg_console: string,
    error_msg_sequence: string,
    typeNotify: string = "notifyError",
    ignoring: boolean = false,
    console_error: boolean = true
  ) {
    super(
      "ErrorCustomUseHookCode",
      error_msg_front,
      error_msg_console,
      error_msg_sequence,
      typeNotify,
      ignoring,
      console_error
    );
  }
}

export class ErrorCustomComponentCode extends ErrorCustomFetch {
  constructor(
    error_msg_front: string,
    error_msg_console: string,
    error_msg_sequence: string,
    typeNotify: string = "notifyError",
    ignoring: boolean = false,
    console_error: boolean = true
  ) {
    super(
      "ErrorCustomComponenteCode",
      error_msg_front,
      error_msg_console,
      error_msg_sequence,
      typeNotify,
      ignoring,
      console_error
    );
  }
}

export class ErrorCustomApiGateway extends ErrorCustomFetch {
  constructor(
    error_msg_front: string,
    error_msg_console: string,
    error_msg_sequence: string,
    typeNotify: string = "notifyError",
    ignoring: boolean = false,
    console_error: boolean = true
  ) {
    super(
      "ErrorCustomApiGateway",
      error_msg_front,
      error_msg_console,
      error_msg_sequence,
      typeNotify,
      ignoring,
      console_error
    );
  }
}

export class ErrorCustomApiGatewayTimeout extends ErrorCustomFetch {
  constructor(
    error_msg_front: string,
    error_msg_console: string,
    error_msg_sequence: string,
    typeNotify: string = "notifyError",
    ignoring: boolean = false,
    console_error: boolean = true
  ) {
    super(
      "ErrorCustomApiGatewayTimeout",
      error_msg_front,
      error_msg_console,
      error_msg_sequence,
      typeNotify,
      ignoring,
      console_error
    );
  }
}

export class ErrorCustomBackend extends ErrorCustomFetch {
  constructor(
    error_msg_front: string,
    error_msg_console: string,
    error_msg_sequence: string,
    typeNotify: string = "notifyError",
    ignoring: boolean = false,
    console_error: boolean = true,
    res_obj?: { [key: string]: any }
  ) {
    super(
      "ErrorCustomBackend",
      error_msg_front,
      error_msg_console,
      error_msg_sequence,
      typeNotify,
      ignoring,
      console_error,
      res_obj
    );
  }
}

export class ErrorCustomBackendUser extends ErrorCustomFetch {
  constructor(
    error_msg_front: string = "desconocido",
    error_msg_console: string = "desconocido",
    error_msg_sequence: string = "desconocido",
    typeNotify: string | undefined = "notify",
    ignoring: boolean = false,
    console_error: boolean = true,
    res_obj?: { [key: string]: any }
  ) {
    super(
      "ErrorCustomBackendUser",
      error_msg_front,
      error_msg_console,
      error_msg_sequence,
      typeNotify,
      ignoring,
      console_error,
      res_obj
    );
  }
}

export class ErrorCustomBackendPendingTrx extends ErrorCustomBackend {
  constructor(
    error_msg_sequence: string = "throw - custom",
    res_obj?: { [key: string]: any },
    id_trx?: number | null
  ) {
    super(
      "Su transacción quedó en estado pendiente, por favor consulte el estado de la transacción en aproximadamente 1 minuto en el modulo de transacciones",
      "En este error no se puede definir el estado de la transaccion",
      error_msg_sequence,
      "notifyError",
      false,
      true,
      res_obj
    );
    if (id_trx !== undefined && id_trx !== null)
      notifyError(`id_trx = ${id_trx}`, 5000, {
        toastId: "notify-lot-ErrorCustomBackendPendingTrx",
      });
  }
}
