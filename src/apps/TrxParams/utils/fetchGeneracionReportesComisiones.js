import fetchData from "../../../utils/fetchData";
const urlComisiones = process.env.REACT_APP_URL_COMISIONES;
const urlComisionesNew =
  process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;
export const reportGenerationGeneralComisions = async (obj) => {
  // if (!nombre_autorizador) {
  //   return { maxPages: 0, results: [] };
  // }
  try {
    const res = await fetchData(
      `${urlComisiones}/reportes_comisiones/comisiones_general`,
      "POST",
      {},
      obj
    );
    if (res?.status) {
      return res;
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};
export const reporteConfiguracionComision = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComisionesNew}/servicio-reporte-configuracion-comision/reporte-configuracion-comision`,
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
