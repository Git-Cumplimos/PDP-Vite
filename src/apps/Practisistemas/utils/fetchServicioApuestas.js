import fetchData from "../../../utils/fetchData";

// const urlRecargasCelular = `${process.env.REACT_APP_RECARGAS_CELULAR}`;
const urlApuestasDeportivas = process.env.REACT_APP_PRACTISISTEMAS+'/apuestasDeportivas';

export const postConsultaCasasApuestas = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlApuestasDeportivas}/TablaCasaApuestas`,
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

export const postCasaApuestas = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlApuestasDeportivas}/casaApuestas`,
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

export const postInsertCasaApuestas = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlApuestasDeportivas}/insercionTablaCasaApuestas`,
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

export const postDeleteCasaApuestas = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlApuestasDeportivas}/eliminacionTablaCasaApuestas`,
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
      `${urlApuestasDeportivas}/recarga`,
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
      `${urlApuestasDeportivas}/reintento_recarga`,
      "POST",
      {},
      bodyObj,
      {},
      true,
      35000
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};