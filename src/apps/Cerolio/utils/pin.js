import fetchData from "../../../utils/fetchData";

const urlCerolio = process.env.REACT_APP_URL_CEROLIO;

export const fetchGetPinData = async (numero_pin = "", estado = "") => {
  try {
    let params = {
      numero_pin: numero_pin,
      estado: estado,
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
  console.log(body);
  try {
    const url = `${urlCerolio}/pines/tramitar`;

    const res = await fetchData(url, "PUT", {}, body);
    console.log(res);
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
