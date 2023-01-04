import fetchData from "../../../utils/fetchData";

const urlComisiones =
  process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;

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
