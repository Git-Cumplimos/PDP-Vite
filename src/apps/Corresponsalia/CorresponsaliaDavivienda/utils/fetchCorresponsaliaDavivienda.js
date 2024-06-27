import { fetchDataTotp } from "../../../../utils/MFA";
import { cifrarAES, decryptAES } from "../../../../utils/cryptoUtils";
import fetchData from "../../../../utils/fetchData";
import { hash } from "../../../../utils/hash";

const urlDaviplata = `${import.meta.env.VITE_URL_CORRESPONSALIA_DAVIVIENDA}`;
const urlParametrizacion = `${import.meta.env.VITE_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS}`;

export const consultaGiroDaviplata = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  let parseObj = JSON.stringify(bodyObj);
  let dataObj = {
    data: cifrarAES(
      `${import.meta.env.VITE_LLAVE_AES_ENCRYPT_DAV}`,
      `${import.meta.env.VITE_IV_AES_ENCRYPT_DAV}`,
      parseObj
    ),
  };

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
    if (res?.obj !== {}) {
      const dataDecrypt = res?.obj?.data;
      const obj = decryptAES(
        `${import.meta.env.VITE_LLAVE_AES_DECRYPT_DAV}`,
        `${import.meta.env.VITE_IV_AES_DECRYPT_DAV}`,
        dataDecrypt
      );
      res.obj = JSON.parse(obj);
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
  let parseObj = JSON.stringify(bodyObj);
  let dataObj = {
    data: cifrarAES(
      `${import.meta.env.VITE_LLAVE_AES_ENCRYPT_DAV}`,
      `${import.meta.env.VITE_IV_AES_ENCRYPT_DAV}`,
      parseObj
    ),
  };
  try {
    const res = await fetchDataTotp(
      `${urlDaviplata}davivienda_cb_cashIn/pagoGiroDaviplata`,
      "POST",
      {},
      dataObj,
      {},
      {},
      80000
    );
    if (!res?.status) {
      console.error(res?.msg);
    }

    if (res?.obj !== {}) {
      const dataDecrypt = res?.obj?.data;
      const obj = decryptAES(
        `${import.meta.env.VITE_LLAVE_AES_DECRYPT_DAV}`,
        `${import.meta.env.VITE_IV_AES_DECRYPT_DAV}`,
        dataDecrypt
      );
      res.obj = JSON.parse(obj);
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
  const bodyHash = {...bodyObj}
  delete bodyHash.ticket

  const cod_hash = hash(bodyHash)
  bodyObj.cod_hash = cod_hash
  let parseObj = JSON.stringify(bodyObj);
  let dataObj = {
    data: cifrarAES(
      `${import.meta.env.VITE_LLAVE_AES_ENCRYPT_DAV}`,
      `${import.meta.env.VITE_IV_AES_ENCRYPT_DAV}`,
      parseObj
    ),
  };

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
    if (res?.obj !== {}) {
      const dataDecrypt = res?.obj?.data ?? "";
      const obj = decryptAES(
        `${import.meta.env.VITE_LLAVE_AES_DECRYPT_DAV}`,
        `${import.meta.env.VITE_IV_AES_DECRYPT_DAV}`,
        dataDecrypt
      );
      res.obj = JSON.parse(obj);
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
  let parseObj = JSON.stringify(bodyObj);
  let dataObj = {
    data: cifrarAES(
      `${import.meta.env.VITE_LLAVE_AES_ENCRYPT_DAV}`,
      `${import.meta.env.VITE_IV_AES_ENCRYPT_DAV}`,
      parseObj
    ),
  };
  try {
    const res = await fetchData(
      `${urlDaviplata}davivienda_cb_deposito_retiro/consultaCostoCB`,
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

    if (res?.obj !== {}) {
      const dataDecrypt = res?.obj?.data;
      const obj = decryptAES(
        `${import.meta.env.VITE_LLAVE_AES_DECRYPT_DAV}`,
        `${import.meta.env.VITE_IV_AES_DECRYPT_DAV}`,
        dataDecrypt
      );
      res.obj = JSON.parse(obj);
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
  const bodyHash = {...bodyObj}
  delete bodyHash.ticket

  const cod_hash = hash(bodyHash)
  bodyObj.cod_hash = cod_hash

  let parseObj = JSON.stringify(bodyObj);
  let dataObj = {
    data: cifrarAES(
      `${import.meta.env.VITE_LLAVE_AES_ENCRYPT_DAV}`,
      `${import.meta.env.VITE_IV_AES_ENCRYPT_DAV}`,
      parseObj
    ),
  };

  try {
    const res = await fetchDataTotp(
      `${urlDaviplata}davivienda_cb_deposito_retiro/depositoCorresponsal`,
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

    if (res?.obj !== {}) {
      const dataDecrypt = res?.obj?.data;
      const obj = decryptAES(
        `${import.meta.env.VITE_LLAVE_AES_DECRYPT_DAV}`,
        `${import.meta.env.VITE_IV_AES_DECRYPT_DAV}`,
        dataDecrypt
      );
      res.obj = JSON.parse(obj);
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
  const bodyHash = {...bodyObj}
  delete bodyHash.ticket

  const cod_hash = hash(bodyHash)
  bodyObj.cod_hash = cod_hash

  let parseObj = JSON.stringify(bodyObj);
  let dataObj = {
    data: cifrarAES(
      `${import.meta.env.VITE_LLAVE_AES_ENCRYPT_DAV}`,
      `${import.meta.env.VITE_IV_AES_ENCRYPT_DAV}`,
      parseObj
    ),
  };

  try {
    const res = await fetchData(
      `${urlDaviplata}davivienda_cb_deposito_retiro/retiroCorresponsal`,
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

    if (res?.obj !== {}) {
      const dataDecrypt = res?.obj?.data;
      const obj = decryptAES(
        `${import.meta.env.VITE_LLAVE_AES_DECRYPT_DAV}`,
        `${import.meta.env.VITE_IV_AES_DECRYPT_DAV}`,
        dataDecrypt
      );
      res.obj = JSON.parse(obj);
    }

    return res;
  } catch (err) {
    throw err;
  }
};

export const consultarMensajePublicitarioDavivienda = async () => {
  try {
    const res = await fetchData(
      `${urlParametrizacion}/mensajes_publicitarios/consultar`,
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
