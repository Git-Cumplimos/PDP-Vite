import fetchData from "../../../utils/fetchData";

const urlComisiones = process.env.REACT_APP_URL_COMISIONES;

export const postCodigoBarrasComercio = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComisiones}/codigo_barras_comercio/generar`,
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
