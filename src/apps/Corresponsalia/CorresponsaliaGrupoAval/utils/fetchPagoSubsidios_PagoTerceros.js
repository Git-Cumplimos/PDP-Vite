import fetchData from "../../../../utils/fetchData";
import { notify, notifyError } from "../../../../utils/notify";

export const fetchCustomPost = async (url_, name_, data_) => {
  let Peticion;
  try {
    Peticion = await fetchData(url_, "POST", {}, data_, {}, true);
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
            `Error respuesta Front-end PDP: Timeout al consumir el servicio (${name_}) [0010002]`,
            "Timeout"
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
        error.message
      );
    }
  }

  //para los errores customizados del backend
  try {
    if (
      Peticion?.status === false &&
      Peticion?.obj?.error_status === true &&
      Peticion?.msg
    ) {
      throw new ErrorCustomBackend(`${Peticion?.msg}`, `${Peticion?.msg}`);
    }

    // cuando status es false pero no hay errores
    if (
      Peticion?.status === false &&
      Peticion?.obj?.error_status === false &&
      Peticion?.msg
    ) {
      throw new msgCustomBackend(`${Peticion?.msg}`, `${Peticion?.msg}`);
    }
  } catch (error) {
    if (error instanceof ErrorCustomBackend) {
      throw error;
    } else if (error instanceof msgCustomBackend) {
      throw error;
    } else {
      throw new ErrorCustomFetch(
        `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_}) [0010002]`,
        error.message
      );
    }
  }

  return Peticion;
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
    super(message, "ErrorCustomTimeout", error_msg, "notifyError");
  }
}

export class ErrorCustomBackend extends ErrorCustom {
  constructor(message, error_msg) {
    super(message, "ErrorCustomBackend", error_msg, "notifyError");
  }
}

export class msgCustomBackend extends ErrorCustom {
  constructor(message, error_msg) {
    super(message, "msgCustomBackend", error_msg, "notify");
  }
}
