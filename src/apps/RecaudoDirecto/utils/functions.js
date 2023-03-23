import { fetchSecure } from "../../../utils/functions";

const url = `http://127.0.0.1:8000`;
// const url = `${process.env.REACT_APP_URL_RECAUDO_RETIRO_DIRECTO}`;

export const cargueArchivo = (url_cargar,url_verificar) => {
  return async (file, nombre_convenio, convenio_id) => {

    try {
      const responsePostUrl = await fetchSecure(`${url_cargar}?nombre_convenio=${nombre_convenio}`);
      const resPostUrl = await responsePostUrl.json();

      const { url, fields } = resPostUrl.obj;
      const filename = fields.key;
      const formData = new FormData();
      for (var key in fields) {
        formData.append(key, fields[key]);
      }
      formData.set("file", file);
      await fetch(url, {
        method: "POST",
        body: formData,
        mode: "no-cors",
      });

      const responseValidacionArchivo = await fetchSecure(
        `${url_verificar}?filename=${filename}&convenio_id=${convenio_id}`
      );
      const resValidacionArchivo = await responseValidacionArchivo.json();

      if (!resValidacionArchivo?.status) {
        throw resValidacionArchivo;
      }

      return resValidacionArchivo;
    } catch (error) {
      throw error;
    }
  }
};

export const cargarArchivoRecaudo = cargueArchivo(
  `${url}/convenio-recaudo-masivo/obtener-url-carga`,
  `${url}/convenio-recaudo-masivo/verificar-archivo`
);
export const cargarArchivoRetiro = cargueArchivo(
  `${url}/convenio-retiro-masivo/obtener-url-carga`,
  `${url}/convenio-retiro-masivo/verificar-archivo`
);