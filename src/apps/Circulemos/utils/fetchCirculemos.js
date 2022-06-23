import fetchData from "../../../utils/fetchData";

const urls = {
  consultaPrefactura: `${process.env.REACT_APP_URL_CIRCULEMOS}servicio_consulta`,
  pagarPrefactura: `${process.env.REACT_APP_URL_CIRCULEMOS}servicio_pago`,
};

export const consultarPrefactura = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(
      urls?.consultaPrefactura,
      "POST",
      {},
      bodyObj,
      {},
      false
    );
    return res;
  } catch (err) {
    throw err;
  }
};

export const pagarPrefactura = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(
      urls?.pagarPrefactura,
      "POST",
      {},
      bodyObj,
      {},
      false
    );
    return res;
  } catch (err) {
    throw err;
  }
};
