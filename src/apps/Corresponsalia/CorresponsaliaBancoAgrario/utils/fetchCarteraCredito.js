import fetchData from "../../../../utils/fetchData";
import { notify, notifyError } from "../../../../utils/notify";

export const fetchCustom = (url_, metodo_, name_,evaluate=true,notificacion=true) => {
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
    try {
      if (metodo_ === "GET") {
        Peticion = await fetchData(urlCompleto, "GET", {}, {}, {}, true);
      } else if (metodo_ === "PUT") {
        Peticion = await fetchData(urlCompleto, "PUT", {}, data_, {}, true);
      } else if (metodo_ === "POST") {
        Peticion = await fetchData(urlCompleto, "POST", {}, data_, true);
      }
    } catch (error) {
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
      console.log("error", error)
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
                "Timeout",null
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
    return Peticion
  };
};

export class ErrorCustom extends Error {
  constructor(message, name, error_msg, notificacion) {
    super(message);
    this.name = name;
    this.error_msg = error_msg;
    this.notificacion = notificacion;
    if (this.notificacion === "notifyError") {
      notifyError(message);
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
  constructor(message, error_msg) {
    super(message, "ErrorCustomFetch", error_msg, "notifyError");
  }
}

export class ErrorCustomTimeout extends ErrorCustom {
  constructor(message, error_msg, notificacion = "notifyError") {
    super(message, "ErrorCustomTimeout", error_msg, notificacion);
  }
}

export class ErrorCustomBackend extends ErrorCustom {
  constructor(message, error_msg) {
    super(message, "ErrorCustomBackend", error_msg, null);
  }
}

export class ErrorCustomBackendUser extends ErrorCustom {
  constructor(message, error_msg) {
    super(message, "ErrorCustomBackendUser", error_msg, null);
  }
}

export class msgCustomBackend extends ErrorCustom {
  constructor(message, error_msg) {
    super(message, "msgCustomBackend", error_msg, null);
  }
}