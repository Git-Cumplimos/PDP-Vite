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
export const fetchImportFile = (url) => {
  return async (args, body) => {
    try {
      const res = await fetchData(url + `?convenio_id=${args.convenio_id}`, 'POST', {}, body);
      if (!res?.status) {
        if (res?.msg) {
          throw new Error(res?.msg, { cause: "custom" });
        }
        throw new Error(res, { cause: "custom" });
      }
      return res;
    } catch (error) {
      throw error;
    }
  }
};
export const fetchDownloadFile = (url) => {
  return async (args = {}) => {
    try {
      const Peticion = await fetchData(url, 'GET', args);
      if (!Peticion?.status) {
        if (Peticion?.msg) {
          throw new Error(Peticion?.msg, { cause: "custom" });
        }
      }
      return Peticion;
    } catch (error) {
      throw error;
    }
  }
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
export const downloadFileRecaudo = fetchDownloadFile(
  `${url}/convenio-recaudo/descargar_reporte`
);
export const importFileRecaudo = fetchImportFile(
  `${url}/convenio-recaudo/validar_csv`
);


/* -- Recaudo -- */
export const getRecaudo = buildPostFunction(
  `${url}/recaudo/consulta-recaudo`
);
export const modRecaudo = buildPostFunction(
  `${url}/recaudo/hacer-recaudo`
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
export const downloadFileRetiro = fetchDownloadFile(
  `${url}/convenio-retiro/descargar_reporte`
);
export const importFileRetiro = fetchImportFile(
  `${url}/convenio-retiro/validar_csv`
);

/* -- Retiro -- */
export const getRetiro = buildPostFunction(
  `${url}/retiro/consultar-retiro`
);
export const modRetiro = buildPostFunction(
  `${url}/retiro/hacer-retiro`
);



