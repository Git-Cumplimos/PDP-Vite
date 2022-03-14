import { useCallback, useState, useRef, useEffect } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Modal from "../../../components/Base/Modal";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Select from "../../../components/Base/Select";
import Tickets from "../../../components/Base/Tickets";
import { useReactToPrint } from "react-to-print";
import { notify, notifyError } from "../../../utils/notify";
import fetchData from "../../../utils/fetchData";
import { ExportToCsv } from "export-to-csv";
import { useAuth } from "../../../hooks/AuthHooks";
import TableEnterprise from "../../../components/Base/TableEnterprise";

function createCard(
  codigo_punto,
  punto,
  credito,
  estado,
  motivo,
  cliente,
  cedula,
  total,
  fecha,
  hora
) {
  return {
    codigo_punto,
    punto,
    credito,
    estado,
    motivo,
    cliente,
    cedula,
    total,
    fecha,
    hora,
  };
}

const pageStyle = `
  @page {
    size: 80mm 50mm;
  }

  @media all {
    .pagebreak {
      display: none;
    }
  }

  @media print {
    .pagebreak {
      page-break-before: always;
    }
  }
`;

const url_Report = `${process.env.REACT_APP_URL_TRXS_TRX}/transaciones-view`;
const url_Download = `${process.env.REACT_APP_URL_FDLMWSDL}/report`;

