import { ExportToCsv } from "export-to-csv";

export const descargarCSV = (nombreArchivo, info) => {
  const headers = info[0];
  const options = {
    fieldSeparator: ";",
    showLabels: true,
    useBom: true,
    headers: headers,
    filename: nombreArchivo,
    quoteStrings: false,
  };
  const csvExporter = new ExportToCsv(options);
  const datosFormateados = info.slice(1).map((fila,i) => {
    let data = {}
    fila.forEach((item,index) => {
      data[headers[index] ?? " "] = item
    })
    return data
  });
  csvExporter.generateCsv(datosFormateados);
}