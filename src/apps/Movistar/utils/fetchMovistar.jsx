import fetchData from "../../../utils/fetchData";

export const PeticionRecarga = async (url_, data_) => {
  try {
    const Peticion = await fetchData(url_, "POST", {}, data_);
    // if (!Peticion?.error) {
    //   console.error(Peticion?.msg);
    // }
    return Peticion;
  } catch (error) {
    console.log("Error con fetch - no conecta al servicio");
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
    console.log("Error con fetch - no conecta al servicio");
  }
};

export const PeticionDescargar = async (url_) => {
  try {
    const response = await fetch(url_);
    const contentType = response.headers.get("content-type");
    console.log(Object.fromEntries(response.headers.entries()));
    if (contentType == "application/zip") {
      const byts = await response.blob();
      const blob = new Blob([byts], { type: "application/zip" });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "conciliacion";
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
    console.log("Error con fetch - no conecta al servicio");
  }
};
