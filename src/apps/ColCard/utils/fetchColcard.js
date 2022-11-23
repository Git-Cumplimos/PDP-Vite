import fetchData from "../../../utils/fetchData";

const url = process.env.REACT_APP_URL_COLCARD;
export const postConsultarTarjetaColcard = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${url}puntoDePagoColCard/consultarTarjetaTranscaribe`,
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

export const postRecargarTarjetaColcard = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${url}puntoDePagoColCard/recargarTarjetaTranscaribe`,
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
