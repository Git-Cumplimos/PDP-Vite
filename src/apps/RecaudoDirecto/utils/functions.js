import { fetchSecure } from "../../../utils/functions";
import { ExportToCsv } from "export-to-csv";

// const url = `http://127.0.0.1:8000`;
const url = `${process.env.REACT_APP_URL_RECAUDO_RETIRO_DIRECTO}`;

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

export const descargarCSV = (nombreArchivo, info) => {
  const options = {
    fieldSeparator: ";",
    quoteStrings: '"',
    decimalSeparator: ",",
    showLabels: true,
    showTitle: false,
    title: nombreArchivo,
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: false,
    filename: nombreArchivo,
  };
  const csvExporter = new ExportToCsv(options);
  const data = JSON.stringify(info);
  csvExporter.generateCsv(data);
}

/**
 * On change for just number inputs
 * @param {*} ev
 * @returns digits in text
 */
export const onChangeEan13Number = (ev) => {
  let caret_pos = ev.target.selectionStart ?? 0;
  const len = ev.target.value.length;

  ev.target.value = ((ev.target.value ?? "").match(/\d/g) ?? []).join("");

  if (ev.target.value.length >= 1 && ev.target.value.length < ev.target.maxLength ) {
    ev.target.setCustomValidity(
      `Aumenta la longitud del texto a ${ev.target.maxLength} caracteres como minimo (actualmente, el texto tiene ${ev.target.value.length} caracteres)`
    );
  } else {
    ev.target.setCustomValidity("");
  }

  ev.target.focus();
  caret_pos += ev.target.value.length - len;
  ev.target.setSelectionRange(caret_pos, caret_pos);

  return ev.target.value;
};