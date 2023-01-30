import React, { useCallback, useEffect, useState } from "react";
import XLSX from "xlsx";
import Input from "../../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { notifyError } from "../../../../utils/notify";
import {
  BuscarPorBanco,
  BuscarPorFecha,
} from "../../utils/fetchHistoricoContingencia";
const TablaHistoricoContingencia = ({ banco }) => {
  console.log("banco******", banco);
  const [datosTablaContingencia, setDatosTablaContingencia] = useState([]);
  const [datosFiltradosFecha, setDatosFiltradosFecha] = useState([]);
  const [cantidadPaginas, setCantidadPaginas] = useState(0);
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");

  useEffect(() => {
    ActualizarTablaPorBanco();
  }, []);
  useEffect(() => {
    ActualizarTablaPorFecha();
  }, [fechaInicial, fechaFinal]);

  const ActualizarTablaPorBanco = () => {
    BuscarPorBanco(banco)
      .then((res) => {
        console.log("------------", res);
        if (res?.results?.length == 0) {
          notifyError("No se encontraron registros");
        } else {
          setCantidadPaginas(res?.maxPages);
          setDatosTablaContingencia(res?.results);
        }
      })
      .catch((err) => {
        // console.log("ERROR", err);
        notifyError("Error al cargar Datos ");
      });
  };
  const ActualizarTablaPorFecha = () => {
    BuscarPorFecha(fechaInicial, fechaFinal, banco)
      .then((res) => {
        // console.log("RESPUESTA FECHAS", res?.results);
        if (res?.results?.length == 0) {
          notifyError("No se encontraron registros");
        } else {
          setCantidadPaginas(res?.maxPages);
          setDatosFiltradosFecha(res?.results);
        }
      })
      .catch((err) => {
        // console.log("ERROR", err);
        notifyError("Error al cargar datos por fecha ");
      });
  };
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
            datosFiltradosFecha?.map((inf) => ({
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

export default TablaHistoricoContingencia;
