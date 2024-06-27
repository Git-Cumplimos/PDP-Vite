import fetchData from "../../../utils/fetchData";

const urlCerolio = import.meta.env.VITE_URL_CEROLIO;

export const fetchGetReportesConsulta = async (
  fecha_inicial = "",
  fecha_final = "",
  comercio = "",
  nombre_tramite = "",
  numero_pin = "",
  documento = "",
  page = 1,
  limit = 10
) => {
  try {
    let params = {
      fecha_ini: fecha_inicial,
      fecha_fin: fecha_final,
      fk_id_comercio_uso: comercio,
      nombre_tramite: nombre_tramite,
      numero_pin: numero_pin,
      numero_documento: documento,
      page: page,
      limit: limit,
    };

    // Limpiar los parámetros vacíos
    params = Object.keys(params).reduce((acc, key) => {
      if (params[key] !== "") {
        acc[key] = params[key];
      }
      return acc;
    }, {});

    const url = `${urlCerolio}/reportes/get-movimientos`;

    const res = await fetchData(url, "GET", params);
    if (res) {
      return res?.obj;
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};

export const fetchGetReportesHistorico = async (
  fecha_inicial = "",
  fecha_final = "",
  comercio = "",
  carpeta = "",
  page = 1,
  limit = 10
) => {
  try {
    let params = {
      fecha_ini: fecha_inicial,
      fecha_fin: fecha_final,
      id_comercio: comercio,
      carpeta: carpeta,
      page: page,
      limit: limit,
    };

    // Limpiar los parámetros vacíos
    params = Object.keys(params).reduce((acc, key) => {
      if (params[key] !== "") {
        acc[key] = params[key];
      }
      return acc;
    }, {});

    const url = `${urlCerolio}/S3/listar-archivos`;

    const res = await fetchData(url, "GET", params);
    if (res.status) {
      return res;
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [], status: false };
    }
  } catch (err) {
    throw err;
  }
};
