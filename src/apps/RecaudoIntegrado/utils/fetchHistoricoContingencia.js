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
      `${urlBackend}/generarexcel`,

      "POST",
      {},
      {
        nombre_banco: data?.nombre_banco.toString(),
        fecha_carga: data?.fecha_carga.toString(),

        total_registros: data?.total_registros
          ? data.total_registros.toString()
          : "0",
        registros_procesados: data?.registros_procesados
          ? data.registros_procesados.toString()
          : "0",
        registros_fallidos: data?.registros_fallidos
          ? data.registros_fallidos.toString()
          : "0",
        respuesta_trx_exitosas: data?.respuesta_trx_exitosas
          ? data.respuesta_trx_exitosas.toString()
          : "0",
        respuesta_trx_fallidas: data?.respuesta_trx_fallidas
          ? data.respuesta_trx_fallidas.toString()
          : "0",
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
