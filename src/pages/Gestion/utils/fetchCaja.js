import fetchData from "../../../utils/fetchData";

const urls = {
  consultaCaja: `${process.env.REACT_APP_URL_CAJA}cash`,
  arqueoCaja: `${process.env.REACT_APP_URL_CAJA}arqueo`,
  cierresCaja: `${process.env.REACT_APP_URL_CAJA}consultacierre`,
  cargas: `${process.env.REACT_APP_URL_CAJA}generate`,
  buscar_comprobante: `${process.env.REACT_APP_URL_CAJA}searchreceipts`,
  cuentas: `${process.env.REACT_APP_URL_CAJA}cuentas`,
  historicoscierre: `${process.env.REACT_APP_URL_CAJA}consultahistoricos`,
};

// const urlArqueo = `${process.env.REACT_APP_URL_CAJA}/arqueo`;
// const urlCaja = `${process.env.REACT_APP_URL_CAJA}/caja`;
// const urlComprobantes = `${process.env.REACT_APP_URL_CAJA}/comprobantes`;
// const urlCuentas = `${process.env.REACT_APP_URL_CAJA}/cuentas`;

const urlArqueo = `http://localhost:5000/arqueo`;
const urlCaja = `http://localhost:5000/caja`;
const urlComprobantes = `http://localhost:5000/comprobantes`;
const urlCuentas = `http://localhost:5000/cuentas`;

const buildGetFunction = (url) => {
  return async (args = {}) => {
    try {
      const res = await fetchData(url, "GET", args);
      if (!res?.status) {
        if (res?.msg) {
          throw new Error(res?.msg, { cause: "custom" });
        }

        throw new Error(res, { cause: "custom" });
      }
      return res;
    } catch (err) {
      throw err;
    }
  };
};
const buildPostFunction = (url) => {
  return async (body) => {
    if (!body) {
      throw new Error("Sin datos en el body", { cause: "custom" });
    }
    try {
      const res = await fetchData(url, "POST", {}, body);
      if (!res?.status) {
        if (res?.msg) {
          throw new Error(res?.msg, { cause: "custom" });
        }

        throw new Error(res, { cause: "custom" });
      }
      return res;
    } catch (err) {
      throw err;
    }
  };
};
const buildPutFunction = (url) => {
  return async (args, body) => {
    if (!args || !body) {
      throw new Error("Sin datos de busqueda y/o modificacion", {
        cause: "custom",
      });
    }
    try {
      const res = await fetchData(url, "PUT", args, body);
      if (!res?.status) {
        if (res?.msg) {
          throw new Error(res?.msg, { cause: "custom" });
        }

        throw new Error(res, { cause: "custom" });
      }
      return res;
    } catch (err) {
      throw err;
    }
  };
};

export const searchCash = buildGetFunction(`${urlCaja}/cash`);
export const searchCierre = buildGetFunction(`${urlCaja}/consultacierre`);

/* export const searchCash = async (queryParam) => {
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
}; */

/* export const searchCierre = async (queryParam) => {
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
}; */

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
