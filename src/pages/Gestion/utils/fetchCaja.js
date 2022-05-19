import fetchData from "../../../utils/fetchData";

const urls = {
  consultaCaja: `${process.env.REACT_APP_URL_CAJA}cash`,
  arqueoCaja: `${process.env.REACT_APP_URL_CAJA}arqueo`,
  cierresCaja: `${process.env.REACT_APP_URL_CAJA}consultacierre`,
  cargas: `${process.env.REACT_APP_URL_CAJA}generate`,
  buscar_comprobante: `${process.env.REACT_APP_URL_CAJA}searchreceipts`,
  cuentas: `${process.env.REACT_APP_URL_CAJA}cuentas`,
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
      false
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
      false
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
      false
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
      false
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
    const res = await fetchData(urls?.cargas, "GET", queryParam, {}, {}, false);
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
    const res = await fetchData(urls?.cargas, "POST", {}, bodyObj, {}, false);
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
    const res = await fetchData(urls?.cuentas, "POST", {}, bodyObj, {}, false);
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
    const res = await fetchData(urls.cuentas, "GET", queryParam, {}, {}, false);
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
      false
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
      false
    );
    return res;
  } catch (err) {
    throw err;
  }
};
