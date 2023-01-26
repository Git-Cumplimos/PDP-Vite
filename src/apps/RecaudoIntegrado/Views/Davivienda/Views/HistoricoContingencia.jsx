import TableEnterprise from "../../../../../components/Base/TableEnterprise";
import React, { useCallback, useEffect, useState } from "react";
import fetchData from "../../../../../utils/fetchData";
import Input from "../../../../../components/Base/Input";
import Select from "../../../../../components/Base/Select";
import { notifyError } from "../../../../../utils/notify";
import XLSX from "xlsx";
const HistoricoContingencia = () => {
  const [datosTablaContingencia, setDatosTablaContingencia] = useState([]);
  const [datosFiltradosFecha, setDatosFiltradosFecha] = useState([]);
  const [cantidadPaginas, setCantidadPaginas] = useState(0);
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [estadoProceso, setEstadoProceso] = useState("");
  const [numeroProceso, setNumeroProceso] = useState("");

  const urlBackend = `${process.env.REACT_APP_URL_RECAUDO_EMPRESARIAL}/servicio-contingencia-empresarial-pdp`;
  useEffect(() => {
    fetchData(
      `${urlBackend}/search?identificador_banco=davivienda`,
      "GET",
      {},
      {},
      {},
      true
    )
      .then((res) => {
        setCantidadPaginas(res?.obj?.maxPages);
        // console.log(
        //   "datos contingencia davivienda",
        //   res?.obj?.results["results"]
        // );
        if (res?.obj?.results["results"].length == 0) {
          notifyError("No se encontraron registros");
        }
        setDatosTablaContingencia(res?.obj?.results["results"]);
      })
      .catch((err) => {
        console.log(err);
        notifyError("Error al cargar Datos ");
      });
  }, []);

  useEffect(() => {
    if (fechaInicial && fechaFinal) {
      fetchData(
        //    `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actualizacionestado?fecha_inicio_inicio=${fechaInicial}&fecha_inicio_fin=${fechaFinal}`,
        `${urlBackend}/search?fecha_inicio_inicio=${fechaInicial}&fecha_inicio_fin=${fechaFinal}&identificador_banco=davivienda`,

        "GET"
      )
        /* .then((response) => response.json()) */
        .then((respuesta) => {
          setDatosFiltradosFecha(respuesta?.obj?.results["results"]);
          // console.log("respuesta", datosFiltradosFecha);
          if (respuesta?.obj?.results["results"].length == 0) {
            notifyError("No se encontraron registros");
          }
        })
        .catch((err) => {
          console.log(err);
          notifyError("Error al cargar Datos Por Fecha y Estado");
        });
    }
  }, [fechaInicial, fechaFinal]);
  const datos = [32, 32];
  return (
    <div>
      {datosFiltradosFecha?.length > 0 ? (
        <TableEnterprise
          title="Histórico de contingencia"
          maxPage={cantidadPaginas}
          headers={[
            "Banco",
            "Cantidad de registros del archivo",
            "Cantidad de registros procesados exitosamente",
            "Cantidad de registros fallidos",

            "Fecha y hora de la ejecución",
            "nombre del archivo",
          ]}
          data={
            datosTablaContingencia?.map((inf) => ({
              identificador_banco: inf.identificador_banco,
              cantidad_registros: inf.cantidad_registros,
              cantidad_trx_exitos: inf.cantidad_trx_exitosas,
              cantidad_trx_fallidas: inf.cantidad_trx_fallidas,
              fecha_carga_archivo: inf.fecha_carga_archivo,
              nombre_archivo: inf.nombre_archivo,
            })) ?? []
          }
          onSelectRow={(e, i) => {
            // console.log("esta es la tabla i", datosTablaContingencia[i]);

            // Crear objeto de hoja de cálculo
            const wb = XLSX.utils.book_new();

            // Agregar encabezados
            const ws = XLSX.utils.json_to_sheet(
              [
                {
                  "Nombre Banco": "",
                  "Fecha de carga": "",
                  "Total de registros": "",
                  "Registros procesados": "",
                  "Registros fallidos": "",
                  "Respuesta Trx": "",
                  "Respuesta Trx fallidos": "",
                },
              ],
              {
                header: [
                  "Nombre Banco",
                  "Fecha de carga",
                  "Total de registros",
                  "Registros procesados",
                  "Registros fallidos",
                  "Respuesta Trx",
                  "Respuesta Trx fallidos",
                ],
              }
            );

            // Agregar información de la transacción seleccionada
            const data = [
              {
                "Nombre Banco": datosTablaContingencia[i].identificador_banco,
                "Fecha de carga": datosTablaContingencia[i].fecha_carga_archivo,
                "Total de registros      ":
                  datosTablaContingencia[i].cantidad_registros,
                "Registros procesados     ":
                  datosTablaContingencia[i].cantidad_trx_exitosas,
                "Registros fallidos     ":
                  datosTablaContingencia[i].cantidad_trx_fallidas,

                "Respuesta Trx exitosas   ": JSON.stringify(
                  datosTablaContingencia[i].respuuestas_trx
                ),

                "Respuesta Trx fallidos   ": JSON.stringify(
                  datosTablaContingencia[i].respuestas_trx_fallidas
                ),
              },
            ];
            XLSX.utils.sheet_add_json(ws, data, { skipHeader: false });
            ws["!cols"] = [
              { wch: 20 },
              { wch: 20 },
              { wch: 20 },
              { wch: 20 },
              { wch: 20 },
              { wch: 100 },
              { wch: 100 },
            ];

            // Agregar hoja de cálculo al archivo
            XLSX.utils.book_append_sheet(wb, ws, "Control Transacciones");

            // Crear archivo de Excel
            XLSX.writeFile(wb, "Control_Transacciones.xlsx");
          }}
        >
          <Input
            id="dateInit"
            label="Fecha inicial"
            type="date"
            value={fechaInicial}
            onInput={(e) => {
              setFechaInicial(e.target.value);
            }}
          />
          <Input
            id="dateEnd"
            label="Fecha final"
            type="date"
            value={fechaFinal}
            onInput={(e) => {
              setFechaFinal(e.target.value);
            }}
          />
        </TableEnterprise>
      ) : (
        <TableEnterprise
          title="Histórico de contingencia"
          maxPage={cantidadPaginas}
          headers={[
            "Banco",
            "Cantidad de registros del archivo",
            "Cantidad de registros procesados exitosamente",
            "Cantidad de registros fallidos",

            "Fecha y hora de la ejecución",
            "nombre del archivo",
          ]}
          data={
            datosTablaContingencia?.map((inf) => ({
              identificador_banco: inf.identificador_banco,
              cantidad_registros: inf.cantidad_registros,
              cantidad_trx_exitos: inf.cantidad_trx_exitosas,
              cantidad_trx_fallidas: inf.cantidad_trx_fallidas,
              fecha_carga_archivo: inf.fecha_carga_archivo,
              nombre_archivo: inf.nombre_archivo,
            })) ?? []
          }
          onSelectRow={(e, i) => {
            // console.log("esta es la tabla i", datosTablaContingencia[i]);

            // Crear objeto de hoja de cálculo
            const wb = XLSX.utils.book_new();

            // Agregar encabezados
            const ws = XLSX.utils.json_to_sheet(
              [
                {
                  "Nombre Banco": "",
                  "Fecha de carga": "",
                  "Total de registros": "",
                  "Registros procesados": "",
                  "Registros fallidos": "",
                  "Respuesta Trx": "",
                  "Respuesta Trx fallidos": "",
                },
              ],
              {
                header: [
                  "Nombre Banco",
                  "Fecha de carga",
                  "Total de registros",
                  "Registros procesados",
                  "Registros fallidos",
                  "Respuesta Trx",
                  "Respuesta Trx fallidos",
                ],
              }
            );

            // Agregar información de la transacción seleccionada
            const data = [
              {
                "Nombre Banco": datosTablaContingencia[i].identificador_banco,
                "Fecha de carga": datosTablaContingencia[i].fecha_carga_archivo,
                "Total de registros      ":
                  datosTablaContingencia[i].cantidad_registros,
                "Registros procesados     ":
                  datosTablaContingencia[i].cantidad_trx_exitosas,
                "Registros fallidos     ":
                  datosTablaContingencia[i].cantidad_trx_fallidas,

                "Respuesta Trx exitosas   ": JSON.stringify(
                  datosTablaContingencia[i].respuuestas_trx
                ),

                "Respuesta Trx fallidos   ": JSON.stringify(
                  datosTablaContingencia[i].respuestas_trx_fallidas
                ),
              },
            ];
            XLSX.utils.sheet_add_json(ws, data, { skipHeader: false });
            ws["!cols"] = [
              { wch: 20 },
              { wch: 20 },
              { wch: 20 },
              { wch: 20 },
              { wch: 20 },
              { wch: 100 },
              { wch: 100 },
            ];

            // Agregar hoja de cálculo al archivo
            XLSX.utils.book_append_sheet(wb, ws, "Control Transacciones");

            // Crear archivo de Excel
            XLSX.writeFile(wb, "Control_Transacciones.xlsx");
          }}
        >
          <Input
            id="dateInit"
            label="Fecha Inicial"
            type="date"
            value={fechaInicial}
            onInput={(e) => {
              setFechaInicial(e.target.value);
            }}
          />
          <Input
            id="dateEnd"
            label="Fecha Final"
            type="date"
            value={fechaFinal}
            onInput={(e) => {
              setFechaFinal(e.target.value);
            }}
          />
        </TableEnterprise>
      )}
    </div>
  );
};

export default HistoricoContingencia;
