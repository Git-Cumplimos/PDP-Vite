import { fetchSecure } from "../../../utils/functions";

const urlCargueS3 = "http://localhost:8000/convenio-recaudo/obtener-url-carga";
const urlVerificacionArchivo =
  "http://localhost:8000/convenio-recaudo/obtener-url-carga";

export const cargueArchivo = async (file, convenio_id) => {
  try {
    const responsePostUrl = await fetchSecure(`${urlCargueS3}`);
    const resPostUrl = await responsePostUrl.json();

    const { url, fields } = resPostUrl.obj;
    const filename = fields.key;

    const formData = new FormData();
    for (var key in fields) {
      formData.append(key, fields[key]);
    }
    formData.set("file", file);
    /* const responseLoadS3 = */ await fetch(url, {
      method: "POST",
      body: formData,
      mode: "no-cors",
    });

    const responseValidacionArchivo = await fetchSecure(
      `${urlVerificacionArchivo}?filename=${filename}&convenio_id=${convenio_id}`
    );
    const resValidacionArchivo = await responseValidacionArchivo.json();

    return resValidacionArchivo;
  } catch (error) {
    throw error;
  }
};
