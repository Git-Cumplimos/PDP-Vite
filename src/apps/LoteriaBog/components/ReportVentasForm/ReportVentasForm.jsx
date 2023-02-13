import { useCallback, useState, useEffect, useMemo } from "react";
import fetchData from "../../../../utils/fetchData";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import { useLoteria } from "../../utils/LoteriaHooks";
import Input from "../../../../components/Base/Input";
import { notify, notifyError } from "../../../../utils/notify";
import { ExportToCsv } from "export-to-csv";
import Select from "../../../../components/Base/Select";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function createCard(
  cod_distribuidor,
  cod_sucursal,
  sorteo,
  cod_loteria,
  num_billete,
  serie,
  fracciones,
  val_venta,
  fisico,
  fecha_venta
) {
  return {
    cod_distribuidor,
    cod_sucursal,
    sorteo,
    cod_loteria,
    num_billete,
    serie,
    fracciones,
    val_venta,
    fisico,
    fecha_venta,
  };
}
const url_reportVentas = `${process.env.REACT_APP_URL_LOTERIAS}/reportes_ventas`;
const urlLoto = `${process.env.REACT_APP_URL_LOTERIAS}/contiploteria`;

const ReportVentasForm = ({ closeModal, oficina }) => {
  const { codigos_lot, setCodigos_lot } = useLoteria();

  const [sorteoOrdi, setSorteoOrdi] = useState(null);
  const [sorteoExtra, setSorteoExtra] = useState(null);

  const [sorteoOrdifisico, setSorteofisico] = useState(null);
  const [sorteoExtrafisico, setSorteofisicoextraordinario] = useState(null);

  const [fecha_ini, setFecha_ini] = useState("");
  const [fecha_fin, setFecha_fin] = useState("");
  const [disabledBtns, setDisabledBtns] = useState(true);
  const [resp_report, setResp_report] = useState(null);
  const [total, setTotal] = useState(null);
  const [sorteo, setSorteo] = useState(null);

  const sorteosLOT = useMemo(() => {
    var cod = "";
    if (codigos_lot?.length === 2) {
      cod = `${codigos_lot?.[0]?.cod_loteria},${codigos_lot?.[1]?.cod_loteria}`;
    } else {
      cod = `${codigos_lot?.[0]?.cod_loteria}`;
    }
    return cod;
  }, [codigos_lot]);

  useEffect(() => {
    setSorteo(null);
    const query = {
      num_loteria: sorteosLOT,
    };
    fetchData(urlLoto, "GET", query, {})
      .then((res) => {
        ////sorteo virtual
        setSorteoOrdi(null);
        setSorteoExtra(null);
        setSorteofisico(null);
        setSorteofisicoextraordinario(null);
        const sortOrd = res.filter(({ tip_sorteo, fisico }) => {
          return tip_sorteo === 1 && !fisico;
        });
        const sortExt = res.filter(({ tip_sorteo, fisico }) => {
          return tip_sorteo === 2 && !fisico;
        });
        if (sortOrd.length > 0) {
          setSorteoOrdi(sortOrd[0]);
        } else {
          /*  notifyError("No se encontraron sorteos ordinarios"); */
        }
        if (sortExt.length > 0) {
          setSorteoExtra(sortExt[0]);
        } else {
          /* notifyError("No se encontraron sorteos extraordinarios"); */
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////

        ///sorteo fisico
        const sortOrdfisico = res.filter(({ tip_sorteo, fisico }) => {
          return tip_sorteo === 1 && fisico;
        });
        const sortExtfisico = res.filter(({ tip_sorteo, fisico }) => {
          return tip_sorteo === 2 && fisico;
        });

        if (sortOrdfisico.length > 0) {
          setSorteofisico(sortOrdfisico[0]);
        } else {
          /*    notifyError("No se encontraron extraordinarios fisicos"); */
        }

        if (sortExtfisico.length > 0) {
          setSorteofisicoextraordinario(sortExtfisico[0]);
        } else {
          /*   notifyError("No se encontraron extraordinarios fisicos"); */
        }
      })
      .catch((err) => console.error(err));
  }, [codigos_lot, sorteosLOT]);

  const [opcionesdisponibles, SetOpcionesDisponibles] = useState([
    { value: "", label: "" },
  ]);

  useEffect(() => {
    const copy = [{ value: "", label: "" }];
    if (sorteoOrdi !== null) {
      copy.push({
        value: `${sorteoOrdi.num_sorteo}-${sorteoOrdi.fisico}-${sorteoOrdi.num_loteria}`,
        label: `Sorteo Ordinario Virtual - ${sorteoOrdi.num_sorteo}`,
      });
    }
    if (sorteoExtra !== null) {
      copy.push({
        value: `${sorteoExtra.num_sorteo}-${sorteoExtra.fisico}-${sorteoExtra.num_loteria}`,
        label: `Sorteo Extraordinario - ${sorteoExtra.num_sorteo}`,
      });
    }
    if (sorteoOrdifisico !== null) {
      copy.push({
        value: `${sorteoOrdifisico.num_sorteo}-${sorteoOrdifisico.fisico}-${sorteoOrdifisico.num_loteria}`,
        label: `Sorteo Ordinario  Físico- ${sorteoOrdifisico.num_sorteo}`,
      });
    }

    if (sorteoExtrafisico !== null) {
      copy.push({
        value: `${sorteoExtrafisico.num_sorteo}-${sorteoExtrafisico.fisico}-${sorteoExtrafisico.num_loteria}`,
        label: `Sorteo Extraordinario Físico - ${sorteoExtrafisico.num_sorteo}`,
      });
    }
    SetOpcionesDisponibles([...copy]);
  }, [
    sorteoExtra,
    sorteoExtrafisico,
    sorteoOrdi,
    sorteoOrdifisico,
    sorteosLOT,
    codigos_lot,
  ]);

  const reportVentas = useCallback(
    async (fecha_ini, fecha_fin, sorteo) => {
      setTotal(null);
      try {
        const query = {
          fecha_ini: fecha_ini,
          fecha_fin: fecha_fin,
          num_loteria: sorteosLOT,
        };
        if (oficina !== undefined) {
          query.cod_distribuidor = oficina?.cod_oficina_lot;
          query.cod_sucursal = oficina?.cod_sucursal_lot;
        }

        if (sorteo !== null) {
          query.sorteo = sorteo;
        }

        const res = await fetchData(url_reportVentas, "GET", query);

        return res;
      } catch (err) {
        console.error(err);
      }
    },
    [sorteosLOT]
  );

  //const { reportVentas } = useLoteria();

  const exportdata = (e) => {
    e.preventDefault();
    setDisabledBtns(true);
    closeModal();

    const rows = [];

    resp_report.map((row) => {
      rows.push(
        createCard(
          row.cod_distribuidor,
          row.cod_sucursal,
          row.sorteo,
          row.cod_loteria,
          row.num_billete,
          row.serie,
          row.fracciones,
          row.val_venta,
          row.fisico,
          row.fecha_venta
        )
      );
      return null;
    });
    const options = {
      fieldSeparator: ",",
      quoteStrings: '"',
      decimalSeparator: ".",
      showLabels: true,
      showTitle: true,
      title: "Reporte ventas",
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
      filename: "Reporte ventas",
      // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
    };
    const csvExporter = new ExportToCsv(options);
    if (rows.length > 0) {
      csvExporter.generateCsv(rows);
    }
    setFecha_ini("");
    setFecha_fin("");
    setResp_report(null);
    setTotal(null);
    return null;
  };
  return (
    <>
      <div className="flex flex-col justify-center items-center mx-auto container">
        <Form onSubmit={exportdata} grid>
          <div className="flex flex-row justify-between text-lg font-medium grid">
            Seleccione el rango de fechas para generar el reporte
          </div>
          {/* <Input
            id="numsorteo"
            label="Sorteo"
            type="search"
            minLength="1"
            maxLength="4"
            autoComplete="off"
            required='true'
            value={sorteo}
            onInput={(e) => {
              if(!isNaN(e.target.value)){
                const num = (e.target.value);
                setSorteo(num);
                }
            }}     
            /> */}
          <Input
            id="fecha_ini"
            label="Fecha inicial"
            type="date"
            required="true"
            value={fecha_ini}
            onInput={(e) => {
              setFecha_ini(e.target.value);
              if (fecha_fin !== "") {
                reportVentas(e.target.value, fecha_fin, sorteo).then((res) => {
                  if ("msg" in res) {
                    notifyError(res.msg);
                    setDisabledBtns(true);
                  } else {
                    setResp_report(res.data);
                    setTotal(res.total);
                    setDisabledBtns(false);
                  }
                });
              }
            }}
          />
          <Input
            id="fecha_fin"
            label="Fecha final"
            type="date"
            required="true"
            value={fecha_fin}
            onInput={(e) => {
              setFecha_fin(e.target.value);
              if (fecha_ini !== "") {
                reportVentas(fecha_ini, e.target.value, sorteo).then((res) => {
                  console.log("RESSSSS*",res)
                  if (res != undefined){
                    if ("msg" in res) {
                      notifyError(res.msg);
                      setDisabledBtns(true);
                    } else {
                      setResp_report(res.data);
                      setTotal(res.total);
                      setDisabledBtns(false);
                    }
                  }
                  
                });
              }
            }}
          />
          <Select
            // disabled={serie !== "" || numero !== ""}
            id="selectSorteo"
            label="Tipo de sorteo"
            options={opcionesdisponibles}
            value={sorteo}
            onChange={(e) => {
              setSorteo(e.target.value);
              if (fecha_ini !== "" && fecha_fin !== "") {
                reportVentas(fecha_ini, fecha_fin, e.target.value).then(
                  (res) => {
                    if ("msg" in res) {
                      notifyError(res.msg);
                      setDisabledBtns(true);
                    } else {
                      setResp_report(res.data);
                      setTotal(res.total);
                      setDisabledBtns(false);
                    }
                  }
                );
              }
            }}
          />
          {total !== null ? (
            <>
              <Input
                id="frac_venta"
                label="Fracciones Vendidas"
                type="text"
                required="true"
                value={total.total_frac}
              />
              <Input
                id="val_total"
                label="Total Ventas"
                type="text"
                required="true"
                value={formatMoney.format(total.val_total)}
              />
            </>
          ) : (
            ""
          )}

          <ButtonBar>
            <Button type="submit" disabled={disabledBtns}>
              Descargar
            </Button>
            <Button
              type="button"
              onClick={() => {
                closeModal();
                setFecha_fin("");
                setFecha_ini("");
                setResp_report(null);
                setTotal(null);
                setDisabledBtns(true);
                notifyError("Se canceló la generación de reporte de ventas")
              }}
            >
              Cancelar
            </Button>
          </ButtonBar>
        </Form>
      </div>
    </>
  );
};

export default ReportVentasForm;
