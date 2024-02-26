import { ExportToCsv } from "export-to-csv";

const formatoCupoMasivo = [
    ["pk_comercio", "sobregiro", "deuda", "cupo_en_canje", "dias_max_sobregiro", "base_caja"],
    [1, 1500, 1000, 0, 1, 0],
    [2, 2500, 2000, 0, 2, 0],
    [3, 3500, 3000, 0, 3, 0],
]

export const descargarArchivo = async (nombreArchivo, url) => {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${nombreArchivo}`;
      a.click();
      a.remove()
      window.URL.revokeObjectURL(url);
    } catch (err) { console.error(err) }
}


export const descargarFormato = async (nombreArchivo,info=formatoCupoMasivo) => {
    const headers = info[0];
    const options = {
        fieldSeparator: ";",
        // quoteStrings: "",
        // decimalSeparator: "",
        showLabels: true,
        // showTitle: false,
        // title: nombreArchivo,
        // useTextFile: false,
        useBom: false,
        // useKeysAsHeaders: false,
        headers: headers,
        filename: nombreArchivo,
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