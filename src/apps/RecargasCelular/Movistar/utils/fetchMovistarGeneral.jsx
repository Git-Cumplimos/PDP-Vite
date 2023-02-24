import fetchData from "../../../../utils/fetchData";
import { notify, notifyError } from "../../../../utils/notify";

export const fetchCustom = (url_, metodo_, name_) => {
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
          `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_}) [0010002]`,
          Peticion
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
            throw new ErrorCustomTimeout(
              `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_}) [0010002]`,
              "timeout"
            );
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
          `no conecta con el servicio ${name_}`
        );
      }
    }
    //evaluar la respuesta que llega del backend
    try {
      return EvaluateResponse(Peticion, name_);
    } catch (error) {
      throw error;
    }
  };
};

export const EvaluateResponse = (res, name_) => {
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
  if (
    res?.status === false &&
    res?.obj?.error === true &&
    res?.obj?.error_msg
  ) {
    MetodoError1(res?.obj?.error_msg, name_);
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

const MetodoError1 = (error_msg_, name_) => {
  try {
    const error_msg = error_msg_;
    const error_msg_key = Object.keys(error_msg);
    const error_msg_vector = [];
    error_msg_key.map((nombre_error) => {
      const error_msg_ind = error_msg[nombre_error];
      if (error_msg_ind?.damage && error_msg_ind?.damage === true) {
        error_msg_vector.push(`${error_msg_ind?.description}`);
      }
    });
    throw new ErrorCustomBackend(error_msg_vector.join(", "), error_msg);
  } catch (error) {
    if (error instanceof ErrorCustomBackend) {
      throw new ErrorCustomBackend(error.message, error.error_msg);
    } else {
      throw new ErrorCustomFetch(
        `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_}) [0010002]`,
        error.message
      );
    }
  }
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
  constructor(message, error_msg) {
    super(message, "ErrorCustomTimeout", error_msg, null);
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
