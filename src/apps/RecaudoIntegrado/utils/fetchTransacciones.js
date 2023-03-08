import fetchData from "../../../utils/fetchData";
import { notifyError } from "../../../utils/notify";

const urlBackend = `${process.env.REACT_APP_URL_RECAUDO_EMPRESARIAL}/servicio-contingencia-empresarial-pdp`;
export const BuscarPorBanco = async (banco) => {
  /*   console.log("BODY", banco); */
  if (!banco) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlBackend}/searchtrx?nombre_banco=${banco}`,
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
  if (!fechaInicial || !fechaFinal) {
    return "Sin fechas";
  }
  try {
    const res = await fetchData(
      `${urlBackend}/searchtrx?fecha_inicio_inicio=${fechaInicial}&fecha_inicio_fin=${fechaFinal}&nombre_banco=${banco}`,
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
export const BuscarPorTipoOperacion = async (banco, tipoOperacion) => {
  /*   console.log("bancofetch", banco);
  console.log("fechaInicial", fechaInicial);
  console.log("fechaFinal", fechaFinal); */
  if ((!banco, !tipoOperacion)) {
    return "Sin fechas";
  }
  try {
    const res = await fetchData(
      `${urlBackend}/searchtrx?nombre_banco=${banco}&id_tipo_transaccion=${tipoOperacion}`,
      "GET",
      {},
      {},
      {},
      true
    );
    if (!res?.status) {
      notifyError(res?.msg);
    }
    console.log("respuesta fetch BuscarPorTipoOperacion ", res);
    return res?.obj?.results;
    /* return res?.obj.results; */
  } catch (err) {
    throw err;
  }
};
