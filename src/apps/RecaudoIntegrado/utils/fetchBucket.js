import fetchData from "../../../utils/fetchData";
import { notify, notifyError } from "../../../utils/notify";

const urlBackend = `${process.env.REACT_APP_URL_RECAUDO_EMPRESARIAL}/servicio-contingencia-empresarial-pdp`;

export const Presigned = async (archivo, banco) => {
  console.log("BODY", archivo);
  if (!archivo) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlBackend}/uploadfile?id_proceso=${banco}`,
      "GET",
      {},
      {},
      {},
      true
    );
    if (!res?.status) {
      notifyError(res?.msg);
    }
    // return res?.obj;
    const formData2 = new FormData();

    //   if (archivo) {
    var cont_contingencia = 0;
    for (const datosS3 of res?.obj) {
      if (cont_contingencia == 0) {
        for (const property in datosS3.fields) {
          /*  console.log(datosS3.fields[property]); */
          formData2.set(`${property}`, `${datosS3.fields[property]}`);
        }
      }
      cont_contingencia += 1;
    }
    formData2.set("file", archivo);
    fetch(`${res?.obj[0]?.url}`, {
      method: "POST",
      mode: "no-cors",
      body: formData2,
    })
      .then((resrut) => {
        notify("Archivo enviado con éxito.");
      })
      .catch((err) => {
        {
          notifyError("Error al cargar el archivo de contingencia.");
        }
      });
    //   }
  } catch (err) {
    throw err;
  }
};
