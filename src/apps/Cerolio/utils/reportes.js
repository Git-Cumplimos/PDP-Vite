import fetchData from "../../../utils/fetchData";

const urlCerolio = process.env.REACT_APP_URL_CEROLIO;

export const fetchGetReportesConsulta = async (
  fecha_inicial = "",
  fecha_final = "",
  comercio = "",
  nombre_tramite = "",
  numero_pin = "",
  documento = ""
) => {
  try {
    let params = {
      fecha_ini: fecha_inicial,
      fecha_fin: fecha_final,
      fk_id_comercio_uso: comercio,
      nombre_tramite: nombre_tramite,
      numero_pin: numero_pin,
      numero_documento: documento,
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
  comercio = ""
) => {
  try {
    let params = {
      fecha_ini: fecha_inicial,
      fecha_fin: fecha_final,
      fk_id_comercio_uso: comercio,
      carpeta: "pines",
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
