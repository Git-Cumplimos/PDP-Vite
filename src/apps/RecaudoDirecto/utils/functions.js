import { fetchSecure } from "../../../utils/functions";

const url = `http://127.0.0.1:8000`;

export const cargueArchivo = (url_cargar,url_verificar) => {
  return async (file, nombre_convenio, convenio_id) => {

    try {
      // const tempFileName = file.name.split('.').slice(0, -1).join('.') +  new Date().toJSON() + ".csv";
      const tempFileName = `Cargue_archivo_${nombre_convenio}_${new Date().toJSON()}.csv`;
      const responsePostUrl = await fetchSecure(`${url_cargar}?filename=${tempFileName}`);
      const resPostUrl = await responsePostUrl.json();

      const { url, fields } = resPostUrl.obj;
      const filename = fields.key;
      console.log(resPostUrl)
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
  `${url}/convenio-recaudo/obtener-url-carga`,
  `${url}/convenio-recaudo/verificar-archivo`
);
export const cargarArchivoRetiro = cargueArchivo(
  `${url}/convenio-retiro/obtener-url-carga`,
  `${url}/convenio-retiro/verificar-archivo`
);