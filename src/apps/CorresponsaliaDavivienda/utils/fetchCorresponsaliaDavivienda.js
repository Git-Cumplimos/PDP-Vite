import fetchData from "../../../utils/fetchData";

const urlDaviplata = `${process.env.REACT_APP_URL_CORRESPONSALIA_DAVIVIENDA}`;
console.log(urlDaviplata);
export const consultaGiroDaviplata = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(
      `${urlDaviplata}davivienda_cb_cashIn/consultaGiroDaviplata`,
      "POST",
      {},
      bodyObj,
      {},
      {},
      40000
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const pagoGiroDaviplata = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(
      `${urlDaviplata}/davivienda_cb_cashIn/pagoGiroDaviplata`,
      "POST",
      {},
      bodyObj,
      {},
      {},
      80000

    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const postCashOut = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(
      `${urlDaviplata}/cash-out`,
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

export const postRealizarCashoutDavivienda = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlDaviplata}davivienda_cb_cashout/cashout`,
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
}


export const consultaCostoCB = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(
      `${urlDaviplata}/davivienda_cb_deposito_retiro/consultaCostoCB`,
      "POST",
      {},
      bodyObj,
      {},
      {},
      40000
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
}

export const depositoCorresponsal = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(
      `${urlDaviplata}/davivienda_cb_deposito_retiro/depositoCorresponsal`,
      "POST",
      {},
      bodyObj,
      {},
      {},
      40000
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
}

export const retiroCorresponsal = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(
      `${urlDaviplata}/davivienda_cb_deposito_retiro/retiroCorresponsal`,
      "POST",
      {},
      bodyObj,
      {},
      {},
      40000
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
}
