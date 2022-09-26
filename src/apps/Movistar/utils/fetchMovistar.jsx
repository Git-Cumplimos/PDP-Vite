import fetchData from "../../../utils/fetchData";
import { Auth } from "@aws-amplify/auth";
import { notifyError } from "../../../utils/notify";

const URL_Recarga = `${process.env.REACT_APP_URL_MOVISTAR}/recargasmovistar/prepago`;
const url_movistar_conciliacion_buscar = `${process.env.REACT_APP_URL_MOVISTAR}/movistar/conciliacion/buscar`;
const url_movistar_conciliacion_archivo_movistar = `${process.env.REACT_APP_URL_MOVISTAR}/movistar/conciliacion/archivo-movistar`;

export const PeticionRecarga = async (data_) => {
  try {
    const Peticion = await fetchData(URL_Recarga, "POST", {}, data_);
    console.log(Peticion);
    if ((Peticion.status != undefined) == false) {
      // Api getwey
      notifyError("Error con fetch, timed out con el servicio de recargas");
    }
    return Peticion;
  } catch (error) {
    console.log(error);
    throw "Error con fetch - no conecta con el servicio del recargas";
  }
};

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
