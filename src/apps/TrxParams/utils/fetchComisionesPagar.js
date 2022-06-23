import fetchData from "../../../utils/fetchData";
const urlComisiones = process.env.REACT_APP_URL_COMISIONES;

export const postComisionesPagar = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComisiones}/comision/crear`,
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

export const fetchComisionesPagar = async (obj) => {
  try {
    const res = await fetchData(
      `${urlComisiones}/comision/consultar_comisiones`,
      "POST",
      {},
      obj
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
export const putComisionesPagar = async (argsObj, bodyObj) => {
  if (!argsObj || !bodyObj) {
    return "Sin datos de url ni body";
  }
  try {
    const res = await fetchData(
      `${urlComisiones}/comision/modificar`,
      "PUT",
      argsObj,
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
