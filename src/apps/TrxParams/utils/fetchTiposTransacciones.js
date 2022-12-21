import fetchData from "../../../utils/fetchData";

const url_types = process.env.REACT_APP_URL_TRXS_TRX;

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
