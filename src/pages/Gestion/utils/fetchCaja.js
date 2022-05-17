import fetchData from "../../../utils/fetchData";

const urls = {
  consultaCaja: `${process.env.REACT_APP_URL_CAJA}cash`,
  arqueoCaja: `${process.env.REACT_APP_URL_CAJA}arqueo`,
  cierresCaja: `${process.env.REACT_APP_URL_CAJA}consultacierre`,
  cargas: `${process.env.REACT_APP_URL_CAJA}generate`,
  buscar_comprobante: `${process.env.REACT_APP_URL_CAJA}searchreceipts`,
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
    console.log(res);
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
    console.log(res);
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
