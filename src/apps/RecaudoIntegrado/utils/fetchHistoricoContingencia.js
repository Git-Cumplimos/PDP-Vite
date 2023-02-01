import fetchData from "../../../utils/fetchData";
import { notify, notifyError } from "../../../utils/notify";

const urlBackend = `${process.env.REACT_APP_URL_RECAUDO_EMPRESARIAL}/servicio-contingencia-empresarial-pdp`;

export const BuscarPorBanco = async (banco) => {
  /*   console.log("BODY", banco); */
  if (!banco) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlBackend}/search?identificador_banco=${banco}`,
      "GET",
      {},
      {},
      {},
      true
    );
    if (!res?.status) {
      notifyError(res?.msg);
    }
    return res?.obj.results;
  } catch (err) {
    throw err;
  }
};
export const BuscarPorFecha = async (fechaInicial, fechaFinal, banco) => {
  /*   console.log("bancofetch", banco);
  console.log("fechaInicial", fechaInicial);
  console.log("fechaFinal", fechaFinal); */
  if ((!fechaInicial, !fechaFinal)) {
    return "Sin fechas";
  }
  try {
    const res = await fetchData(
      `${urlBackend}/search?fecha_inicio_inicio=${fechaInicial}&fecha_inicio_fin=${fechaFinal}&identificador_banco=${banco}`,
      "GET",
      {},
      {},
      {},
      true
    );
    if (!res?.status) {
      notifyError(res?.msg);
    }
    return res?.obj?.results;
    /* return res?.obj.results; */
  } catch (err) {
    throw err;
  }
};

export const DescargarExcel = async (data) => {
  console.log("Total REgistros", data?.total_registros);
  /*   if (!banco) {
    return "Sin datosfdffdggf";
  } */

  try {
    const res = await fetchData(
      "http://127.0.0.1:5000/servicio-contingencia-empresarial-pdp/generarexcel",
      "POST",
      {},
      {
        nombre_banco: data?.nombre_banco,
        fecha_carga: data?.fecha_carga,
        total_registros: "data?.total_registros",
        registros_procesados: "registros_procesados",
        registros_fallidos: "registros_fallidos",
        respuesta_trx_exitosas: 4,
        respuesta_trx_fallidas: 2,
      },
      {},
      true
    );
    /*  if (!res?.status) {
      notifyError(res?.msg);
    } */
    return res?.url;
  } catch (err) {
    throw err;
  }
};
