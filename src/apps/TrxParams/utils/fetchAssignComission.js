import fetchData from "../../../utils/fetchData";
const urlComisiones =
  process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;

export const postAsignacionesComisiones = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-asignacion-comisiones/crear-asignacion-comision`,
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
export const fetchAsignacionesComisiones = async (obj) => {
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-asignacion-comisiones/consultar-asignacion-comision`,
      "GET",
      obj,
      {}
    );
    if (res?.status) {
      return { ...res?.obj };
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};
export const putAsignacionesComisiones = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-asignacion-comisiones/actualizar-asignacion-comision?pk_asignacion_comisiones`,
      "PUT",
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
