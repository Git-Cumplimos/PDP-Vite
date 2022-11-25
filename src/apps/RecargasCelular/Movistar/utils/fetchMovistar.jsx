import fetchData from "../../../../utils/fetchData";
import { notifyError } from "../../../../utils/notify";
import { Auth } from "@aws-amplify/auth";

const url_movistar_conciliacion_buscar = `${process.env.REACT_APP_URL_MOVISTAR}/servicio-conciliaciones/get-conciliacion`;
const url_movistar_conciliacion_archivo_movistar = `${process.env.REACT_APP_URL_MOVISTAR}/servicio-conciliaciones/subir-conciliacion-movistar`;

export const PeticionConciliacionBuscar = async (params_ = "") => {
  try {
    let adicion = "";
    if (params_ != "") {
      adicion = "?";
    }
    const Peticion = await fetchData(
      url_movistar_conciliacion_buscar + adicion + params_,
      "GET",
      {},
      {},
      {},
      true,
      360000
    );

    if (!Peticion?.status && Peticion?.obj?.error && Peticion?.obj?.error_msg) {
      let error_msg = Peticion?.obj?.error_msg;
      error_msg = error_msg[0].split(">>>>");
      notifyError(`Falla en el sistema: ${error_msg[1]} ${error_msg[0]} `);
    }
    return Peticion;
  } catch (error) {
    notifyError(
      "Falla en el sistema: no conecta al servicio conciliacion/buscar"
    );
  }
};

export const PeticionConciliacion = async (url_) => {
  try {
    const Peticion = await fetchData(url_, "GET", {}, {});
    if (!Peticion?.status) {
      console.error(Peticion?.msg);
    }
    return Peticion;
  } catch (error) {
    console.log("Error con fetch - no conecta al servicio de conciliación");
  }
};

export const PeticionDescargar = async (url_) => {
  const session = await Auth.currentSession();
  try {
    const response = await fetch(url_, {
      headers: {
        Authorization: `Bearer ${session?.idToken?.jwtToken}`,
      },
    });
    const contentType = response.headers.get("content-type");
    const nombreDocumento = response.headers
      .get("Content-Disposition")
      .slice(21);

    if (contentType == "application/zip") {
      const byts = await response.blob();
      const blob = new Blob([byts], { type: "application/zip" });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = nombreDocumento;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (contentType == "application/json") {
      const Peticion = await response.json();

      if (
        !Peticion?.status &&
        Peticion?.obj?.error &&
        Peticion?.obj?.error_msg
      ) {
        let error_msg = Peticion?.obj?.error_msg;
        error_msg = error_msg[0].split(">>>>");
        notifyError(`Falla en el sistema: ${error_msg[1]} ${error_msg[0]} `);
      }
    }
  } catch (error) {
    notifyError(
      "Falla en el sistema: no conecta al servicio conciliacion/descarga"
    );
  }
};

export const PeticionConciliacionCargar = async (file_, params_ = "") => {
  const session = await Auth.currentSession();
  let adicion = "";

  // try {
  if (params_ != "") {
    adicion = "?";
  }

  let formData = new FormData();
  formData.append("file", file_);

  try {
    const Peticion = await fetch(
      url_movistar_conciliacion_archivo_movistar + adicion + params_,
      {
        headers: {
          Authorization: `Bearer ${session?.idToken?.jwtToken}`,
        },
        method: "PUT",
        body: formData,
      }
    );
    const response = Peticion.json();
    if ((Peticion.status != undefined) == false) {
      // Api getwey
      notifyError(
        "Error con fetch, timed out con el servicio de cargar archivos"
      );
    }
    return response;
  } catch (error) {
    notifyError(
      "Falla en el sistema: no conecta al servicio conciliacion/archivo-movistar"
    );
  }
};

export const fetchCustom = async (
  url_,
  metodo_,
  name_,
  params_ = {},
  data_ = {}
) => {
  let Peticion;
  try {
    Peticion = await fetchData(url_, metodo_, {}, data_, {}, true);
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
