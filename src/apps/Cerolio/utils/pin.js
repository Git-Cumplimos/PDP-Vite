import fetchData from "../../../utils/fetchData";

const urlCerolio = process.env.REACT_APP_URL_CEROLIO;

export const fetchGetPinData = async (
  numero_pin = "",
  estado = "",
  fecha_inicial = "",
  fecha_final = "",
  page = 1,
  limit = 10
) => {
  try {
    let params = {
      numero_pin: numero_pin,
      estado: estado,
      fecha_ini: fecha_inicial,
      fecha_fin: fecha_final,
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

    const url = `${urlCerolio}/pines/tramitar`;

    const res = await fetchData(url, "GET", params);
    if (res.status) {
      return res?.obj;
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};

export const fetchPutUsePin = async (
  id_comercio,
  id_usuario,
  id_terminal,
  pk_id_pin,
  valor_pago_adicional,
  valor_total_trx
) => {
  const body = {
    comercio: {
      id_comercio: id_comercio,
      id_usuario: id_usuario,
      id_terminal: id_terminal,
    },
    data_uso_pin: {
      pk_id_pin: pk_id_pin,
      valor_pago_adicional: valor_pago_adicional,
    },
    valor_total_trx: valor_total_trx,
  };
  try {
    const url = `${urlCerolio}/pines/tramitar`;

    const res = await fetchData(url, "PUT", {}, body);
    if (res) {
      return res;
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};

export const fetchPutReagendar = async (id_pin, body) => {
  try {
    let params = {
      fk_id_pin: id_pin,
    };

    // Limpiar los parámetros vacíos
    params = Object.keys(params).reduce((acc, key) => {
      if (params[key] !== "") {
        acc[key] = params[key];
      }
      return acc;
    }, {});

    const url = `${urlCerolio}/citas/reagendar`;

    const res = await fetchData(url, "PUT", params, body);
    if (res) {
      return res;
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};

export const fetchPutDevolucion = async (id_agenda) => {
  try {
    let params = {
      fk_id_pin: id_agenda,
    };

    // Limpiar los parámetros vacíos
    params = Object.keys(params).reduce((acc, key) => {
      if (params[key] !== "") {
        acc[key] = params[key];
      }
      return acc;
    }, {});

    const url = `${urlCerolio}/citas/tramitar`;

    const res = await fetchData(url, "PUT", params);
    if (res) {
      return res;
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};

export const fetchPutCancelacion = async (id_pin, body) => {
  try {
    let params = {
      pk_id_pin: id_pin,
    };

    // Limpiar los parámetros vacíos
    params = Object.keys(params).reduce((acc, key) => {
      if (params[key] !== "") {
        acc[key] = params[key];
      }
      return acc;
    }, {});

    const url = `${urlCerolio}/pines/cancelar`;

    const res = await fetchData(url, "PUT", params, body);
    if (res) {
      return res;
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};
