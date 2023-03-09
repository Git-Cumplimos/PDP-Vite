import fetchData from "../../../utils/fetchData";

const url = `http://127.0.0.1:8000`;

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
      // console.log(err)
      throw err
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
      // console.log(res)
      return res;
    } catch (err) {
      // console.log(err) ;
      throw err
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
      // console.log(res)
      return res;
    } catch (err) {
      throw err;
    }
  };
};
/*--- Convenios Recaudo ---*/
export const getRecaudosList = buildGetFunction(
  `${url}/convenio-recaudo/obtener-paginado`
);
export const searchConveniosRecaudoList = buildGetFunction(
  `${url}/convenio-recaudo/obtener` // Recaudo Conjunto
);
export const addConveniosRecaudoList = buildPostFunction(
  `${url}/convenio-recaudo/agregar`
);
export const modConveniosRecaudoList = buildPutFunction(
  `${url}/convenio-recaudo/modificar`
);
export const getRecaudo = buildGetFunction(
  `${url}/convenio-recaudo/obtener-recaudo`
);


/*--- Convenios Retiro ---*/
export const getRetirosList = buildGetFunction(
  `${url}/convenio-retiro/obtener-paginado`
);
export const searchConveniosRetiroList = buildGetFunction(
  `${url}/convenio-retiro/obtener`
);
export const addConveniosRetiroList = buildPostFunction(
  `${url}/convenio-retiro/agregar`
);
export const modConveniosRetiroList = buildPutFunction(
  `${url}/convenio-retiro/modificar`
);
export const getRetiro = buildGetFunction(
  `${url}/convenio-retiro/obtener-retiro`
);