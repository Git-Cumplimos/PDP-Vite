import fetchData from "../../../utils/fetchData";

// const urlRecargasCelular = `${process.env.REACT_APP_RECARGAS_CELULAR}`;
const urlRecargasCelular =
  process.env.REACT_APP_PRACTISISTEMAS + "/recargasCelular";

export const postConsultaOperadores = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlRecargasCelular}/operadores`,
      "POST",
      {},
      bodyObj,
      {},
      true
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res?.obj;
  } catch (err) {
    throw err;
  }
};
export const postConsultaPaquetes = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlRecargasCelular}/paquetes`,
      "POST",
      {},
      bodyObj,
      {},
      true
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res?.obj;
  } catch (err) {
    throw err;
  }
};

export const postEnvioTrans = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlRecargasCelular}/recarga`,
      "POST",
      {},
      bodyObj,
      {},
      true,
      60000
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const postCheckReintentoRecargas = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlRecargasCelular}/reintento_recarga`,
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

export const postEstadoRecarga = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlRecargasCelular}/estadoRecarga`,
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
