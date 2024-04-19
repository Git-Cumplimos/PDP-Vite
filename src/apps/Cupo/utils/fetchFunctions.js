import { fetchSecure } from "../../../utils/functions";
import fetchData from "../../../utils/fetchData";

const urlCupo = `${process.env.REACT_APP_URL_SERVICIOS_CUPO_COMERCIO}`;
const urlComercios = `${process.env.REACT_APP_URL_SERVICE_COMMERCE}`;
// const urlCupo = `http://127.0.0.1:5000`;
// const urlComercios = `http://127.0.0.1:5000`;

const buildGetFunction = (url) => {
  return async (args = {}) => {
    try {
      const new_args = Object.fromEntries(Object.entries(args).filter(([key, value]) => value !== '' && value !== null))
      const res = await fetchData(url, "GET", new_args);
      if (!res?.status) {
        if (res?.msg) {
          throw new Error(res?.msg, { cause: "custom" });
        }
        throw new Error(res, { cause: "custom" });
      }
      return res;
    } catch (err) {
      throw err
    }
  };
};

export const cargueArchivo = (url_cargar, url_verificar) => {
  return async (file, id_usuario, id_comercio = 0, id_dispositivo = 0) => {
    try {
      const responsePostUrl = await fetchSecure(`${url_cargar}?file_name=${file.name}&id_usuario=${id_usuario}&id_comercio=${id_comercio}&id_dispositivo=${id_dispositivo}`);
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

      const body = {
        "file": filename,
        "id_dispositivo" : id_dispositivo,
        "id_comercio" : id_comercio,
        "id_usuario" : id_usuario
      }

      const responseValidacionArchivo = await fetchData(url_verificar, "POST", {}, body);

      // const resValidacionArchivo = await responseValidacionArchivo.json();

      if (!responseValidacionArchivo?.status) {
        throw responseValidacionArchivo;
      }

      return responseValidacionArchivo;
    } catch (error) {
      throw error;
    }
  }
};
const validarAjustesMasivos = (url, functionMasive) => {
  return async (file, id_usuario, id_comercio = 0, id_dispositivo = 0) => {
    const resp = await functionMasive(file, id_usuario, id_comercio, id_dispositivo)

    const cantidad_estimada = resp?.obj?.cantidad ?? null
    const id_file = resp?.obj?.id_file ?? null

    if (id_file != null) {

      for (let i = 0; i < 5; i++) {
        try {
          let res = await fetchData(url + "?id_file=" + id_file, "GET");
          if (res?.status && (res?.obj?.cantidad ?? 0 ) >= cantidad_estimada) {
            res.msg = `Se han realizado ${res?.obj?.cantidad ?? 0} ajustes de manera masiva`
            return res;
          }
        } catch (err) {}
        await new Promise(resolve => setTimeout(resolve, 10000 * 1));
      }
      throw {"msg":"Error al validar los ajustes procesados, validar de manera manual"}
    }

  };
};

export const getConsultaComercios = () =>{
  return `${urlCupo}/servicio-cupo/cupo-paginated`
};
export const getConsultaCupoComercio = buildGetFunction(
  `${urlCupo}/servicio-cupo/gestion-cupo`
);
export const cargarArchivoCupoMasivo = validarAjustesMasivos(
  `${urlCupo}/servicio-cupo/consultar-ajuste-cupo-masivo`,
  cargueArchivo(
    `${urlCupo}/servicio-cupo/crear-cupo-masivo`,
    `${urlCupo}/servicio-cupo/crear-cupo-masivo`
  )
);
export const cargarArchivoAjusteCupoMasivo = validarAjustesMasivos(
  `${urlCupo}/servicio-cupo/consultar-ajuste-cupo-masivo`,
  cargueArchivo(
    `${urlCupo}/servicio-cupo/ajuste-cupo-masivo`,
    `${urlCupo}/servicio-cupo/ajuste-cupo-masivo`
  )
);

export const getConsultaDtlMovCupo = () =>{
  return `${urlCupo}/servicio-cupo/dtlcupo/sinpdf`
};

export const getConsultaAsignacionCupoLimite = () =>{
  return `${urlCupo}/servicio-cupo/modificacion-cupo`
};