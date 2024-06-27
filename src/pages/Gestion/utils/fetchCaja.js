import fetchData from "../../../utils/fetchData";
import { fetchSecure } from "../../../utils/functions";

const urlArqueo = `${import.meta.env.VITE_URL_CAJA}/arqueo`;
const urlCaja = `${import.meta.env.VITE_URL_CAJA}/caja`;
const urlComprobantes = `${import.meta.env.VITE_URL_CAJA}/comprobantes`;
const urlCuentas = `${import.meta.env.VITE_URL_CAJA}/cuentas`;
const urlNotas = `${import.meta.env.VITE_URL_CAJA}/notas`;
const urlReportes = `${import.meta.env.VITE_URL_CAJA}/reportes`;
const urlCierreCaja = `${import.meta.env.VITE_URL_CAJA}/transacciones`;
const urltransacciones =`${import.meta.env.VITE_URL_CAJA}/transacciones`;

// const urlCierreCaja = `http://localhost:5000/transacciones`;
// const urlArqueo = `http://localhost:5000/arqueo`;
// const urlCaja = `http://localhost:5000/caja`;
// const urlComprobantes = `http://localhost:5000/comprobantes`;
// const urlCuentas = `http://localhost:5000/cuentas`;
// const urlNotas = `http://localhost:5000/notas`;
// const urlReportes = `http://localhost:5000/reportes`;
// const urltransacciones = `http://localhost:5000/transacciones`;

const buildGetFunction = (url) => {
  return async (args = {}) => {
    try {
      const res = await fetchData(url, "GET", args);
      if (!res?.status) {
        if (res?.msg) {
          throw new Error("Error en la peticion", { cause: "custom" });
        }
        throw new Error("Error interno del servicio", { cause: "custom" });
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
        if (res?.msg === "Los datos ingresados del comercio y usuario no existen") {
          throw new Error("Los datos ingresados del comercio y usuario no existen", { cause: "custom" });
        }
        if (res?.msg === "Exception (decorated fcn): Efectivo insuficiente en boveda") {
          throw new Error("Efectivo insuficiente en la bóveda", { cause: "custom" });
        }
        if (res?.msg) {
          throw new Error("Error en la peticion", { cause: "custom" });
        } 

        throw new Error("Error interno del servicio", { cause: "custom" });
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
          throw new Error("Error en la peticion", { cause: "custom" });
        }

        throw new Error("Error interno del servicio", { cause: "custom" });
      }
      return res;
    } catch (err) {
      throw err;
    }
  };
};

export const confirmaArqueo = buildPostFunction(`${urlArqueo}/administrar`);

// export const confirmaCierre = buildPostFunction(`${urlCaja}/cash`);
export const confirmaCierre = buildPostFunction(`${urlCaja}/cierre/usuario`);
export const searchCash = buildGetFunction(`${urlCaja}/cash`);
// export const searchCierre = buildGetFunction(`${urlCaja}/consultacierre`);
export const searchCierre = buildGetFunction(`${urlCaja}/consulta-cierre-state`);
// export const searchHistorico = buildGetFunction(`${urlCaja}/consultahistoricos`);
export const searchHistorico = buildGetFunction(`${urlCaja}/cierre/usuario`);
export const crearEntidad = buildPostFunction(`${urlCuentas}/administrar`);
export const buscarEntidades = buildGetFunction(`${urlCuentas}/administrar`);
export const editarEntidades = buildPutFunction(`${urlCuentas}/administrar`);

export const editarExterno = buildPutFunction(`${urlCuentas}/crear_externo`);
export const crearPltExterno = buildPostFunction(`${urlCuentas}/crear_externo`);
export const buscarPlataformaExt = buildGetFunction(`${urlCuentas}/crear_externo`);

export const buscarTiposComprobantes = buildGetFunction(`${urlComprobantes}/tipos`);
export const subirComprobante = buildGetFunction(`${urlComprobantes}/upload-file`);
export const buscarReporteCierreCaja = buildPostFunction(`${urlCierreCaja}/reporte`);
export const buscarListaComerciosCierreCaja = buildGetFunction(`${urlCierreCaja}/comercios`);
export const descargarComprobante = buildGetFunction(`${urlComprobantes}/download-file`);
export const agregarComprobante = buildPostFunction(`${urlComprobantes}/administrar`);
export const movimientoBoveda = buildPostFunction(`${urlComprobantes}/movimiento-boveda`);
export const getUser = buildGetFunction(`${urlComprobantes}/get_user`);
export const movimientoEfectivoEntreCajeros = buildPostFunction(`${urlComprobantes}/movimiento-entre-cajeros`);
export const historicoEfectivoEntreCajeros = buildGetFunction(`${urlComprobantes}/movimiento-entre-cajeros`);
export const EfectivoEntreCajerosPending = buildGetFunction(`${urlComprobantes}/movimiento-entre-cajeros-pendientes`);
export const editarTransferencia = buildPutFunction(`${urlComprobantes}/movimiento-entre-cajeros`);
export const verHistoricoBoveda = buildGetFunction(`${urlComprobantes}/movimiento-boveda`);
export const verValorBoveda = buildGetFunction(`${urlComprobantes}/boveda`);
export const buscarComprobantes = buildGetFunction(`${urlComprobantes}/administrar`);
export const buscarComprobantesCajero = buildGetFunction(`${urlComprobantes}/comprobantes_cajero`);
export const editarComprobante = buildPutFunction(`${urlComprobantes}/administrar`);

export const agregarNota = buildPostFunction(`${urlNotas}/administrar`);
export const buscarNotas = buildGetFunction(`${urlNotas}/administrar`);

export const buscarReporteTrxArqueo = () => {return `${urlReportes}/trx-arqueo-usuario`};

export const buscarTicketReporte = buildGetFunction(`${urlReportes}/trx-ticket`);

export const buscarReportesArqueo = async (args) => {
  try {
    const stringArgs = `?${new URLSearchParams(
      Object.entries(args)
    ).toString()}`;
    const response = await fetchSecure(
      `${urlReportes}/arqueo-usuario${args ? stringArgs : ""}`
    );

    if (
      response.headers.get("Content-Type") ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return response;
    }
    const res = await response.json();
    if (!res?.status) {
      if (res?.msg) {
        throw new Error("Error al intentar crear el reporte", { cause: "custom" });
      }

      throw new Error(res, { cause: "custom" });
    }
    return res;
  } catch (err) {
    throw err;
  }
};
export const buscarIdTrx = buildGetFunction(`${urltransacciones}/id_Trx`);
export const ReportFaltantesSobr = buildPostFunction(`${urltransacciones}/sobrantes_faltantes`);
export const VldFaltantesSobr = buildGetFunction(`${urltransacciones}/vld_sobrantes_faltantes`);
export const editarNovedad = buildPutFunction(`${urltransacciones}/upd_sobrantes_faltantes`);