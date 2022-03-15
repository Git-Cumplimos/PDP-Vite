import React, { useState, useCallback } from "react";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import fetchData from "../../../utils/fetchData";
import Table from "../../../components/Base/Table/Table";
import { ExportToCsv } from "export-to-csv";

const Crossval = () => {
  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState(1);
  const [idComercio, setIdComercio] = useState("");
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [tipoOp, setTipoOp] = useState(10);
  const [trxs, setTrxs] = useState([]);

  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const transacciones = useCallback(
    (page, Comercio, Tipo_operacion, date_ini, date_end) => {
      const url = `${process.env.REACT_APP_URL_TRXS_TRX}/transaciones-view`;
      const queries = {};
      if (!(Comercio === -1 || Comercio === "")) {
        queries.id_comercio = Comercio;
      }
      if (Tipo_operacion) {
        queries.id_tipo_transaccion = Tipo_operacion;
      }
      if (page) {
        queries.page = page;
      }
      if (date_ini && date_end) {
        const tempDateIni = new Date(date_ini);
        tempDateIni.setHours(tempDateIni.getHours() + 5);
        date_ini = Intl.DateTimeFormat("es-CO", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }).format(tempDateIni);
        const tempDateEnd = new Date(date_end);
        tempDateEnd.setHours(tempDateEnd.getHours() + 5);
        date_end = Intl.DateTimeFormat("es-CO", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }).format(tempDateEnd);

        queries.date_ini = date_ini;
        queries.date_end = date_end;
      }
      fetchData(url, "GET", queries)
        .then((res) => {
          if (res?.status) {
            setMaxPages(res?.obj?.maxpages);
            setTrxs(res?.obj?.trxs);
          } else {
            throw new Error(res?.msg);
          }
        })
        .catch(() => {});
    },
    []
  );

  function dailyReport(fecha_hora, operacion, debitado, acreditado, valor) {
    return {
      fecha_hora,
      operacion,
      debitado,
      acreditado,
      valor,
    };
  }
  const exportdata = (e) => {
    e.preventDefault();
    setFechaInicial("");
    setFechaFinal("");
    setIdComercio("");
    const rows = [];
    trxs.map(
      ({
        created,
        id_tipo_transaccion,
        Response_obj: { ID_Entrada = "", ID_Salida = "" },
        monto,
      }) => {
        rows.push(
          dailyReport(
            created,
            id_tipo_transaccion,
            ID_Salida,
            ID_Entrada,
            monto
          )
        );
        return null;
      }
    );
    const options = {
      fieldSeparator: ";",
      quoteStrings: '"',
      decimalSeparator: ".",
      showLabels: true,
      showTitle: true,
      title: "Reportes PUNTO DE COMPRA",
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
      filename: "REPORTE DE CONCILIACION",
    };
    const csvExporter = new ExportToCsv(options);
    if (rows.length > 0) {
      csvExporter.generateCsv(rows);
    }
    setTrxs(null);
    return null;
  };
  return (
    <div className="w-full flex flex-col justify-center items-center my-8">
      <h1 className="text-3xl">Movimientos Punto de Compra</h1>
      <Form onSubmit={exportdata} grid>
        <Input
          id="dateInit"
          label="Fecha inicial"
          type="date"
          value={fechaInicial}
          onInput={(e) => {
            setPage(1);
            setMaxPages(1);
            setFechaInicial(e.target.value);
            if (fechaFinal !== "") {
              transacciones(1, idComercio, 10, e.target.value, fechaFinal);
            }
          }}
        ></Input>
        <Input
          id="dateEnd"
          label="Fecha final"
          type="date"
          value={fechaFinal}
          onInput={(e) => {
            setPage(1);
            setFechaFinal(e.target.value);
            if (fechaInicial !== "") {
              transacciones(1, idComercio, 10, fechaInicial, e.target.value);
            }
          }}
        ></Input>
        <Input
          id="id_comercio"
          label="Id comercio"
          type="numeric"
          value={idComercio}
          onChange={(e) => {
            setIdComercio(e.target.value);
          }}
          onLazyInput={{
            callback: (e) => {
              setPage(1);

              transacciones(1, e.target.value, 10, fechaInicial, fechaFinal);
            },
            timeOut: 500,
          }}
        ></Input>
        {maxPages > 1 && (
          <ButtonBar className="col-span-1 md:col-span-2">
            <Button
              type="button"
              disabled={page < 2}
              onClick={() => {
                setPage(page - 1);
                transacciones(
                  page - 1,
                  idComercio,
                  tipoOp,
                  fechaInicial,
                  fechaFinal
                );
              }}
            >
              Anterior
            </Button>
            <Button
              type="button"
              disabled={page >= maxPages}
              onClick={() => {
                setPage(page + 1);
                transacciones(
                  page + 1,
                  idComercio,
                  tipoOp,
                  fechaInicial,
                  fechaFinal
                );
              }}
            >
              Siguiente
            </Button>
          </ButtonBar>
        )}
      </Form>
      {Array.isArray(trxs) && trxs.length > 0 && (
        <>
          <Form onSubmit={exportdata}>
            <ButtonBar>
              <Button type="submit">Descargar</Button>
            </ButtonBar>
          </Form>
          <div className="flex flex-row justify-evenly w-full my-4">
            <h1>Pagina: {page}</h1>
            <h1>Ultima pagina: {maxPages}</h1>
          </div>
          <Table
            headers={["Fecha", "Operación", "Debitado", "Acreditado", "Monto"]}
            data={trxs?.map(
              ({
                created,
                id_tipo_transaccion,
                res_obj: { ID_Entrada = "", ID_Salida = "" },
                monto,
              }) => {
                const tempDate = new Date(created);
                tempDate.setHours(tempDate.getHours() + 5);
                created = Intl.DateTimeFormat("es-CO", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                }).format(tempDate);
                const money = formatMoney.format(monto);
                return {
                  created,
                  id_tipo_transaccion,
                  ID_Salida,
                  ID_Entrada,
                  money,
                };
              }
            )}
          />
        </>
      )}
    </div>
  );
};

export default Crossval;
