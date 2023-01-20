import TableEnterprise from "../../../../../components/Base/TableEnterprise";
import React, { useCallback, useEffect, useState } from "react";
import fetchData from "../../../../../utils/fetchData";
import Input from "../../../../../components/Base/Input";
import Select from "../../../../../components/Base/Select";
import { notifyError } from "../../../../../utils/notify";
const HistoricoContingencia = () => {
  const [datosTablaContingencia, setDatosTablaContingencia] = useState([]);
  const [datosFiltradosFecha, setDatosFiltradosFecha] = useState([]);
  const [cantidadPaginas, setCantidadPaginas] = useState(0);
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [estadoProceso, setEstadoProceso] = useState("");
  const [numeroProceso, setNumeroProceso] = useState("");

  useEffect(() => {
    fetchData(
      "http://127.0.0.1:5000/servicio-contingencia-empresarial-pdp/search?identificador_banco=bancolombia",
      "GET",
      {},
      {},
      {},
      false
    )
      .then((res) => {
        setCantidadPaginas(res?.obj?.maxPages);
        console.log(
          "datos contingencia bancolombia",
          res?.obj?.results["results"]
        );
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
        `http://127.0.0.1:5000/servicio-contingencia-empresarial-pdp/search?fecha_inicio_inicio=${fechaInicial}&fecha_inicio_fin=${fechaFinal}&identificador_banco=bancolombia`,
        "GET"
      )
        /* .then((response) => response.json()) */
        .then((respuesta) => {
          setDatosFiltradosFecha(respuesta?.obj?.results["results"]);
          console.log("respuesta", datosFiltradosFecha);
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
            "Cantidad de registros del archivo",
            "Cantidad de registros procesados exitosamente",
            "Fecha y hora de la ejecución",
          ]}
          data={
            datosFiltradosFecha?.map((inf) => ({
              cantidad_registros: inf.cantidad_registros,
              cantidad_trx_exitos: inf.cantidad_trx_exitosas,
              fecha_carga_archivo: inf.fecha_carga_archivo,
            })) ?? []
          }
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
            "Cantidad de registros del archivo",
            "Cantidad de registros procesados exitosamente",
            "Fecha y hora de la ejecución",
          ]}
          data={
            datosTablaContingencia?.map((inf) => ({
              cantidad_registros: inf.cantidad_registros,
              cantidad_trx_exitos: inf.cantidad_trx_exitosas,
              fecha_carga_archivo: inf.fecha_carga_archivo,
            })) ?? []
          }
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
