import fetchData from "../../../utils/fetchData";
import { notify, notifyError } from "../../../utils/notify";

// const urlBackend = `${process.env.REACT_APP_URL_PinesVus}`;
const urlBackend = `${process.env.REACT_APP_BASE_API}/cert/pinesVus`;
const urlBackendValidar = `${process.env.REACT_APP_URL_RECAUDO_EMPRESARIAL}/servicio-validar-archivos`;

// export const Presigned = async (archivo, filename) => {
//   console.log("BODY", archivo);
//   if (!archivo) {
//     return "Sin datos body";
//   }
//   try {
//     const res = await fetchData(
//       `${urlBackend}/uploadfile?id_proceso=${filename}`,
//       "GET",
//       {},
//       {},
//       {},
//       true
//     );
//     if (!res?.status) {
//       notifyError(res?.msg);
//     }
//     // return res?.obj;
//     const formData2 = new FormData();

//     //   if (archivo) {
//     var cont_contingencia = 0;
//     for (const datosS3 of res?.obj) {
//       if (cont_contingencia == 0) {
//         for (const property in datosS3.fields) {
//           /*  console.log(datosS3.fields[property]); */
//           formData2.set(`${property}`, `${datosS3.fields[property]}`);
//         }
//       }
//       cont_contingencia += 1;
//     }
//     formData2.set("file", archivo);
//     fetch(`${res?.obj[0]?.url}`, {
//       method: "POST",
//       mode: "no-cors",
//       body: formData2,
//     })
//       .then((resrut) => {
//         notify("Archivo cargado con éxito.");
//       })
//       .catch((err) => {
//         {
//           notifyError("Error al cargar el archivo de contingencia.");
//         }
//       });
//   } catch (err) {
//     throw err;
//   }
// };

export const Presigned_validar = async (archivo, filename) => {
  try {
    const res = await fetchData(
      `${urlBackend}/CargueS3?filename=${filename}`,
      "GET",
      {},
      {},
      {},
      true
    );
    console.log("RES", res)
    const formData = new FormData();
    const url = res.obj?.url;
    const fields = res.obj?.fields;
    const nombre_archivo = fields?.key;

    for (const property in fields) {
      formData.set(`${property}`, `${fields[property]}`);
    }

    formData.set("file", archivo);
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      body: formData,
    });
    return { nombre_archivo };
  } catch (error) {
    console.error(error);
    throw error;
  }
};