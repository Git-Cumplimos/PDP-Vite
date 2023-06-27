import fetchData from "../../../utils/fetchData";
import { notify, notifyError } from "../../../utils/notify";


const urlBackendValidar = `${process.env.REACT_APP_URL_PinesVus}/validar_archivos`;

export const Validar_archivo = async (nombre_archivo) => {
  let new_nombre_archivo = nombre_archivo.substring(
    nombre_archivo.indexOf("/") + 1
  );
  // console.log("BODY", new_nombre_archivo);
  if (!nombre_archivo) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlBackendValidar}?nombre_archivo=${nombre_archivo}`,
      "GET",
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
    console.log();
    // throw err;
  }
};
