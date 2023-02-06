import fetchData from "../../../../utils/fetchData";

const urlConveniosPdp = `${process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS}/convenios-pdp`;
// const urlConveniosPdp = `http://localhost:5000/convenios-pdp`;

const url_types = process.env.REACT_APP_URL_TRXS_TRX;

const buildGetFunction = (url) => {
  return async (args = {}) => {
    try {
      const res = await fetchData(url, "GET", args);
      if (!res?.status) {
        if (res?.msg) {
          throw new Error(res?.msg, { cause: "custom" });
        }

        throw new Error(res, { cause: "custom" });
      }
      return res;
    } catch (err) {
      throw err;
    }
  };
};
const buildPostFunction = (url) => {
  return async (body) => {
    if (!body) {
      throw new Error("Sin datos en el body", { cause: "custom" });
    }
    try {
      const res = await fetchData(url, "POST", {}, body);
      if (!res?.status) {
        if (res?.msg) {
          throw new Error(res?.msg, { cause: "custom" });
        }

        throw new Error(res, { cause: "custom" });
      }
      return res;
    } catch (err) {
      throw err;
    }
  };
};
const buildPutFunction = (url) => {
  return async (args, body) => {
    if (!args || !body) {
      throw new Error("Sin datos de busqueda y/o modificacion", {
        cause: "custom",
      });
    }
    try {
      const res = await fetchData(url, "PUT", args, body);
      if (!res?.status) {
        if (res?.msg) {
          throw new Error(res?.msg, { cause: "custom" });
        }

        throw new Error(res, { cause: "custom" });
      }
      return res;
    } catch (err) {
      throw err;
    }
  };
};

export const crearConvenio = buildPostFunction(
  `${urlConveniosPdp}/administrar`
);
export const buscarConvenios = buildGetFunction(
  `${urlConveniosPdp}/administrar`
);
export const actualizarConvenio = buildPutFunction(
  `${urlConveniosPdp}/administrar`
);


export const crearAutorizadorRecaudo = buildPostFunction(
  `${urlConveniosPdp}/autorizadores-recaudo`
);
export const buscarAutorizadorRecaudo = buildGetFunction(
  `${urlConveniosPdp}/autorizadores-recaudo`
);
export const actualizarAutorizadorRecaudo = buildPutFunction(
  `${urlConveniosPdp}/autorizadores-recaudo`
);

export const fetchTrxTypesPages = buildGetFunction(
  `${url_types}/tipos-operaciones-pagination`
);
