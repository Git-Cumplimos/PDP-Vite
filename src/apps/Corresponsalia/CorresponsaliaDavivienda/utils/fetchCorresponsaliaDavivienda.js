import { cifrarAES, decryptAES } from "../../../../utils/cryptoUtils";
import fetchData from "../../../../utils/fetchData";

const urlDaviplata = `${process.env.REACT_APP_URL_CORRESPONSALIA_DAVIVIENDA}`;
const urlParametrizacion = `${process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS}`;

export const consultaGiroDaviplata = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  let parseObj = JSON.stringify(bodyObj)
  let dataObj = {data: cifrarAES(
    `${process.env.REACT_APP_LLAVE_AES_ENCRYPT_DAV}`,
    `${process.env.REACT_APP_IV_AES_ENCRYPT_DAV}`,
    parseObj
  )}
  try {
    const res = await fetchData(
      `${urlDaviplata}davivienda_cb_cashIn/consultaGiroDaviplata`,
      "POST",
      {},
      dataObj,
      {},
      {},
      40000
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    if(res?.obj !== {}){ 
      console.log(`${process.env.REACT_APP_LLAVE_AES_DECRYPT_DAV}`,
      `${process.env.REACT_APP_IV_AES_DECRYPT_DAV}`)
      console.log((res?.obj?.data?.substring(2,res?.obj?.data?.length - 1)))
      const dataDecrypt = res?.obj?.data?.substring(2,res?.obj?.data?.length - 1)
      const obj = decryptAES(
        `${process.env.REACT_APP_LLAVE_AES_DECRYPT_DAV}`,
        `${process.env.REACT_APP_IV_AES_DECRYPT_DAV}`,
        dataDecrypt
      )
      console.log("Decrypt: ",obj)
      res.obj= JSON.parse(obj)
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
      `${urlDaviplata}davivienda_cb_cashIn/pagoGiroDaviplata`,
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
      `${urlDaviplata}cash-out`,
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

export const postRealizarCashoutDavivienda = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  let parseObj = JSON.stringify(bodyObj)
  let dataObj = {data: cifrarAES(
    `${process.env.REACT_APP_LLAVE_AES_ENCRYPT_DAV}`,
    `${process.env.REACT_APP_IV_AES_ENCRYPT_DAV}`,
    parseObj
  )}

  try {
    const res = await fetchData(
      `${urlDaviplata}davivienda_cb_cashout/cashout`,
      "POST",
      {},
      dataObj,
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

export const consultaCostoCB = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  // let parseObj = JSON.stringify(bodyObj)
  // let dataObj = {data: cifrarAES(
  //   `${process.env.REACT_APP_LLAVE_AES_ENCRYPT_DAV}`,
  //   `${process.env.REACT_APP_IV_AES_ENCRYPT_DAV}`,
  //   parseObj
  // )}
  try {
    const res = await fetchData(
      `${urlDaviplata}davivienda_cb_deposito_retiro/consultaCostoCB`,
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

export const depositoCorresponsal = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(
      `${urlDaviplata}davivienda_cb_deposito_retiro/depositoCorresponsal`,
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

export const retiroCorresponsal = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(
      `${urlDaviplata}davivienda_cb_deposito_retiro/retiroCorresponsal`,
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

export const consultarMensajePublicitarioDavivienda = async () => {
  try {
    const res = await fetchData(
      `${urlParametrizacion}//mensajes_publicitarios/consultar`,
      "POST",
      {},
      {
        nombreMensaje: "Mensaje Davivienda CB",
        autorizador: "Davivienda CB",
      },
      {},
      true
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res.obj;
  } catch (err) {
    throw err;
  }
};
