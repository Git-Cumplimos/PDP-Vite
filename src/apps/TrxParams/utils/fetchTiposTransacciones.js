import fetchData from "../../../utils/fetchData";

const url_types = process.env.REACT_APP_URL_TRXS_TRX;
const urlComisiones =
  process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;

export const fetchTrxTypesPages = async (Nombre_operacion, page) => {
  try {
    const res = await fetchData(
      `${url_types}/tipos-operaciones-pagination`,
      "GET",
      {
        Nombre_operacion,
        page,
      }
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
export const fetchTrxTypesPagesObj = async (obj) => {
  try {
    const res = await fetchData(
      `${url_types}/tipos-operaciones-pagination`,
      "GET",
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

export const getTiposOperaciones = async (obj) => {
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-asignacion-comisiones/consultar-tipo-operacion`,
      "GET",
      obj,
      {}
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
