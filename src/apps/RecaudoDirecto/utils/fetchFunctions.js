import { fetchSecure } from "../../../utils/functions";
import fetchData from "../../../utils/fetchData";

// const url = `http://127.0.0.1:8000`;
const url = `${process.env.REACT_APP_URL_RECAUDO_RETIRO_DIRECTO}`;

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
      return res;
    } catch (err) {
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

        if (res?.obj?.error[0]?.complete_info?.nit) {
          throw new Error(res?.obj?.error[0]?.complete_info?.nit, { cause: "custom" })
        }

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

export const descargarReporte = (url) => {
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

export const descargarReporteP = (url) => {
  return async (body) => {
    if (!body) {
      throw new Error("Sin datos en el body", { cause: "custom" });
    }
    try {
      const res = await fetchData(url, "POST", {}, body);
      if (res?.msg) {
        throw new Error(res?.msg, { cause: "custom" });
      }
      return res;
    } catch (err) {
      throw err
    }
  };
};
export const cargueArchivo = (url_cargar, url_verificar) => {
  return async (file, nombre_convenio, convenio_id) => {

    try {
      const responsePostUrl = await fetchSecure(`${url_cargar}?nombre_convenio=${nombre_convenio}`);
      const resPostUrl = await responsePostUrl.json();

      const { url, fields } = resPostUrl.obj;
      const filename = fields.key;
      const formData = new FormData();
      for (var key in fields) {
        formData.append(key, fields[key]);
      }
      formData.set("file", file);
      await fetch(url, {
        method: "POST",
        body: formData,
        mode: "no-cors",
      });

      const responseValidacionArchivo = await fetchSecure(
        `${url_verificar}?filename=${filename}&convenio_id=${convenio_id}`
      );
      const resValidacionArchivo = await responseValidacionArchivo.json();

      if (!resValidacionArchivo?.status) {
        throw resValidacionArchivo;
      }

      return resValidacionArchivo;
    } catch (error) {
      throw error;
    }
  }
};


/*--- Convenios Recaudo ---*/
export const getUrlRecaudosList = () =>{
  return `${url}/convenio-recaudo/obtener-paginado`
};
export const searchConveniosRecaudoList = buildGetFunction(
  `${url}/convenio-recaudo/obtener` // Recaudo Conjunto
);
export const addConveniosRecaudoList = buildPostFunction(
  `${url}/convenio-recaudo/agregar`
);
export const modConveniosRecaudoList = buildPutFunction(
  `${url}/convenio-recaudo/modificar`
);
export const downloadCsvRecaudo = descargarReporteP(
  `${url}/convenio-recaudo/descargar-reporte`
);
export const downloadTxtRecaudo = descargarReporteP(
  `${url}/convenio-recaudo/descargar-reporte-txt`
);
export const cargarArchivoRecaudo = cargueArchivo(
  `${url}/convenio-recaudo-masivo/obtener-url-carga`,
  `${url}/convenio-recaudo-masivo/verificar-archivo`
);
export const decoCodigoBarras = buildPostFunction(
  `${url}/convenio-recaudo/codigo-barras`
);

/* -- Recaudo -- */
export const getRecaudo = buildPostFunction(
  `${url}/recaudo/consulta-recaudo`
);
export const modRecaudo = buildPostFunction(
  `${url}/recaudo/hacer-recaudo`
);


/*--- Convenios Retiro ---*/
export const getUrlRetirosList = () =>{
  return `${url}/convenio-retiro/obtener-paginado`
};
export const searchConveniosRetiroList = buildGetFunction(
  `${url}/convenio-retiro/obtener`
);
export const addConveniosRetiroList = buildPostFunction(
  `${url}/convenio-retiro/agregar`
);
export const modConveniosRetiroList = buildPutFunction(
  `${url}/convenio-retiro/modificar`
);
export const downloadCsvRetiro = descargarReporteP(
  `${url}/convenio-retiro/descargar-reporte`
);
export const downloadTxtRetiro = descargarReporteP(
  `${url}/convenio-retiro/descargar-reporte-txt`
);
export const cargarArchivoRetiro = cargueArchivo(
  `${url}/convenio-retiro-masivo/obtener-url-carga`,
  `${url}/convenio-retiro-masivo/verificar-archivo`
);


/* -- Retiro -- */
export const getRetiro = buildPostFunction(
  `${url}/retiro/consultar-retiro`
);
export const modRetiro = buildPostFunction(
  `${url}/retiro/hacer-retiro`
);
