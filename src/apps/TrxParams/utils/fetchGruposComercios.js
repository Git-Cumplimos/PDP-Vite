import fetchData from "../../../utils/fetchData";
const urlComisiones =
  process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;

export const fetchGruposComercios = async (obj) => {
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-grupo-comercios/consultar-grupo-comercios`,
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
export const postGruposComercios = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-grupo-comercios/crear-grupo-comercios`,
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
export const putGruposComercios = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-grupo-comercios/actualizar-grupo-comercios?pk_tbl_grupo_comercios`,
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
