import fetchData from "../../../utils/fetchData";
import { notify, notifyError } from "../../../utils/notify";

const urlBackend = `${process.env.REACT_APP_URL_RECAUDO_EMPRESARIAL}/servicio-contingencia-empresarial-pdp`;

export const BuscarPorBanco = async (bodyObj, banco) => {
  console.log("BODY", bodyObj);
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlBackend}/search?identificador_banco=bancolombia`,
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
  console.log("fechaInicial", fechaInicial);
  console.log("fechaFinal", fechaFinal);
  if ((!fechaInicial, !fechaFinal)) {
    return "Sin fechas";
  }
  try {
    const res = await fetchData(
      `${urlBackend}/search?fecha_inicio_inicio=${fechaInicial}&fecha_inicio_fin=${fechaFinal}&identificador_banco=bancolombia`,
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
