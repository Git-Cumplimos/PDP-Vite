import { cifrarAES, decryptAES } from "../../../../utils/cryptoUtils";
import fetchData from "../../../../utils/fetchData";

const urlDaviplata = `${import.meta.env.VITE_URL_CORRESPONSALIA_DAVIVIENDA}`;

export const postConsultaProductosPropiosDavivienda = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
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
      `${urlDaviplata}davivienda_productos_propios/consulta`,
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
export const postPagoProductosPropiosDavivienda = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
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
      `${urlDaviplata}davivienda_productos_propios/pago_productos_propios`,
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
