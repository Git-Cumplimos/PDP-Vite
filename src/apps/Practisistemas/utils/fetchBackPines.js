import fetchData from "../../../utils/fetchData";

const urlPines = `${process.env.REACT_APP_PRACTISISTEMAS}/pines`;

export const postConsultaPines = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlPines}/consultaPines`,
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

export const postConsultaPin = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }  
  try {
    const res = await fetchData(
      `${urlPines}/consultaPin`,
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

export const postCheckReintentoPines = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlPines}/revisionpines`,
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

export const postRevisarTransaccion = async (bodyObj) => {
  if (!bodyObj) {
    return "No hay datos en el body";
  }
  try {
    const res = await fetchData(
      `${urlPines}/revisarTransaccion`,
      "POST",
      {},
      bodyObj,
      {},
      true,
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};
