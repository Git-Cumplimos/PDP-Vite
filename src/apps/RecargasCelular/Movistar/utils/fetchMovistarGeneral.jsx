import fetchData from "../../../../utils/fetchData";
import { notify, notifyError } from "../../../../utils/notify";

export const fetchCustom = (url_, metodo_, name_) => {
  return async (params_ = {}, data_ = {}) => {
    let urlCompleto = url_;
    //armar parametros
    try {
      if (metodo_ == "GET" || metodo_ == "PUT") {
        if (Object.keys(params_).length > 0) {
          let paramsVector = Object.keys(params_);
          paramsVector.map((valueKey, index) => {
            paramsVector[index] = `${valueKey}=${params_[valueKey]}`;
          });
          urlCompleto += `?${paramsVector.join("&")}`;
        }
      }
    } catch (error) {
      throw new ErrorCustomFetch(
        "error con el código del fetch debido a los datos de entrada",
        error.message
      );
    }

    //Petición
    let Peticion;
    try {
      if (metodo_ == "GET") {
        Peticion = await fetchData(urlCompleto, "GET", {}, {}, {}, true);
      } else if (metodo_ == "PUT") {
        Peticion = await fetchData(urlCompleto, "PUT", {}, data_, {}, true);
      } else if (metodo_ == "POST") {
        Peticion = await fetchData(urlCompleto, "POST", {}, data_, {}, true);
      }
      if ((Peticion.status != undefined) == false) {
        // Api getwey
        throw new ErrorCustomTimeout(
          `Falla en el sistema: timeout con el servicio '${name_}'`,
          "timeout"
        );
      }
    } catch (error) {
      throw new ErrorCustomFetch(
        `Falla en el sistema: no conecta con el servicio ${name_}`,
        error.message
      );
    }

    //evaluar la respuesta
    try {
      return EvaluateResponse(Peticion);
    } catch (error) {
      throw error;
    }
  };
};

export const EvaluateResponse = (res) => {
  // trx exitosa
  try {
    if (res?.status == true) {
      return res;
    }
  } catch (error) {
    throw new ErrorCustomFetch(
      `Falla en el sistema: error con el código del fetch al evaluar el status`,
      error.message
    );
  }

  // trx no exitosa
  //para los errores customizados del backend
  if (res?.status == false && res?.obj?.error == true && res?.obj?.error_msg) {
    MetodoError1(res?.obj?.error_msg);
  }

  // cuando status es false pero no hay errores
  try {
    if (res?.status == false && res?.obj?.error == false && res?.msg) {
      throw new msgCustomBackend(`${res?.msg}`, `${res?.msg}`);
    }
  } catch (error) {
    if (error instanceof msgCustomBackend) {
      throw new msgCustomBackend(error.message, error.error_msg);
    } else {
      throw new ErrorCustomFetch(
        `Falla en el sistema: error con el código del fetch al evaluar los errores`,
        error.message
      );
    }
  }
};

const MetodoError1 = (error_msg_) => {
  try {
    const error_msg = error_msg_;
    const error_msg_key = Object.keys(error_msg);
    const error_msg_vector = [];
    error_msg_key.map((nombre_error) => {
      const error_msg_ind = error_msg[nombre_error];
      if (error_msg_ind?.damage && error_msg_ind?.damage == true) {
        error_msg_vector.push(`${error_msg_ind?.description}`);
      }
    });
    throw new ErrorCustomBackend(error_msg_vector.join(", "), error_msg);
  } catch (error) {
    if (error instanceof ErrorCustomBackend) {
      throw new ErrorCustomBackend(error.message, error.error_msg);
    } else {
      throw new ErrorCustomFetch(
        `Falla en el sistema: error con el código del fetch al evaluar los mensajes`,
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
    if (this.notificacion == "notifyError") {
      notifyError(message);
    } else if (this.notificacion == "notifyError") {
      notify(message);
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
    super(message, "ErrorCustomTimeout", error_msg, "");
  }
}

export class ErrorCustomBackend extends ErrorCustom {
  constructor(message, error_msg) {
    super(message, "ErrorCustomBackend", error_msg, "");
  }
}

export class ErrorCustomBackendUser extends ErrorCustom {
  constructor(message, error_msg) {
    super(message, "ErrorCustomBackendUser", error_msg, "");
  }
}

export class msgCustomBackend extends ErrorCustom {
  constructor(message, error_msg) {
    super(message, "msgCustomBackend", error_msg, "");
  }
}
