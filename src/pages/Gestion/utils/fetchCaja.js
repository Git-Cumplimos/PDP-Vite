import fetchData from "../../../utils/fetchData";

const urls = {
  consultaCaja: `${process.env.REACT_APP_URL_CAJA}cash`,
  arqueoCaja: `${process.env.REACT_APP_URL_CAJA}arqueo`,
  cierresCaja: `${process.env.REACT_APP_URL_CAJA}consultacierre`,
  cargas: `${process.env.REACT_APP_URL_CAJA}generate`,
  buscar_comprobante: `${process.env.REACT_APP_URL_CAJA}searchreceipts`,
  cuentas: `${process.env.REACT_APP_URL_CAJA}cuentas`,
  historicoscierre: `http://127.0.0.1:7000/consultahistoricos` //`${process.env.REACT_APP_URL_CAJA}consultahistoricos`,
};

export const searchCash = async (queryParam) => {
  if (!queryParam) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos query");
    });
  }
  try {
    const res = await fetchData(
      urls.consultaCaja,
      "GET",
      queryParam,
      {},
      {},
      true
    );
    return res;
  } catch (err) {
    throw err;
  }
};

export const searchCierre = async (queryParam) => {
  if (!queryParam) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos query");
    });
  }
  try {
    const res = await fetchData(
      urls.cierresCaja,
      "GET",
      queryParam,
      {},
      {},
      true
    );
    return res;
  } catch (err) {
    throw err;
  }
};

export const confirmaCierre = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(
      urls?.consultaCaja,
      "POST",
      {},
      bodyObj,
      {},
      true
    );
    return res;
  } catch (err) {
    throw err;
  }
};

export const confirmaArqueo = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(
      urls?.arqueoCaja,
      "POST",
      {},
      bodyObj,
      {},
      true
    );
    return res;
  } catch (err) {
    throw err;
  }
};

export const createUrlFile = async (queryParam) => {
  if (!queryParam) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos query");
    });
  }
  try {
    const res = await fetchData(urls?.cargas, "GET", queryParam, {}, {}, true);
    return res;
  } catch (err) {
    throw err;
  }
};

export const registerReceipt = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(urls?.cargas, "POST", {}, bodyObj, {}, true);
    return res;
  } catch (err) {
    throw err;
  }
};

export const crearCompañia = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(urls?.cuentas, "POST", {}, bodyObj, {}, true);
    return res;
  } catch (err) {
    throw err;
  }
};

export const buscarCompañias = async (queryParam) => {
  if (!queryParam) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos query");
    });
  }
  try {
    const res = await fetchData(urls.cuentas, "GET", queryParam, {}, {}, true);
    return res;
  } catch (err) {
    throw err;
  }
};

export const searchReceipt = async (queryParam) => {
  try {
    const res = await fetchData(
      urls.buscar_comprobante,
      "GET",
      queryParam,
      {},
      {},
      true
    );
    return res;
  } catch (err) {
    throw err;
  }
};

export const searchHistorico = async (queryParam) => {
  try {
    const res = await fetchData(
      urls.historicoscierre,
      "GET",
      queryParam,
      {},
      {},
      true
    );
    return res;
  } catch (err) {
    throw err;
  }
};

export const updateReceipts = async (queryParam, bodyObj) => {
  try {
    const res = await fetchData(
      urls.cargas,
      "PUT",
      queryParam,
      bodyObj,
      {},
      true
    );
    return res;
  } catch (err) {
    throw err;
  }
};
