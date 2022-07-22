import fetchData from "../../../utils/fetchData";

const URL_Recarga = `${process.env.REACT_APP_URL_MOVISTAR}/recargasmovistar/prepago`;

export const PeticionRecarga = async (data_) => {
  try {
    const Peticion = await fetchData(URL_Recarga, "POST", {}, data_);
    return Peticion;
  } catch (error) {
    throw "Error con fetch - no conecta con el servicio de recargas";
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
    throw "Error con fetch - no conecta con el servicio de conciliación";
  }
};

export const PeticionDescargar = async (url_) => {
  try {
    const response = await fetch(url_);
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
      const json = await response.json();
      if (!json?.status) {
        console.error(json?.msg);
      }
    }
  } catch (error) {
    throw "Error con fetch - no conecta con el servicio de descarga conciliación";
  }
};
