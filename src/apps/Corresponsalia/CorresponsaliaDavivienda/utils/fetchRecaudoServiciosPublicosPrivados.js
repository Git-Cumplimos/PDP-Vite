import { cifrarAES, decryptAES } from "../../../../utils/cryptoUtils";
import fetchData from "../../../../utils/fetchData";
import { hash } from "../../../../utils/hash";

const urlDaviplata = `${import.meta.env.VITE_URL_CORRESPONSALIA_DAVIVIENDA}`;

export const postConsultaTablaConveniosPaginado = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlDaviplata}davivienda_recaudo_servicios_publicos_privados/consulta_tabla_convenios_paginado`,
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
export const postConsultaTablaConveniosEspecifico = async (bodyObj) => {
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
      `${urlDaviplata}davivienda_recaudo_servicios_publicos_privados/consulta_tabla_convenios_especifico`,
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
    return res?.obj;
  } catch (err) {
    throw err;
  }
};
export const postConsultaCodigoBarrasConveniosEspecifico = async (bodyObj) => {
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
      `${urlDaviplata}davivienda_recaudo_servicios_publicos_privados/codigo_barras`,
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
export const postConsultaConveniosDavivienda = async (bodyObj) => {
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
      `${urlDaviplata}davivienda_recaudo_servicios_publicos_privados/consulta_recaudo_servicios_publicos_privados`,
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
// export const postRecaudoConveniosDavivienda = async (bodyObj) => {
//   if (!bodyObj) {
//     return "Sin datos body";
//   }
//   try {
//     const res = await fetchData(
//       `${urlDaviplata}davivienda_recaudo_servicios_publicos_privados/prueba`,
//       "POST",
//       {},
//       bodyObj,
//       {},
//       true,
//       80000
//     );
//     if (!res?.status) {
//       console.error(res?.msg ?? res?.message ?? "");
//     }
//     return res;
//   } catch (err) {
//     console.log("error api gateway");
//     throw err;
//   }
// };

export const postCheckReintentoRecaudoConveniosDavivienda = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlDaviplata}davivienda_recaudo_servicios_publicos_privados/check_reintento_recaudo_servicios_publicos_privados`,
      "POST",
      {},
      bodyObj,
      {},
      true,
      80000
    );
    if (!res?.status) {
      console.error(res?.msg ?? res?.message ?? "");
    }
    return res;
  } catch (err) {
    console.log("error api gateway");
    throw err;
  }
};

export const postRecaudoConveniosDavivienda = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  const bodyHash = { ...bodyObj };
  delete bodyHash.ticket;

  const cod_hash = hash(bodyHash);
  bodyObj.cod_hash = cod_hash;
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
      `${urlDaviplata}davivienda_recaudo_servicios_publicos_privados/recaudo_servicios_publicos_privados`,
      "POST",
      {},
      dataObj,
      {},
      true,
      80000
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
