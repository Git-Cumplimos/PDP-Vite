import fetchData from "../../../utils/fetchData";
const urlComisiones = process.env.REACT_APP_URL_COMISIONES;

export const postTransferenciaComisiones = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-wallet-comisiones/transferencia-wallet-comercio-cupo`,
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
