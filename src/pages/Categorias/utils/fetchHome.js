import fetchData from "../../../utils/fetchData";

const urlParametrizacion =
  process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;

export const fetchCategoriasByZona = async (obj) => {
  try {
    const res = await fetchData(
      `${urlParametrizacion}/categorias/getAllByZone`,
      "POST",
      {},
      obj
    );
    if (res?.status) {
      return res;
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};

export const fetchAllCategorias = async (obj) => {
  try {
    const res = await fetchData(
      `${urlParametrizacion}/categorias/all`,
      "POST",
      {},
      obj
    );
    if (res?.status) {
      return res?.obj;
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};
