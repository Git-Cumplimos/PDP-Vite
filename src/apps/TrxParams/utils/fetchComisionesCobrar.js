import fetchData from "../../../utils/fetchData";
import { fetchAutorizadores } from "./fetchRevalAutorizadores";

const urlConvenios = process.env.REACT_APP_URL_REVAL_CONVENIOS;
const urlAutorizadores = process.env.REACT_APP_URL_REVAL_AUTORIZADOR;

const urlComisiones = process.env.REACT_APP_URL_COMISIONES;

export const postComisionesCobrar = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComisiones}/comisiones_cobradas/crear`,
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

export const fetchComisionesCobrar = async (obj) => {
  try {
    const res = await fetchData(
      `${urlComisiones}/comisiones_cobradas/consultar_comision_cobrada`,
      "POST",
      {},
      obj
    );
    if (res?.status) {
      return { ...res?.obj };
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};

export const fetchConveniosUnique = async (id_convenio, ean13) => {
  if (!id_convenio && !ean13) {
    return { maxPages: 0, results: [] };
  }
  try {
    let args = {};
    if (id_convenio) {
      args = { id_convenio };
    }
    if (ean13) {
      args = { ean13 };
    }
    const res = await fetchData(`${urlConvenios}/convenio_unique`, "GET", args);
    if (res?.status) {
      return { ...res?.obj };
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};
export const putComisionesCobrada = async (argsObj, bodyObj) => {
  if (!argsObj || !bodyObj) {
    return "Sin datos de url ni body";
  }
  try {
    const res = await fetchData(
      `${urlComisiones}/comisiones_cobradas/modificar`,
      "PUT",
      argsObj,
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
