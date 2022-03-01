import fetchData from "../../../utils/fetchData";

const urlConfiguracionComercios = process.env.REACT_APP_URL_COMISIONES;

export const postConfiguracionComercios = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlConfiguracionComercios}/configuracion_comercios/crear`,
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

export const fetchConfiguracionComercios = async (obj) => {
  // if (!nombre_autorizador) {
  //   return { maxPages: 0, results: [] };
  // }
  try {
    const res = await fetchData(
      `${urlConfiguracionComercios}/configuracion_comercios/consultar_configuracion_comercios`,
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

export const putConfiguracionComercios = async (argsObj, bodyObj) => {
  if (!argsObj || !bodyObj) {
    return "Sin datos de url ni body";
  }
  try {
    const res = await fetchData(
      `${urlConfiguracionComercios}/configuracion_comercios/modificar`,
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
