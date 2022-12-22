import fetchData from "../../../utils/fetchData";
const urlComisiones =
  process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;

export const fetchGruposConvenios = async (obj) => {
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-grupo-convenios/consultar-grupo-convenios`,
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
export const postGruposConvenios = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-grupo-convenios/crear-grupo-convenios`,
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
export const putGruposConvenios = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-grupo-convenios/actualizar-grupo-convenios?pk_tbl_grupo_convenios`,
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
export const fetchConveniosGrupoConvenios = async (obj) => {
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-grupo-convenios/consultar-convenios-grupo-convenios`,
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
export const fetchConveniosNotInGruposConvenios = async (obj) => {
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-grupo-convenios/consultar-convenios-not-in-grupo-convenios`,
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
