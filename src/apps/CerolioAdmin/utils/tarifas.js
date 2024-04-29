import fetchData from "../../../utils/fetchData";

const urlCerolio = process.env.REACT_APP_URL_CEROLIO;

export const fetchTarifasByIdComercio = async (id_comercio) => {
  try {
    const res = await fetchData(
      `${urlCerolio}/oficinas/tarifas?fk_id_comercio=${id_comercio}`,
      "GET",
      {}
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

export const fetchUpdateTarifasByIdComercio = async (id_comercio, body) => {
  try {
    const res = await fetchData(
      `${urlCerolio}/oficinas/tarifas?fk_id_comercio=${id_comercio}`,
      "PUT",
      {},
      body
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
