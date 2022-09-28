import fetchData from "../../../utils/fetchData";
import { notifyError } from "../../../utils/notify";
import { Auth } from "@aws-amplify/auth";
const url_compra_paquetes = `${process.env.REACT_APP_URL_MOVISTAR}/movistar/compra-paquetes/comprar`;

export const fetchCompraPaquetes = async (data_) => {
  try {
    const Peticion = await fetchData(url_compra_paquetes, "POST", {}, data_);
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

export const subirArchivo = async (url_, file_) => {
  try {
    const res = await fetchData(url_, "POST", {}, file_, {}, true);

    if (!res?.status) {
      if (res?.msg) {
        throw new Error(res?.msg, { cause: "custom" });
      }
      throw new Error(res, { cause: "custom" });
    }

    return res;
  } catch (err) {
    throw err;
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
      const error_msg_vector_not_damage = [];
      const error_msg_vector_damage = [];
      error_msg_key.map((nombre_error) => {
        const error_msg_ind = error_msg[nombre_error];
        if (error_msg_ind?.damage == true) {
          error_msg_vector_damage.push(`${error_msg_ind?.description}`);
          throw new ErrorCustomBackend(error_msg_vector_damage, error_msg_key);
        } else {
          error_msg_vector_not_damage.push(`${error_msg_ind?.description}`);
          throw new ErrorCustomBackendUser(
            error_msg_vector_not_damage,
            error_msg_key
          );
        }
      });
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

export const fetchUploadFileCustom = async (url_, formData_) => {
  try {
    const Peticion = await fetch(url_, {
      method: "POST",
      body: formData_,
      mode: "no-cors",
    });
    return Peticion;
  } catch (error) {
    throw error;
  }
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
