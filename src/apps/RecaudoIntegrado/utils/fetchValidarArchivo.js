import fetchData from "../../../utils/fetchData";
import { notify, notifyError } from "../../../utils/notify";

// const urlBackend = `${process.env.REACT_APP_URL_RECAUDO_EMPRESARIAL}/servicio-contingencia-empresarial-pdp`;
const urlBackendValidar = `${process.env.REACT_APP_URL_RECAUDO_EMPRESARIAL}/servicio-validar-archivos`;

export const Validar_archivo = async (banco, nombre_archivo) => {
  let new_nombre_archivo = nombre_archivo.substring(
    nombre_archivo.indexOf("/") + 1
  );
  // console.log("BODY", new_nombre_archivo);
  if (!nombre_archivo || !banco) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlBackendValidar}/verificar?id_proceso=${banco}&nombre_archivo=${new_nombre_archivo}`,
      "POST",
      {},
      {},
      {},
      true
    );
    // console.log("respuesta fetch validar archivo", res);
    if (!res?.status) {
      notifyError(res?.msg);
      return res;
    } else {
      notify(res?.msg);
      return res;
    }
    // return res?.obj;

    //   }
  } catch (err) {
    throw err;
  }
};
