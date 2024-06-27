import { cifrarAES, decryptAES } from "../../../../utils/cryptoUtils";
import fetchData from "../../../../utils/fetchData";

const urlDaviplata = `${import.meta.env.VITE_URL_CORRESPONSALIA_DAVIVIENDA}`;

export const postConsultaPagoPorGiroDavivienda = async (bodyObj) => {
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
      `${urlDaviplata}davivienda_pago_por_giro/consulta`,
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
export const postPagoPorGiroDavivienda = async (bodyObj) => {
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
      `${urlDaviplata}davivienda_pago_por_giro/pago_giro`,
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
export const postModificarTicketPagoPorGiroDavivienda = async (bodyObj) => {
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
      `${urlDaviplata}davivienda_pago_por_giro/modificar_ticket_consulta`,
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
