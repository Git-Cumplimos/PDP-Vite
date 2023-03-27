import { ExportToCsv } from "export-to-csv";

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