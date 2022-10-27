import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import TicketsDavivienda from "../../../../apps/Corresponsalia/CorresponsaliaDavivienda/components/TicketsDavivienda";
import Accordion from "../../../../components/Base/Accordion";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import ButtonLink from "../../../../components/Base/ButtonLink";
import Form from "../../../../components/Base/Form";
import Modal from "../../../../components/Base/Modal";
import Select from "../../../../components/Base/Select";
import Tickets from "../../../../components/Base/Tickets";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import { useAuth } from "../../../../hooks/AuthHooks";
import { makeMoneyFormatter } from "../../../../utils/functions";
import { notifyError } from "../../../../utils/notify";
import { buscarReporteTrxArqueo } from "../../utils/fetchCaja";

const formatMoney = makeMoneyFormatter(2);

const GridRow = ({ cols = [], self = false, onClick = () => {} }) => (
  <div
    className={`grid gap-4 ${
      self ? "py-4 px-2 bg-secondary-light" : ""
    } cursor-pointer`}
    style={{
      gridTemplateColumns: `repeat(${cols?.length || 1}, minmax(0, 1fr))`,
    }}
    onClick={onClick}
  >
    {cols.map((val, ind) => (
      <div key={ind}>{val}</div>
    ))}
  </div>
);

const TreeView = ({ tree = {}, onClickLastChild = (info, ev) => {} }) =>
  Object.entries(tree).map(([key, info]) => {
    const cols = [
      key,
      info?.nombre ?? "",
      formatMoney.format(info?.monto) ?? "No data",
      info?.status === true
        ? "Transaccion exitosa"
        : info?.status === false
        ? "Transaccion fallida"
        : "",
      info?.date_trx ?? "",
    ];

    if (info?.nodes) {
      return (
        <Accordion titulo={<GridRow cols={cols} />} key={key}>
          {info?.nodes && (
            <TreeView tree={info?.nodes} onClickLastChild={onClickLastChild} />
          )}
        </Accordion>
      );
    }
    return (
      <GridRow
        key={key}
        cols={cols}
        onClick={(ev) => onClickLastChild(info, ev)}
        self
      />
    );
  });

const ReporteTrx = () => {
  const { roleInfo } = useAuth();
  const { pathname } = useLocation();

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const [trxState, setTrxState] = useState("true");

  const [trxTree, setTrxTree] = useState({});
  const [montoTotal, setMontoTotal] = useState(0.0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [summaryTrx, setSummaryTrx] = useState(null);

  const handleClose = useCallback(() => {
    setSelected(null);
    setSummaryTrx(null);
  }, []);

  useEffect(() => {
    const conditions = [
      roleInfo?.id_usuario !== undefined,
      roleInfo?.id_usuario !== null,
      roleInfo?.id_comercio !== undefined,
      roleInfo?.id_comercio !== null,
      roleInfo?.id_dispositivo !== undefined,
      roleInfo?.id_dispositivo !== null,
    ];
    if (conditions.every((val) => val)) {
      setLoading(true);
      buscarReporteTrxArqueo({
        id_usuario: roleInfo?.id_usuario,
        id_comercio: roleInfo?.id_comercio,
        id_terminal: roleInfo?.id_dispositivo,
        status: trxState,
      })
        .then((res) => {
          setTrxTree(res?.obj?.results);
          setMontoTotal(res?.obj?.monto);
        })
        .catch((error) => {
          if (error?.cause === "custom") {
            notifyError(error?.message);
            return;
          }
          console.error(error?.message);
          notifyError("Consulta fallida");
        })
        .finally(() => setLoading(false));
    }
  }, [
    roleInfo?.id_comercio,
    roleInfo?.id_dispositivo,
    roleInfo?.id_usuario,
    trxState,
  ]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Reporte de transacciones</h1>
      <div className="w-full px-10 my-10">
        <Form grid>
          <Select
            id="trxState"
            name="trxState"
            label="Estado de la transaccion"
            options={[
              // { value: "null", label: "" },
              { value: "true", label: "Aprobada" },
              { value: "false", label: "Fallida" },
            ]}
            onChange={(ev) => setTrxState(ev.target.value)}
            defaultValue={"true"}
            disabled={loading}
          />
          <ButtonBar />
        </Form>
        <Accordion
          titulo={
            <GridRow
              cols={["", "Total", formatMoney.format(montoTotal), "", ""]}
            />
          }
        />
        <TreeView
          tree={trxTree}
          onClickLastChild={(info, ev) => {
            setSelected(info);
            setSummaryTrx({
              "Tipo transaccion": info?.nombre_tipo_transaccion,
              Fecha: info?.date_trx,
              "Mensaje de respuesta trx": info?.message_trx,
              Monto: formatMoney.format(info?.monto),
              "Estado de la trasaccion": info?.status_trx
                ? "Transaccion aprobada"
                : "Transaccion rechazada",
            });
          }}
        />
      </div>
      <Modal show={selected} handleClose={handleClose}>
        {selected?.ticket &&
        Object.entries(selected?.ticket ?? {}).length > 0 ? (
          <div className="flex flex-col justify-center items-center">
            {selected?.id_autorizador === 13 ? (
              <TicketsDavivienda
                refPrint={printDiv}
                type="Reimpresión"
                ticket={selected?.ticket}
                stateTrx={selected?.status_trx}
              />
            ) : (
              <Tickets
                refPrint={printDiv}
                type="Reimpresión"
                ticket={selected?.ticket}
                stateTrx={selected?.status_trx}
              />
            )}
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={handleClose}>Cerrar</Button>
            </ButtonBar>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center mx-auto container">
            <PaymentSummary
              title="Resumen transaccion"
              subtitle=""
              summaryTrx={summaryTrx}
            >
              <h1 className="text-3xl mt-6 text-aling">
                No hay ticket registrado
              </h1>
              <ButtonBar>
                <Button onClick={handleClose}>Cerrar</Button>
              </ButtonBar>
            </PaymentSummary>
          </div>
        )}
      </Modal>
      {pathname === "/gestion/arqueo/arqueo-cierre/reporte" && (
        <ButtonBar>
          <ButtonLink
            className="px-4 py-2 bg-primary text-white rounded-full transition-opacity duration-300"
            to={"/gestion/arqueo/arqueo-cierre"}
          >
            Realizar arqueo y cierre de caja
          </ButtonLink>
        </ButtonBar>
      )}
    </Fragment>
  );
};

export default ReporteTrx;
