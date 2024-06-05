import { fetchDataTotpNoMsg } from "../../../utils/MFA";
import fetchData from "../../../utils/fetchData";
import { notify } from "../../../utils/notify";

export const fetchCustom = (
  url_: string,
  metodo_: string,
  name_: string,
  evaluate: boolean = true,
  notificacion: boolean = true,
  totp: boolean = false
) => {
  return async (params_ = {}, data_ = {}) => {
    let urlCompleto = url_;
    //armar parametros
    try {
      if (metodo_ === "GET" || metodo_ === "PUT") {
        if (Object.keys(params_).length > 0) {
          let paramsVector = Object.keys(params_);
          paramsVector.map(
            (valueKey, index) =>
              (paramsVector[index] = `${valueKey}=${params_[valueKey]}`)
          );
          urlCompleto += `?${paramsVector.join("&")}`;
        }
      }
    } catch (error: any) {
      throw new ErrorCustomFetch(
        `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_}) [0010002]`,
        error.message
      );
    }

    //Petición
    let Peticion;
    try {
      const fetchFunc = totp ? fetchDataTotpNoMsg : fetchData;
      if (metodo_ === "GET") {
        Peticion = await fetchFunc(urlCompleto, "GET", {}, {}, {}, true);
      } else if (metodo_ === "PUT") {
        Peticion = await fetchFunc(urlCompleto, "PUT", {}, data_, {}, true);
      } else if (metodo_ === "POST") {
        Peticion = await fetchFunc(urlCompleto, "POST", {}, data_, {}, true);
      }
    } catch (error: any) {
      if (error.message.includes("La OTP no es válida")) {
        throw new ErrorCustomFetch(error.message, error.message);
      }
      throw new ErrorCustomFetch(
        `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_}) [0010002]`,
        error.message
      );
    }
    //Evaluar si la respuesta es json
    try {
      if (typeof Peticion !== "object") {
        throw new ErrorCustomFetch(
          `Error respuesta Front-end PDP: Servicio no encontrado (${name_})`,
          "404 not found"
        );
        // }
      }
    } catch (error) {
      console.log("error", error);
      throw error;
    }
    //evaluar respuesta de api gateway
    try {
      if (Peticion?.hasOwnProperty("status") === false) {
        //No es una respuesta directamente del servicio sino del api gateway
        if (Peticion?.hasOwnProperty("message") === true) {
          if (Peticion.message === "Endpoint request timed out") {
            if (notificacion === true) {
              throw new ErrorCustomTimeout(
                `Error respuesta Front-end PDP: Timeout al consumir el servicio (${name_}) [0010002]`,
                "Timeout"
              );
            } else {
              throw new ErrorCustomTimeout(
                `Error respuesta Front-end PDP: Timeout al consumir el servicio (${name_}) [0010002]`,
                "Timeout",
                null
              );
            }
          } else {
            throw new ErrorCustomFetch(
              `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_}) [0010002]`,
              Peticion.message
            );
          }
        }
      }
    } catch (error: any) {
      if (error instanceof ErrorCustomTimeout) {
        throw error;
      } else if (error instanceof ErrorCustomFetch) {
        throw error;
      } else {
        throw new ErrorCustomFetch(
          `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_}) [0010002]`,
          error.message
        );
      }
    }
    try {
      if (evaluate === true) {
        return EvaluateResponse(Peticion, name_);
      } else {
        return Peticion;
      }
    } catch (error) {
      throw error;
    }
  };
};

export const EvaluateResponse = (res: any, name_ = "") => {
  // trx exitosa
  if (!res.hasOwnProperty("status")){
    const tempObject ={"archivoErrores":res}
    throw new ErrorCustomBackend("Error cargando el archivo", "Error cargando el archivo", tempObject);
  }
  try {
    if (res?.status === true) {
      return res;
    }
  } catch (error: any) {
    throw new ErrorCustomFetch(
      `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_}) [0010002]`,
      error.message
    );
  }
  // trx no exitosa
  //para los errores customizados del backend
  try {
    if (res?.status === false) {
      let tempObject = {};
      if (res.hasOwnProperty("obj")) {
        if (res.obj.hasOwnProperty("ticket")) {
          tempObject["ticket"] = res.obj.ticket;
        }
      }
      throw new ErrorCustomBackend(`${res?.msg}`, `${res?.msg}`, tempObject);
    }
  } catch (error: any) {
    if (error instanceof ErrorCustomBackend) {
      throw error;
    } else {
      throw new ErrorCustomFetch(
        `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_}) [0010002]`,
        error.message
      );
    }
  }
  // cuando status es false pero no hay errores
  try {
    if (res?.status === false && res?.obj?.error === false && res?.msg) {
      throw new msgCustomBackend(`${res?.msg}`, `${res?.msg}`);
    }
  } catch (error: any) {
    if (error instanceof msgCustomBackend) {
      throw error;
    } else {
      throw new ErrorCustomFetch(
        `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_}) [0010002]`,
        error.message
      );
    }
  }
};

export class ErrorCustom extends Error {
  error_msg: string | null;
  notificacion: string | null;
  optionalObject: any;
  constructor(
    message: string,
    name: string,
    error_msg: string | null,
    notificacion: string | null,
    optionalObject: any
  ) {
    super(message);
    this.name = name;
    this.error_msg = error_msg;
    this.notificacion = notificacion;
    this.optionalObject = optionalObject;
    if (this.notificacion === "notifyError") {
    } else if (this.notificacion === "notify") {
      notify(message);
    }

    if (
      this.name === "ErrorCustomFetch" ||
      this.name === "ErrorCustomTimeout"
    ) {
      console.error(`${message}\n ${this.error_msg}`);
    }
  }
}

export class ErrorCustomFetch extends ErrorCustom {
  constructor(message: string, error_msg: string, optionalObject = {}) {
    super(
      message,
      "ErrorCustomFetch",
      error_msg,
      "notifyError",
      optionalObject
    );
  }
}

export class ErrorCustomTimeout extends ErrorCustom {
  constructor(
    message: string,
    error_msg: string,
    notificacion: string | null = "notifyError",
    optionalObject = {}
  ) {
    super(
      message,
      "ErrorCustomTimeout",
      error_msg,
      notificacion,
      optionalObject
    );
  }
}

export class ErrorCustomBackend extends ErrorCustom {
  constructor(message: string, error_msg: string, optionalObject = {}) {
    super(message, "ErrorCustomBackend", error_msg, null, optionalObject);
  }
}

export class ErrorCustomBackendUser extends ErrorCustom {
  constructor(message: string, error_msg: string, optionalObject = {}) {
    super(message, "ErrorCustomBackendUser", error_msg, null, optionalObject);
  }
}

export class msgCustomBackend extends ErrorCustom {
  constructor(message: string, error_msg: string, optionalObject = {}) {
    super(message, "msgCustomBackend", error_msg, null, optionalObject);
  }
}