const Reporte = () => {
  const { userPermissions, roleInfo } = useAuth();

  const [trxs, setTrxs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [comercio, setComercio] = useState(-1);
  const [maxPages, setMaxPages] = useState(1);
  const [tipoOp, setTipoOp] = useState("");
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [fechaInicialDownload, setFechaInicialDownload] = useState("");
  const [fechaFinalDownload, setFechaFinalDownload] = useState("");
  const [Download, setDownload] = useState(null);
  const [showModal2, setShowModal2] = useState(false);
  const [disabledBtn, setDisabledBtn] = useState(true);

  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    pageStyle: pageStyle,
  });

  const exportdata = (e) => {
    e.preventDefault();
    setShowModal2(false);
    setFechaInicialDownload("");
    setFechaFinalDownload("");
    setDisabledBtn(true);
    const rows = [];
    Download.map((row) => {
      rows.push(
        createCard(
          row.codigo_punto,
          row.punto,
          row.credito,
          row.estado,
          row.motivo,
          row.cliente,
          row.cedula,
          row.total,
          row.fecha,
          row.hora
        )
      );
      return null;
    });
    const options = {
      fieldSeparator: ";",
      quoteStrings: '"',
      decimalSeparator: ".",
      showLabels: true,
      showTitle: true,
      title: "Reporte FDLM",
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
      filename: "REPORTE DIARIO CONCILIACION",
    };
    const csvExporter = new ExportToCsv(options);
    if (rows.length > 0) {
      csvExporter.generateCsv(rows);
    }
    setDownload(null);
    return null;
  };

  const options = [
    { value: "", label: "" },
    { value: "5", label: "Recaudos" },
    { value: "6", label: "Reversos" },
  ];

  useEffect(() => {
    setComercio(roleInfo?.id_comercio || -1);
  }, [userPermissions, roleInfo?.id_comercio]);

  useEffect(() => {
    report(comercio, tipoOp, page, fechaInicial, fechaFinal, limit);
  }, [page, limit]);

  /*Buscar report*/
  const report = useCallback(
    async (Comercio, Tipo_operacion, page, date_ini, date_end, limit) => {
      const url = url_Report;
      const queries = {};
      if (!(Comercio === -1 || Comercio === "")) {
        queries.id_comercio = parseInt(Comercio);
      }
      if (Tipo_operacion) {
        queries.id_tipo_transaccion = Tipo_operacion;
      }
      if (page) {
        queries.page = page;
      }
      if (date_ini && date_end) {
        queries.date_ini = new Date(date_ini).toLocaleDateString();
        queries.date_end = new Date(date_end).toLocaleDateString();
      }
      if (limit) {
        queries.limit = limit;
      }
      console.log(queries);
      if (Tipo_operacion) {
        try {
          const res = await fetchData(url, "GET", queries);
          console.log(res);
          if (res.status === false) {
            notifyError(res.msg);
          } else {
            setMaxPages(res?.obj?.maxpages);
            setTrxs(res?.obj?.trxs);
          }
        } catch (err) {
          console.error(err);
        }
      }
    },
    []
  );

  /*Download*/
  const download = useCallback(async (fecha_ini, fecha_fin) => {
    const query = {};
    query.fecha_ini = fecha_ini;
    query.fecha_fin = fecha_fin;
    try {
      const res = await fetchData(url_Download, "GET", query);
      console.log(res);
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    setShowModal2(true);
  };

  const closeModal2 = useCallback(() => {
    setShowModal2(false);
    setDisabledBtn(true);
    setDownload(null);
    setFechaInicialDownload("");
    setFechaFinalDownload("");
  });

  const closeModal = useCallback(() => {
    setShowModal(false);
  });

  return (
    <div className="w-full flex flex-col justify-center items-center my-8">
      <h1 className="text-3xl">Reporte</h1>
      <Form onSubmit={onSubmit} grid>
        {userPermissions
          .map(({ id_permission }) => id_permission)
          .includes(28) ? (
          <ButtonBar className="col-span-1 md:col-span-2">
            <Button type="submit" onClick={() => {}}>
              Descargar reporte
            </Button>
          </ButtonBar>
        ) : (
          ""
        )}

        <Input
          id="dateInit"
          label="Fecha inicial"
          type="date"
          value={fechaInicial}
          onInput={(e) => {
            // setPage(1);
            setMaxPages(1);
            setFechaInicial(e.target.value);
            if (fechaFinal !== "") {
              if (tipoOp !== "") {
                report(comercio, tipoOp, 1, e.target.value, fechaFinal, limit);
              }
            }
          }}
        />
        <Input
          id="dateEnd"
          label="Fecha final"
          type="date"
          value={fechaFinal}
          onInput={(e) => {
            // setPage(1);
            setFechaFinal(e.target.value);
            if (fechaInicial !== "") {
              if (tipoOp !== "") {
                report(
                  comercio,
                  tipoOp,
                  1,
                  fechaInicial,
                  e.target.value,
                  limit
                );
              }
            }
          }}
        />

        <Select
          id="searchBySorteo"
          label="Tipo de busqueda"
          options={options}
          value={tipoOp}
          onChange={(e) => {
            // setPage(1);
            setTipoOp(parseInt(e.target.value));
            if (!(e.target.value === null || e.target.value === "")) {
              report(
                comercio,
                e.target.value,
                1,
                fechaInicial,
                fechaFinal,
                limit
              );
            }
          }}
        />
        {userPermissions
          .map(({ id_permission }) => id_permission)
          .includes(28) ? (
          <Input
            id="id_comercio"
            label="Id comercio"
            type="numeric"
            value={comercio}
            onChange={(e) => {
              setComercio(e.target.value);
            }}
            onLazyInput={{
              callback: (e) => {
                // setPage(1);
                if (tipoOp !== "") {
                  report(
                    e.target.value,
                    tipoOp,
                    1,
                    fechaInicial,
                    fechaFinal,
                    limit
                  );
                }
              },
              timeOut: 500,
            }}
          />
        ) : (
          ""
        )}
      </Form>
      {Array.isArray(trxs) && trxs.length > 0 ? (
        <TableEnterprise
          title="Reportes"
          maxPage={maxPages}
          // onChange={onChangeRecaudos}
          headers={["Fecha", "Mensaje", "Monto"]}
          data={trxs.map(
            ({ created, res_obj: { Mensaje } = { Mensaje: "" }, monto }) => {
              const tempDate = new Date(created);
              tempDate.setHours(tempDate.getHours() + 5);
              created = Intl.DateTimeFormat("es-CO", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              }).format(tempDate);
              return {
                created,
                Mensaje,
                monto,
              };
            }
          )}
          onSelectRow={(_e, index) => {
            setSelected(trxs[index]);
            setShowModal(true);
          }}
          onSetPageData={setPageData}
        ></TableEnterprise>
      ) : (
        ""
      )}

      <Modal show={showModal} handleClose={closeModal}>
        {selected?.ticket ? (
          <div className="flex flex-col justify-center items-center">
            <Tickets
              refPrint={printDiv}
              type="Reimpresión"
              ticket={selected?.ticket}
            />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button
                onClick={() => {
                  closeModal();
                  setSelected(null);
                }}
              >
                Cerrar
              </Button>
            </ButtonBar>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center mx-auto container">
            <h1 className="text-3xl mt-6 text-aling">
              No hay ticket registrado
            </h1>
          </div>
        )}
      </Modal>
      <Modal show={showModal2} handleClose={closeModal2}>
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
          <h1 className="text-2xl font-semibold">
            Seleccione el rango de fechas para realizar la descarga
          </h1>
          <Form onSubmit={exportdata}>
            <Input
              id="dateInit"
              label="Fecha inicial"
              type="date"
              value={fechaInicialDownload}
              onInput={(e) => {
                // setPage(1);
                setMaxPages(1);
                setFechaInicialDownload(e.target.value);
                if (fechaFinalDownload !== "") {
                  download(e.target.value, fechaFinalDownload).then((res) => {
                    if (res.status === false) {
                      setDownload(null);
                      notifyError(res.msg);
                    } else {
                      setDisabledBtn(false);
                      setDownload(res?.obj);
                    }
                  });
                }
              }}
            />
            <Input
              id="dateEnd"
              label="Fecha final"
              type="date"
              value={fechaFinalDownload}
              onInput={(e) => {
                // setPage(1);
                setFechaFinalDownload(e.target.value);
                if (fechaInicialDownload !== "") {
                  download(fechaInicialDownload, e.target.value).then((res) => {
                    if (res.status === false) {
                      setDownload(null);
                      notifyError(res.msg);
                    } else {
                      setDownload(res?.obj?.results);
                      setDisabledBtn(false);
                    }
                  });
                }
              }}
            />

            <ButtonBar>
              <Button type="submit" disabled={disabledBtn}>
                Descargar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  closeModal2();
                }}
              >
                Cancelar
              </Button>
            </ButtonBar>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default Reporte;
