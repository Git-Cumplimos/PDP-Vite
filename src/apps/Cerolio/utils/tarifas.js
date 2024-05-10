import fetchData from "../../../utils/fetchData";

const urlCerolio = process.env.REACT_APP_URL_CEROLIO;

export const fetchTarifasByIdComercio = async (id_comercio) => {
  try {
    let params = {
      fk_id_comercio: id_comercio,
    };

    // Limpiar los parámetros vacíos
    params = Object.keys(params).reduce((acc, key) => {
      if (params[key] !== "") {
        acc[key] = params[key];
      }
      return acc;
    }, {});

    const url = `${urlCerolio}/oficinas/tarifas`;

    const res = await fetchData(url, "GET", params);
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

export const fetchGetDataOficinas = async (id_comercio = "") => {
  try {
    let params = {
      pk_id_comercio: id_comercio,
    };

    // Limpiar los parámetros vacíos
    params = Object.keys(params).reduce((acc, key) => {
      if (params[key] !== "") {
        acc[key] = params[key];
      }
      return acc;
    }, {});

    const url = `${urlCerolio}/oficinas/tramitar`;

    const res = await fetchData(url, "GET", params);
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
