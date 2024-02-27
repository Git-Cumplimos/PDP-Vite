import { fetchDataTotpNoMsg } from "../../../../utils/MFA";
import { cifrarAES, decryptAES } from "../../../../utils/cryptoUtils";
import fetchData from "../../../../utils/fetchData";
import { notify } from "../../../../utils/notify";

export const fetchCustom = (
  url_,
  metodo_,
  name_,
  evaluate = true,
  notificacion = true,
  totp = false
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
    } catch (error) {
      throw new ErrorCustomFetch(
        `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_}) [0010002]`,
        error.message
      );
    }

    //Petición
    let Peticion;
    let parseObj = JSON.stringify(data_);
    let dataObj = {
      data: cifrarAES(
        `${process.env.REACT_APP_LLAVE_AES_ENCRYPT_CORRESPONSALIA_OTROS}`,
        `${process.env.REACT_APP_IV_AES_ENCRYPT_CORRESPONSALIA_OTROS}`,
        parseObj
      ),
    };
    try {
      const fetchFunc = totp ? fetchDataTotpNoMsg : fetchData;
      if (metodo_ === "GET") {
        Peticion = await fetchFunc(urlCompleto, "GET", {}, {}, {}, true);
      } else if (metodo_ === "PUT") {
        Peticion = await fetchFunc(urlCompleto, "PUT", {}, dataObj, {}, true);
      } else if (metodo_ === "POST") {
        Peticion = await fetchFunc(urlCompleto, "POST", {}, dataObj, {}, true);
      }
    } catch (error) {
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
    } catch (error) {
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
      const dataDecrypt = Peticion?.obj?.data ?? "";
      const obj = decryptAES(
        `${process.env.REACT_APP_LLAVE_AES_DECRYPT_CORRESPONSALIA_OTROS}`,
        `${process.env.REACT_APP_IV_AES_DECRYPT_CORRESPONSALIA_OTROS}`,
        dataDecrypt
      );
      Peticion.obj = JSON.parse(obj);
    } catch (error) {
      console.error(`No se puede desencriptar`);
      throw error;
    }
    //evaluar la respuesta que llega del backend
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

export const EvaluateResponse = (res, name_ = "") => {
  // trx exitosa
  try {
    if (res?.status === true) {
      return res;
    }
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  constructor(message, name, error_msg, notificacion, optionalObject) {
    super(message);
    this.name = name;
    this.error_msg = error_msg;
    this.notificacion = notificacion;
    this.optionalObject = optionalObject;
    if (this.notificacion === "notifyError") {
      console.log(message);
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
  constructor(message, error_msg, optionalObject = {}) {
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
    message,
    error_msg,
    notificacion = "notifyError",
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
  constructor(message, error_msg, optionalObject = {}) {
    super(message, "ErrorCustomBackend", error_msg, null, optionalObject);
  }
}

export class ErrorCustomBackendUser extends ErrorCustom {
  constructor(message, error_msg, optionalObject = {}) {
    super(message, "ErrorCustomBackendUser", error_msg, null, optionalObject);
  }
}

export class msgCustomBackend extends ErrorCustom {
  constructor(message, error_msg, optionalObject = {}) {
    super(message, "msgCustomBackend", error_msg, null, optionalObject);
  }
}
