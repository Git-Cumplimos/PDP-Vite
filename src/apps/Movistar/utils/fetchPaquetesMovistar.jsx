import fetchData from "../../../utils/fetchData";
import { notifyError } from "../../../utils/notify";
import { Auth } from "@aws-amplify/auth";
const url_compra_paquetes = `${process.env.REACT_APP_URL_MOVISTAR}/movistar/compra-paquetes/comprar`;

export const fetchCompraPaquetes = async (data_) => {
  try {
    const Peticion = await fetchData(url_compra_paquetes, "POST", {}, data_);
    console.log(Peticion);
    if ((Peticion.status != undefined) == false) {
      // Api getwey
      notifyError(
        "Error con fetch, timed out con el servicio de compra de paquetes"
      );
    }
    return Peticion;
  } catch (error) {
    throw "Error con fetch - no conecta con el servicio de compra de paquetes";
  }
};

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
        if (error_msg_ind?.damage == true) {
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

export const fetchUploadFile = async (url_, file_, name_) => {
  const session = await Auth.currentSession();

  let formData = new FormData();
  formData.append("file", file_);
  try {
    const resPeticion = await fetch(url_, {
      headers: {
        Authorization: `Bearer ${session?.idToken?.jwtToken}`,
      },
      method: "POST",
      body: formData,
    });
    const Peticion = resPeticion.json();
    if (Peticion.status != undefined) {
      // Api getwey
      notifyError(`Error con fetch, timed out con el servicio ${name_}`);
      throw `Error con fetch, timed out con el servicio ${name_}`;
    }
    return Peticion;
  } catch (error) {
    notifyError(`Falla en el sistema: no conecta al servicio ${name_}`);
    throw `Falla en el sistema: no conecta al servicio ${name_}`;
  }
};

export const fetchUploadFileCustom = async (url_, file_, name_) => {
  let Peticion;
  try {
    Peticion = await fetchUploadFile(url_, file_, name_);
  } catch (error) {
    throw new ErrorCustom(error);
  }
  try {
    console.log(Peticion);
    if (
      Peticion?.status == false &&
      Peticion?.obj?.error == true &&
      Peticion?.obj?.error_msg
    ) {
      const error_msg = Peticion?.obj?.error_msg;
      const error_msg_key = Object.keys(error_msg);
      const error_msg_vector_not_damage = [];
      const error_msg_vector_damage = [];

      error_msg_key.map((nombre_error) => {
        const error_msg_ind = error_msg[nombre_error];
        if (error_msg_ind?.damage == false) {
          error_msg_vector_not_damage.push(`${error_msg_ind?.description}`);
        } else {
          error_msg_vector_damage.push(`${error_msg_ind?.description}`);
        }
      });
      if (error_msg_vector_not_damage.length > 0) {
        throw new ErrorCustomBackendUser(
          error_msg_vector_not_damage,
          error_msg_key
        );
      } else {
        throw new ErrorCustomBackend(error_msg_vector_damage, error_msg_key);
      }
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
    if (error instanceof ErrorCustomBackendUser) {
      throw new ErrorCustomBackendUser(error.message, error.type);
    } else if (error instanceof ErrorCustomBackend) {
      throw new ErrorCustomBackend(error.message, error.type);
    } else if (error instanceof msgCustomBackend) {
      throw new msgCustomBackend(error.message);
    } else {
      notifyError("Falla en el sistema: error de código");
      throw new ErrorCustom("Falla en el sistema: error de código");
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

export class ErrorCustomBackendUser extends Error {
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
