import { useEffect, useState } from "react";

import {
  BuscarPorBanco,
  BuscarPorFecha,
  BuscarPorTipoOperacion,
} from "../../utils/fetchTransacciones";
import Input from "../../../../components/Base/Input";
import Select from "../../../../components/Base/Select";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { notifyError } from "../../../../utils/notify";
import { formatMoney } from "../../../../components/Base/MoneyInput";

const TablaTransacciones = ({ banco }) => {
  const [datosTablaTrx, setDatosTablaTrx] = useState([]);
  const [datosFiltradosFecha, setDatosFiltradosFecha] = useState([]);
  const [datosFiltradosTipoOperacion, setDatosFiltradosTipoOperacion] =
    useState([]);
  const [cantidadPaginas, setCantidadPaginas] = useState(0);
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [tipoOperacion, setTipoOperacion] = useState("");

  const dateFormatter = Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
  useEffect(() => {
    ActualizarTablaPorBanco();
  }, []);
  useEffect(() => {
    ActualizarTablaPorTipoOperacion();
  }, [tipoOperacion]);
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
          setDatosTablaTrx(res?.results);
        }
      })
      .catch((err) => {
        // console.log("ERROR", err);
        notifyError("Error al cargar Datos ");
      });
  };
  const ActualizarTablaPorTipoOperacion = () => {
    BuscarPorTipoOperacion(banco, tipoOperacion)
      .then((res) => {
        console.log("------------", res);
        if (res?.results?.length == 0) {
          notifyError("No se encontraron registros");
        } else {
          setCantidadPaginas(res?.maxPages);
          setDatosFiltradosTipoOperacion(res?.results);
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
        console.log("RESPUESTA FECHAS", res?.results);
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
            datosFiltradosFecha?.map((inf, created) => {
              const tempDate = new Date(inf.fecha_trx);
              tempDate.setHours(tempDate.getHours() + 5);
              created = dateFormatter.format(tempDate);
              const money = formatMoney.format(inf.valor_trx);
              return {
                id_transaccion: inf.id_trx,
                operacion: inf.name_tipo_transaccion,
                monto: money,
                fecha: created,

                status: inf.status_trx ? "True" : "False",
                tipo_proceso: inf.is_trx_contingencia
                  ? "Contingencia"
                  : "En linea",
              };
            }) ?? []
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
              "Notificación recaudo": "126",
              "Reverso notificación recaudo": "127",
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
            "Id transacción",
            "Operación",
            "Monto",
            "Fecha y hora",
            "Estado Trx",
            "Tipo de proceso",
          ]}
          data={
            datosFiltradosTipoOperacion?.map((inf, created) => {
              const tempDate = new Date(inf.fecha_trx);
              tempDate.setHours(tempDate.getHours() + 5);
              created = dateFormatter.format(tempDate);
              const money = formatMoney.format(inf.valor_trx);
              return {
                id_transaccion: inf.id_trx,
                operacion: inf.name_tipo_transaccion,
                monto: money,
                fecha: created,

                status: inf.status_trx ? "True" : "False",
                tipo_proceso: inf.is_trx_contingencia
                  ? "Contingencia"
                  : "En linea",
              };
            }) ?? []
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
              "Notificación recaudo": "126",
              "Reverso notificación recaudo": "127",
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
          // data={
          //   datosTablaTrx?.map((inf) => {
          //     const fecha = new Date(inf.fecha_trx);
          //     const year = fecha.getUTCFullYear().toString();
          //     const month = (fecha.getUTCMonth() + 1)
          //       .toString()
          //       .padStart(2, "0");
          //     const day = fecha.getUTCDate().toString().padStart(2, "0");
          //     const hours = fecha.getUTCHours().toString().padStart(2, "0");
          //     const minutes = fecha.getUTCMinutes().toString().padStart(2, "0");
          //     const seconds = fecha.getUTCSeconds().toString().padStart(2, "0");
          //     return {
          //       id_transaccion: inf.id_trx,
          //       operacion: inf.name_tipo_transaccion,
          //       monto: inf.valor_trx,
          //       fecha: `${year}${month}${day} ${hours}${minutes}${seconds}`,
          //       status: inf.status_trx ? "True" : "False",
          //       tipo_proceso: inf.is_trx_contingencia
          //         ? "Contingencia"
          //         : "En linea",
          //     };
          //   }) ?? []
          // }
          // data={
          //   datosTablaTrx?.map((inf) => ({
          //     id_transaccion: inf.id_trx,
          //     operacion: inf.name_tipo_transaccion,
          //     monto: inf.valor_trx,
          //     fecha: inf.fecha_trx,
          //     status: inf.status_trx ? "True" : "False",
          //     tipo_proceso: inf.is_trx_contingencia
          //       ? "Contingencia"
          //       : "En linea",
          //   })) ?? []
          // }
          data={
            datosTablaTrx?.map((inf, created) => {
              const tempDate = new Date(inf.fecha_trx);
              tempDate.setHours(tempDate.getHours() + 5);
              created = dateFormatter.format(tempDate);
              const money = formatMoney.format(inf.valor_trx);
              return {
                id_transaccion: inf.id_trx,
                operacion: inf.name_tipo_transaccion,
                monto: money,
                fecha: created,

                status: inf.status_trx ? "True" : "False",
                tipo_proceso: inf.is_trx_contingencia
                  ? "Contingencia"
                  : "En linea",
              };
            }) ?? []
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
              "Notificación recaudo": "126",
              "Reverso notificación recaudo": "127",
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

export default TablaTransacciones;
