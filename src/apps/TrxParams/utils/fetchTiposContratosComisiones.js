import fetchData from "../../../utils/fetchData";
import { fetchAutorizadores } from "./fetchRevalAutorizadores";

const urlConvenios = process.env.REACT_APP_URL_REVAL_CONVENIOS;
const urlAutorizadores = process.env.REACT_APP_URL_REVAL_AUTORIZADOR;

const urlComisiones = process.env.REACT_APP_URL_COMISIONES;

export const fetchTiposContratosComisiones = async (
  obj
) => {
  try {
    const res = await fetchData(
      `${urlComisiones}/contrato_comision/consultar`,
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
export const putTiposContratosComisiones = async (argsObj, bodyObj) => {
  if (!argsObj || !bodyObj) {
    return "Sin datos de url ni body";
  }
  try {
    const res = await fetchData(
      `${urlComisiones}/contrato_comision/modificar`,
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


export const postTiposContratosComisiones = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComisiones}/contrato_comision/crear`,
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
