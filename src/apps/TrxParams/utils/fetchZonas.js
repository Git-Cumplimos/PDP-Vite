import fetchData from "../../../utils/fetchData";

const urlParametrizacion =
  process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;

export const fetchZonas = async (obj) => {
  try {
    const res = await fetchData(
      `${urlParametrizacion}/zonas/all`,
      "POST",
      {},
      obj
    );
    if (res?.status) {
      return res?.obj;
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};

export const postCreateZona = async (obj) => {
  try {
    const res = await fetchData(
      `${urlParametrizacion}/zonas/create`,
      "POST",
      {},
      obj
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const putEditZona = async (obj) => {
  try {
    const res = await fetchData(
      `${urlParametrizacion}/zonas/update`,
      "PUT",
      {},
      obj
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const postDeleteZona = async (obj) => {
  try {
    const res = await fetchData(
      `${urlParametrizacion}/zonas/delete`,
      "POST",
      {},
      obj
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};
