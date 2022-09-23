import fetchData from "../../../utils/fetchData";
import { notifyError } from "../../../utils/notify";

export const fetchCustom = async (url_, metodo_, name_, data_ = {}) => {
  let Peticion;
  try {
    if (metodo_ == "POST") {
      Peticion = await fetchData(url_, "POST", {}, data_, {}, true);
    } else if (metodo_ == "GET") {
      Peticion = await fetchData(url_, "GET", {}, {}, {}, true);
    }
  } catch (error) {
    notifyError(`Falla en el sistema: no conecta con el servicio ${name_}`);
    throw new ErrorCustom(error.message);
  }

  console.log(Peticion);
  //para los errores customizados del backend
  try {
    if (
      Peticion?.status == false &&
      Peticion?.obj?.error == true &&
      Peticion?.obj?.error_msg
    ) {
      const error_msg = Peticion?.obj?.error_msg;
      const error_msg_key = Object.keys(error_msg);
      const error_msg_vector = [];
      error_msg_key.map((nombre_error) => {
        const error_msg_ind = error_msg[nombre_error];
        if (error_msg_ind?.damage && error_msg_ind?.damage == true) {
          error_msg_vector.push(`${error_msg_ind?.description}`);
        }
      });
      throw new ErrorCustomBackend(error_msg_vector, error_msg_key);
    }

    // cuando status es false pero no hay errores
    if (
      Peticion?.status == false &&
      Peticion?.obj?.error == false &&
      Peticion?.msg
    ) {
      throw new msgCustomBackend(`${Peticion?.msg}`);
    }
  } catch (error) {
    if (error instanceof ErrorCustomBackend) {
      throw new ErrorCustomBackend(error.message, error.type);
    } else if (error instanceof msgCustomBackend) {
      throw new msgCustomBackend(error.message);
    } else {
      notifyError("Falla en el sistema: error con el fetch [Front]");
      throw new ErrorCustom(error.message);
    }
  }

  return Peticion;
};

export class ErrorCustom extends Error {
  constructor(message) {
    super(message);
    this.name = "ErrorCustom";
  }
}

export class ErrorCustomBackend extends Error {
  constructor(message, type_) {
    super(message);
    this.type = type_;
    this.name = "ErrorCustomBackend";
  }
}

export class msgCustomBackend extends Error {
  constructor(message) {
    super(message);
    this.name = "msgCustomBackend";
  }
}
