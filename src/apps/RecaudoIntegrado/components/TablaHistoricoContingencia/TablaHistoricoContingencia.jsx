import React, { useCallback, useEffect, useState } from "react";
import XLSX from "xlsx";
import Input from "../../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { notifyError } from "../../../../utils/notify";
import {
  BuscarPorBanco,
  BuscarPorFecha,
  DescargarExcel,
} from "../../utils/fetchHistoricoContingencia";
const TablaHistoricoContingencia = ({ banco }) => {
  console.log("banco******", banco);
  const [datosTablaContingencia, setDatosTablaContingencia] = useState([]);
  const [datosFiltradosFecha, setDatosFiltradosFecha] = useState([]);
  const [cantidadPaginas, setCantidadPaginas] = useState(0);
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [datosTrx, setDatosTrx] = useState({
    nombre_banco: "",
    fecha_carga: "",
    total_registros: "",
    registros_procesados: "",
    registros_fallidos: "",
    respuesta_trx_exitosas: "",
    respuesta_trx_fallidas: "",
  });

  const [tablaSeleccionada, setTablaSeleccionada] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ActualizarTablaPorBanco();
  }, []);

  // useEffect(() => {
  //   DescargarReporte();
  // }, [fechaInicial]);
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

  const DescargarReporte = (data) => {
    console.log("DATOS TRX", data);
    DescargarExcel(data)
      .then((res) => {
        console.log("------------", res);
        window.open(res, "_self");
      })
      .catch((err) => {
        // console.log("ERROR", err);
        notifyError("Error al cargar Datos ");
      });
  };
  if (tablaSeleccionada) {
    DescargarReporte(datosTrx);
    setTablaSeleccionada(false);
  }

  const handleClick = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/servicio-contingencia-empresarial-pdp/generarexcel"
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Control_Transacciones.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
            console.log("esta es la tabla i", datosFiltradosFecha[i]);
            setDatosTrx((old) => {
              return {
                ...old,
                nombre_banco: datosTablaContingencia[i].identificador_banco,
                fecha_carga: datosTablaContingencia[i].fecha_carga_archivo,
                total_registros: datosTablaContingencia[i].cantidad_registros,
                registros_procesados:
                  datosTablaContingencia[i].cantidad_trx_exitosas,
                registros_fallidos:
                  datosTablaContingencia[i].cantidad_trx_fallidas,
                respuesta_trx_exitosas: JSON.stringify(
                  datosTablaContingencia[i].respuuestas_trx
                ),
                respuesta_trx_fallidas: JSON.stringify(
                  datosTablaContingencia[i].respuestas_trx_fallidas
                ),
              };
            });
            setTablaSeleccionada(true);

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

            setDatosTrx((old) => {
              return {
                ...old,
                nombre_banco: datosTablaContingencia[i].identificador_banco,
                fecha_carga: datosTablaContingencia[i].fecha_carga_archivo,
                total_registros: datosTablaContingencia[i].cantidad_registros,
                registros_procesados:
                  datosTablaContingencia[i].cantidad_trx_exitosas,
                registros_fallidos:
                  datosTablaContingencia[i].cantidad_trx_fallidas,
                respuesta_trx_exitosas: JSON.stringify(
                  datosTablaContingencia[i].respuuestas_trx
                ),
                respuesta_trx_fallidas: JSON.stringify(
                  datosTablaContingencia[i].respuestas_trx_fallidas
                ),
              };
            });
            setTablaSeleccionada(true);

            
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
          <button onClick={handleClick}>Descargar Excel</button>
        </TableEnterprise>
      )}
    </div>
  );
};

export default TablaHistoricoContingencia;
