import fetchData from "../../../utils/fetchData";

const urlAutorizadores = process.env.REACT_APP_URL_REVAL_AUTORIZADOR;

export const postAutorizadores = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlAutorizadores}/autorizador`,
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
}

export const fetchAutorizadores = async (nombre_autorizador, page) => {
  if (!nombre_autorizador) {
    return { maxPages: 0, results: [] };
  }
  try {
    const res = await fetchData(`${urlAutorizadores}/infoauto`, "GET", {
      nombre_autorizador,
      page: isNaN(page) ? 1 : page,
    });
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

export const putAutorizadores = async (argsObj, bodyObj) => {
  if (!argsObj || !bodyObj) {
    return "Sin datos de url ni body";
  }
  try {
    const res = await fetchData(
      `${urlAutorizadores}/autorizador`,
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
