import fetchData from "../../../utils/fetchData";
// const urlSoat = process.env.REACT_APP_PRACTISISTEMAS+'/ventaSoat';
const urlSoat = process.env.REACT_APP_PRACTISISTEMAS + "/ventaSoat";

export const fetchConsultarSoat = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlSoat}/consultaDatosUsuarioSoat`,
      "POST",
      {},
      bodyObj,
      {},
      true
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const fetchTransaccionSoat = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlSoat}/transacciones`,
      "POST",
      {},
      bodyObj,
      {},
      true,
      29000
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};
// estadoReintentoPagoSoat era igual a 35s
export const estadoReintentoPagoSoat = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlSoat}/reintentoTimeOut`,
      "POST",
      {},
      bodyObj,
      {},
      true
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};
// estadoReintentoPagoSoat era igual a 35s
export const estadoTransaccionConsRec = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlSoat}/consultaFinalCosnRec`,
      "POST",
      {},
      bodyObj,
      {},
      true,
      10000
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const estadoVentaSoat = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlSoat}/estadoRecarga`,
      "POST",
      {},
      bodyObj,
      {},
      true
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};
