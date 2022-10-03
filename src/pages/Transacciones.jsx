import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Button from "../components/Base/Button";
import ButtonBar from "../components/Base/ButtonBar";
import Modal from "../components/Base/Modal";
import Select from "../components/Base/Select";
import Input from "../components/Base/Input";
import fetchData from "../utils/fetchData";
import { useAuth } from "../hooks/AuthHooks";
import Tickets from "../components/Base/Tickets";
import { useReactToPrint } from "react-to-print";
import TableEnterprise from "../components/Base/TableEnterprise";
import { formatMoney } from "../components/Base/MoneyInput";
import PaymentSummary from "../components/Compound/PaymentSummary";
import TicketsDavivienda from "../apps/Corresponsalia/CorresponsaliaDavivienda/components/TicketsDavivienda";
import TicketColpatria from "../apps/Colpatria/components/TicketColpatria";

const dateFormatter = Intl.DateTimeFormat("es-CO", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
});

const Transacciones = () => {
  const { roleInfo, userPermissions } = useAuth();
  const [tiposOp, setTiposOp] = useState([]);
  const [trxs, setTrxs] = useState([]);
  const [montoAcumulado, setMontoAcumulado] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [summaryTrx, setSummaryTrx] = useState(null);

  const [pageData, setPageData] = useState({ page: 1, limit: 10 });

  const [maxPages, setMaxPages] = useState(1);
  const [idComercio, setIdComercio] = useState(-1);
  const [usuario, setUsuario] = useState(-1);
  const [tipoComercio, setTipoComercio] = useState(null);
  const [tipoOp, setTipoOp] = useState("");
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");

  const transacciones = useCallback(() => {
    const url = `${process.env.REACT_APP_URL_TRXS_TRX}/transaciones-view`;
    const urlAcumulado = `${process.env.REACT_APP_URL_TRXS_TRX}/transaciones-acumulado`;
    const queries = { ...pageData };
    if (!(idComercio === -1 || idComercio === "")) {
      queries.id_comercio = parseInt(idComercio);
    }
    if (!(usuario === -1 || usuario === "")) {
      queries.id_usuario = parseInt(usuario);
    }
    if (tipoOp) {
      queries.id_tipo_transaccion = tipoOp;
    }
    if (fechaInicial && fechaFinal) {
      const fecha_ini = new Date(fechaInicial);
      fecha_ini.setHours(fecha_ini.getHours() + 5);
      queries.date_ini = Intl.DateTimeFormat("es-CO", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).format(fecha_ini);

      const fecha_fin = new Date(fechaFinal);
      fecha_fin.setHours(fecha_fin.getHours() + 5);
      queries.date_end = Intl.DateTimeFormat("es-CO", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).format(fecha_fin);
    }
    if (
      userPermissions.map(({ id_permission }) => id_permission).includes(5) ||
      queries.id_comercio !== -1
    ) {
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
    }

    if (tipoComercio !== null) {
      const acumQueries = { ...queries, oficina_propia: tipoComercio };
      delete acumQueries.limit;
      delete acumQueries.page;
      fetchData(urlAcumulado, "GET", acumQueries)
        .then((res) => {
          if (res?.status) {
            setMontoAcumulado(res?.obj);
          } else {
            throw new Error(res?.msg);
          }
        })
        .catch(() => {});
    }
  }, [
    pageData,
    idComercio,
    fechaFinal,
    fechaInicial,
    tipoOp,
    usuario,
    tipoComercio,
    userPermissions,
  ]);

  const closeModal = useCallback(async () => {
    setShowModal(false);
    setSelected(null);
    setSummaryTrx(null);
  }, []);

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  useEffect(() => {
    const allTypes = [];
    const tempArr = userPermissions
      .filter(({ types_trx }) => types_trx.length > 0)
      .map(({ types_trx }) => types_trx);

    tempArr.forEach((types_trx) =>
      types_trx.forEach((val) => allTypes.push(val))
    );
    setTiposOp([
      ...allTypes
        .sort((a, b) => a.Nombre.localeCompare(b.Nombre))
        .filter(
          (value, index, self) =>
            index ===
            self.findIndex(
              (t) => t.id_tipo_operacion === value.id_tipo_operacion
            )
        ),
    ]);

    setIdComercio(roleInfo?.id_comercio || -1);
    setUsuario(roleInfo?.id_usuario || -1);
    setTipoComercio(
      "tipo_comercio" in roleInfo
        ? roleInfo.tipo_comercio === "OFICINAS PROPIAS"
        : null
    );
  }, [userPermissions, roleInfo]);

  useEffect(() => {
    transacciones();
  }, [transacciones]);
  return (
    <div className="w-full flex flex-col justify-center items-center my-8">
      <h1 className="text-3xl">Transacciones</h1>
      <TableEnterprise
        title="Transacciones"
        headers={[
          "Id transaccion",
          "Operación",
          "Monto",
          "Fecha",
          "Estado de la trasaccion",
        ]}
        data={trxs.map(
          ({
            id_trx,
            "Tipo transaccion": Tipo_operacion,
            monto,
            created,
            status_trx,
          }) => {
            const tempDate = new Date(created);
            tempDate.setHours(tempDate.getHours() + 5);
            created = dateFormatter.format(tempDate);
            const money = formatMoney.format(monto);
            return {
              id_trx,
              Tipo_operacion,
              money,
              created,
              status_trx: status_trx
                ? "Transaccion aprobada"
                : "Transaccion rechazada",
            };
          }
        )}
        maxPage={maxPages}
        onSelectRow={(_e, index) => {
          setSelected(trxs[index]);
          const fecha = new Date(trxs[index]?.created);
          fecha.setHours(fecha.getHours() + 5);
          setSummaryTrx({
            "Tipo transaccion": trxs[index]?.["Tipo transaccion"],
            Fecha: dateFormatter.format(fecha),
            "Mensaje de respuesta trx": trxs[index]?.message_trx,
            Monto: formatMoney.format(trxs[index]?.monto),
            "Estado de la trasaccion": trxs[index]?.status_trx
              ? "Transaccion aprobada"
              : "Transaccion rechazada",
          });
          setShowModal(true);
        }}
        onSetPageData={setPageData}
      >
        <Input
          id="dateInit"
          label="Fecha inicial"
          type="date"
          value={fechaInicial}
          onInput={(e) => setFechaInicial(e.target.value)}
        />
        <Input
          id="dateEnd"
          label="Fecha final"
          type="date"
          value={fechaFinal}
          onInput={(e) => setFechaFinal(e.target.value)}
        />
        <Select
          className="place-self-stretch"
          id="searchBySorteo"
          label="Tipo de busqueda"
          options={[
            { value: "", label: "" },
            ...tiposOp.map(({ Nombre, id_tipo_operacion }) => {
              return { label: Nombre, value: id_tipo_operacion };
            }),
          ]}
          value={tipoOp}
          required={true}
          onChange={(e) => setTipoOp(parseInt(e.target.value) ?? "")}
        />
        {userPermissions
          .map(({ id_permission }) => id_permission)
          .includes(58) &&
          tipoComercio !== null && (
            <Fragment>
              <Input
                label="Monto acumulado"
                type="tel"
                value={formatMoney.format(montoAcumulado ?? 0)}
                readOnly
              />
            </Fragment>
          )}
        {userPermissions
          .map(({ id_permission }) => id_permission)
          .includes(5) ? (
          <>
            <Input
              id="id_comercio"
              label="Id comercio"
              type="numeric"
              value={idComercio}
              onChange={(e) => {
                setIdComercio(e.target.value);
              }}
              onLazyInput={{
                callback: (e) => {},
                timeOut: 500,
              }}
            />
            <Input
              id="id_usuario"
              label="Id usuario"
              type="numeric"
              value={usuario}
              onChange={(e) => {
                setUsuario(e.target.value);
              }}
              onLazyInput={{
                callback: (e) => {},
                timeOut: 500,
              }}
            />
          </>
        ) : (
          ""
        )}
      </TableEnterprise>
      <Modal show={showModal} handleClose={closeModal}>
        {selected?.ticket && JSON.stringify(selected?.ticket) !== "{}" ? (
          <div className="flex flex-col justify-center items-center">
            {selected?.id_autorizador === 13 ? (
              <TicketsDavivienda
                refPrint={printDiv}
                type="Reimpresión"
                ticket={selected?.ticket}
                stateTrx={selected?.status_trx}
              />
            ) : selected?.id_autorizador === 14 ? (
              <TicketColpatria
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
              <Button onClick={() => closeModal()}>Cerrar</Button>
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
                <Button onClick={() => closeModal()}>Cerrar</Button>
              </ButtonBar>
            </PaymentSummary>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default Transacciones;
