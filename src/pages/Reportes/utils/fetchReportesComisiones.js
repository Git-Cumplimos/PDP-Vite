import fetchData from "../../../utils/fetchData";

const urlComisiones =
  process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;
const urlComercios = process.env.REACT_APP_URL_SERVICE_COMMERCE;

export const descargarReporte = (url) => {
  return async (body) => {
    if (!body) {
      throw new Error("Sin datos en el body", { cause: "custom" });
    }
    try {
      const res = await fetchData(url, "POST", {}, body);
      
      if (!res?.status) throw res?.msg;

      return res;
    } catch (err) {
      throw err
    }
  };
};

export const downloadReport = descargarReporte(
  `${urlComercios}/download-report-commerce`
);

export const postObtenerReporteComisionesAplicadas = async (bodyObj) => {
  // if (!bodyObj) {
  //   return "Sin datos body";
  // }
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-reporte-aplicacion-comision/reporte-aplicacion-comision`,
      "POST",
      {},
      bodyObj
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};
export const postObtenerReporteComisionesAplicadasComercio = async (
  bodyObj
) => {
  // if (!bodyObj) {
  //   return "Sin datos body";
  // }
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-reporte-aplicacion-comision/reporte-aplicacion-comision-comercio`,
      "POST",
      {},
      bodyObj
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const postObtenerReporteConteoComisionesAplicadas = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-reporte-aplicacion-comision/reporte-conteo-aplicacion-comision`,
      "POST",
      {},
      bodyObj
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};
export const postObtenerReporteHistoricoConteoComisionesAplicadas = async (
  bodyObj
) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-reporte-aplicacion-comision/reporte-historico-conteo-aplicacion-comision`,
      "POST",
      {},
      bodyObj
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};
