import fetchData from "../../../utils/fetchData";
const urlComisiones =
  process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;

export const fetchGruposPlanesComisiones = async (obj) => {
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-grupo-planes/consultar-grupo-planes`,
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
export const fetchPlanesGruposPlanesComisiones = async (obj) => {
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-grupo-planes/consultar-planes-grupo-planes`,
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
export const postGruposPlanesComisiones = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-grupo-planes/crear-grupo-planes`,
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
export const putGruposPlanesComisiones = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-grupo-planes/actualizar-grupo-planes?pk_tbl_grupo_planes_comisiones`,
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
