import TableEnterprise from "../../../../../components/Base/TableEnterprise";
import React, { useCallback, useEffect, useState } from "react";
import fetchData from "../../../../../utils/fetchData";
import Input from "../../../../../components/Base/Input";
import Select from "../../../../../components/Base/Select";
import { notifyError } from "../../../../../utils/notify";

const Transacciones = () => {
  const [datosTablaTrx, setDatosTablaTrx] = useState([]);
  const [datosFiltradosFecha, setDatosFiltradosFecha] = useState([]);
  const [datosFiltradosTipoOperacion, setDatosFiltradosTipoOperacion] =
    useState([]);
  const [datosTipoProceso, setDatosTipoProceso] = useState([]);
  const [cantidadPaginas, setCantidadPaginas] = useState(0);
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [tipoOperacion, setTipoOperacion] = useState("");
  const [tipoProceso, setTipoProceso] = useState();

  const urlBackend = `${process.env.REACT_APP_URL_RECAUDO_EMPRESARIAL}/servicio-contingencia-empresarial-pdp`;
  useEffect(() => {
    fetchData(
      `${urlBackend}/searchtrx?nombre_banco=bancolombia`,

      "GET",
      {},
      {},
      {},
      true
    )
      .then((res) => {
        setCantidadPaginas(res?.obj?.maxPages);
        // console.log(
        //   "datos contingencia bancolombia",
        //   res?.obj?.results["results"]
        // );
        setDatosTablaTrx(res?.obj?.results["results"]);
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
        `${urlBackend}/searchtrx?fecha_inicio_inicio=${fechaInicial}&fecha_inicio_fin=${fechaFinal}&nombre_banco=bancolombia`,

        "GET",
        {},
        {},
        {},
        true
      )
        /* .then((response) => response.json()) */
        .then((respuesta) => {
          if (respuesta?.obj?.results["results"].length == 0) {
            notifyError("No se encontraron resultados");
          }
          setDatosFiltradosFecha(respuesta?.obj?.results["results"]);
          // console.log("respuesta", datosFiltradosFecha);
        })
        .catch((err) => {
          console.log(err);
          notifyError("Error al cargar Datos Por Fecha y Estado");
        });
    }
  }, [fechaInicial, fechaFinal]);

  useEffect(() => {
    if (tipoOperacion) {
      fetchData(
        `${urlBackend}/searchtrx?nombre_banco=bancolombia&id_tipo_transaccion=${tipoOperacion}`,
        "GET",
        {},
        {},
        {},
        true
      )
        /* .then((response) => response.json()) */
        .then((respuesta) => {
          if (respuesta?.obj?.results["results"].length == 0) {
            notifyError("No se encontraron resultados");
          }
          setDatosFiltradosTipoOperacion(respuesta?.obj?.results["results"]);
          // console.log("DATOS TIPPOS DE OPERACION", datosFiltradosTipoOperacion);
        })
        .catch((err) => {
          console.log(err);
          notifyError("Error al cargar Datos Por Fecha y Estado");
        });
    }
  }, [tipoOperacion]);

  return (
    <div>
      {datosFiltradosFecha?.length > 0 ? (
        <TableEnterprise
          title="Transacciones"
          maxPage={cantidadPaginas}
          headers={[
            "Id transaccion",
            "Operación",
            "Monto",
            "Fecha y hora",
            "Estado Trx",
            "Tipo de proceso",
          ]}
          data={
            datosFiltradosFecha?.map((inf) => ({
              id_transaccion: inf.id_trx,
              operacion: inf.name_tipo_transaccion,
              monto: inf.valor_trx,
              fecha: inf.fecha_trx,
              status: inf.status_trx ? "True" : "False",
              tipo_proceso: inf.is_trx_contingencia
                ? "Contingencia"
                : "En linea",
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
          <Select
            label="Tipo operación"
            options={{
              "": "",
              "Liberación cupo": "126",
              "Reverso cupo": "127",
            }}
            value={tipoOperacion}
            /* required={true} */
            onChange={(e) => {
              setTipoOperacion(e.target.value);
            }}
          />
        </TableEnterprise>
      ) : tipoOperacion ? (
        <TableEnterprise
          title="Transacciones"
          maxPage={cantidadPaginas}
          headers={[
            "Id transaccion",
            "Operación",
            "Monto",
            "Fecha y hora",
            "Estado Trx",
            "Tipo de proceso",
          ]}
          data={
            datosFiltradosTipoOperacion?.map((inf) => ({
              id_transaccion: inf.id_trx,
              operacion: inf.name_tipo_transaccion,
              monto: inf.valor_trx,
              fecha: inf.fecha_trx,
              status: inf.status_trx ? "True" : "False",
              tipo_proceso: inf.is_trx_contingencia
                ? "Contingencia"
                : "En linea",
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
          <Select
            label="Tipo operación"
            options={{
              "": "",
              "Liberación cupo": "126",
              "Reverso cupo": "127",
            }}
            value={tipoOperacion}
            /* required={true} */
            onChange={(e) => {
              setTipoOperacion(e.target.value);
            }}
          />
        </TableEnterprise>
      ) : (
        <TableEnterprise
          title="Transacciones"
          maxPage={cantidadPaginas}
          headers={[
            "Id transaccion",
            "Operación",
            "Monto",
            "Fecha y hora",
            "Estado Trx",
            "Tipo de proceso",
          ]}
          data={
            datosTablaTrx?.map((inf) => ({
              id_transaccion: inf.id_trx,
              operacion: inf.name_tipo_transaccion,
              monto: inf.valor_trx,
              fecha: inf.fecha_trx,
              status: inf.status_trx ? "True" : "False",
              tipo_proceso: inf.is_trx_contingencia
                ? "Contingencia"
                : "En linea",
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
          <Select
            label="Tipo operación"
            options={{
              "": "",
              "Liberación cupo": "126",
              "Reverso cupo": "127",
            }}
            value={tipoOperacion}
            /* required={true} */
            onChange={(e) => {
              setTipoOperacion(e.target.value);
            }}
          />
        </TableEnterprise>
      )}
    </div>
  );
};

export default Transacciones;
