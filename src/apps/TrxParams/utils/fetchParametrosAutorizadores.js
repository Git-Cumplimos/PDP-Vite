import fetchData from "../../../utils/fetchData";

const urlParametrosAutorizadores = process.env.REACT_APP_URL_COMISIONES;

export const postParametrosAutorizadores = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlParametrosAutorizadores}/tabla_parametros_autorizadores/crear`,
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

export const fetchParametrosAutorizadores = async (obj) => {
  // if (!nombre_autorizador) {
  //   return { maxPages: 0, results: [] };
  // }
  try {
    const res = await fetchData(
      `${urlParametrosAutorizadores}/tabla_parametros_autorizadores/consultar_parametros_autorizadores`,
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

export const putParametrosAutorizadores = async (argsObj, bodyObj) => {
  if (!argsObj || !bodyObj) {
    return "Sin datos de url ni body";
  }
  try {
    const res = await fetchData(
      `${urlParametrosAutorizadores}/tabla_parametros_autorizadores/modificar`,
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
