import { Fragment, useCallback, useEffect, useRef, useState,useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import useFetchDispatchDebounce,{ErrorPDPFetch} from "../../../../../hooks/useFetchDispatchDebounce";
import useMap from "../../../../../hooks/useMap";
import TicketsDavivienda from "../../../../../apps/Corresponsalia/CorresponsaliaDavivienda/components/TicketsDavivienda";
import TicketsPines from "../../../../../apps/PinesVus/components/TicketsPines";
import TicketsAval from "../../../../../apps/Corresponsalia/CorresponsaliaGrupoAval/components/TicketsAval";
import TicketColpatria from "../../../../../apps/Colpatria/components/TicketColpatria";
import TicketsAgrario from "../../../../../apps/Corresponsalia/CorresponsaliaBancoAgrario/components/TicketsBancoAgrario/TicketsAgrario";
import TicketsLot from "../../../../../apps/LoteriaBog/components/TicketsLot/TicketLot";
import Accordion from "../../../../../components/Base/Accordion";
import Button from "../../../../../components/Base/Button";
import Fieldset from "../../../../../components/Base/Fieldset";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import ButtonLink from "../../../../../components/Base/ButtonLink";
import Form from "../../../../../components/Base/Form";
import Modal from "../../../../../components/Base/Modal";
import Select from "../../../../../components/Base/Select";
import Tickets from "../../../../../components/Base/Tickets";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";
import { useAuth } from "../../../../../hooks/AuthHooks";
import { makeMoneyFormatter } from "../../../../../utils/functions";
import { notifyError,notifyPending } from "../../../../../utils/notify";
import { buscarReporteTrxArqueo, buscarTicketReporte, searchCierre } from "../../../utils/fetchCaja";
import { validateDates } from "../../../utils/functions";
import Input from "../../../../../components/Base/Input/Input";

const formatMoney = makeMoneyFormatter(2);

const dateFormatter = Intl.DateTimeFormat("es-CO", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
});

const GridRow = ({ cols = [], self = false, onClick = () => { } }) => (
  <div
    className={`grid gap-4 ${self ? "py-4 px-2 bg-secondary-light" : ""
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

const TreeView = ({ tree = {}, onClickLastChild = (info, ev) => { } }) =>
  Object.entries(tree).map(([key, info]) => {
    const cols = [
      key,
      info?.nombre ?? "",
      formatMoney.format(info?.monto) ?? "No data",
      "status" in info ? info?.status === true
        ? "Transacción exitosa"
        : info?.status === false
          ? "Transacción fallida"
          : ""
        : info?.total_trxs,
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

const ReporteTrx = ({ tipo_reporte = "" }) => {
  const { roleInfo,userInfo } = useAuth();
  const { pathname } = useLocation();

  const initialSearchFilters = new Map([
    ["id_comercio", roleInfo?.id_comercio ?? ""],
    ["id_usuario", roleInfo?.id_usuario ?? ""],
    ["type_report", tipo_reporte === 2 ? "Tarjeta": tipo_reporte === 1 ? "Efectivo" : ""],
    ["status", "true"],
    ["date",  Intl.DateTimeFormat("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date()).split("/").reverse().join("-")],
  ]);
  const printDiv = useRef();
  const nombreComercio = useMemo(
    () => roleInfo?.["nombre comercio"],
    [roleInfo]
  );
  const [tipoReporte, setTipoReporte] = useState("");

  useEffect(() => {
    setTipoReporte(tipo_reporte === 1 ? "Efectivo" :tipo_reporte === 2 ? "Tarjeta": "General")
  }, [tipo_reporte])

  const [searchFilters, { setAll: setSearchFilters, set: setSingleFilter  }] =
    useMap(initialSearchFilters);

  useEffect(() => {
    searchCierre({
      id_usuario: roleInfo?.id_usuario,
      id_comercio: roleInfo?.id_comercio,
      id_terminal: roleInfo?.id_dispositivo,
      nombre_comercio: nombreComercio,
      nombre_usuario: userInfo?.attributes?.name,
      direccion_comercio: roleInfo?.direccion,
    })
      .then((res) => {
        if (res?.obj === 1) {
          setSearchFilters((old)=>{
            const copy = new Map(old)
              .set("date", res?.date_end_trx);
            return copy;
          });
          setFecha(res?.date_end_trx)
        }
      })
      .catch((error) => {
        if (error?.cause === "custom") {
          notifyError(error?.message);
        }
        console.error(error?.message);
      });
    },
  [ 
    roleInfo,
    userInfo?.attributes?.name,
    nombreComercio,
    setSearchFilters,
  ])

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const [fecha, setFecha] = useState(
    Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
  }).format(new Date()).split("/").reverse().join("-"));

  const [trxTree, setTrxTree] = useState({});
  const [montoTotal, setMontoTotal] = useState(0.0);
  const [total_monto_type, setTotal_monto_type] = useState(0.0);
  const [totalTransacciones, setTotalTransacciones] = useState(0);
  const [totalTrxType, setTotalTrxType] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(false);
  const [summaryTrx, setSummaryTrx] = useState(null);

  const handleClose = useCallback(() => {
    setSelected(false);
    setSelectedInfo(false);
    setSummaryTrx(null);
  }, []);

  const getTicket = useCallback(() => {
    if (selectedInfo === false) return;
    const data = {
      id_trx : selectedInfo?.id_trx,
      id_comercio : roleInfo?.id_comercio,
      id_tipo_transaccion : selectedInfo?.id_tipo_transaccion,
    }
    notifyPending(
      buscarTicketReporte(data),
      {
        render() {
          return "Procesando petición";
        },
      },
      {
        render({ data: res }) {
          const data = res?.obj?.results ?? {}
          const fecha = new Date(data?.created);
          fecha.setHours(fecha.getHours() + 5);
          setSummaryTrx({
            "Tipo transacción": data?.["Tipo transaccion"] ?? "",
            Fecha: dateFormatter.format(fecha),
            "Mensaje de respuesta trx": data?.message_trx ??"",
            Monto: data?.monto ? formatMoney.format(data?.monto): "",
            "Estado de la transacción": (
               searchFilters.get('status') === "true" ?
                "Transacción aprobada" : "Transacción rechazada"
              ),
          })

          setSelected(data)
          return "Petición satisfactoria";
        },
      },
      {
        render({ data: err }) {
          console.error(err?.message);
          return "Petición fallida";
        },
      }
    );
  }, [selectedInfo, searchFilters, roleInfo]);

  const [fetchTrxs] = useFetchDispatchDebounce({
    onSuccess: useCallback((res) => {
      setTrxTree(res?.obj?.results);
      setMontoTotal(res?.obj?.monto);
      setTotal_monto_type(res?.obj?.total_monto_type ?? 0);
      setTotalTransacciones(res?.obj?.total_trxs);
      setTotalTrxType(res?.obj?.total_trxs_type ?? 0);
      setLoading(false)
    }, []),
    onError: useCallback((error) => {
      setLoading(false)
      if (error instanceof ErrorPDPFetch) {
        notifyError(error.message);
      }
      else if (!(error instanceof DOMException)) {
        console.error(error);
        notifyError("Error al cargar Datos ");
      }
    }, []),
  },{delay:1100});
  
  const searchTrxs = useCallback(() => {
    setSingleFilter("id_comercio", (old) => roleInfo?.id_comercio ?? old);
    setSingleFilter("id_usuario", (old) => roleInfo?.id_usuario ?? old);
    if(roleInfo?.id_comercio !== undefined && roleInfo?.id_usuario !== undefined){
      const tempMap = new Map(searchFilters);
      const url =buscarReporteTrxArqueo()
      const queries = new URLSearchParams(tempMap.entries()).toString();
      fetchTrxs(`${url}?${queries}`);
      setTimeout(() => {
        setLoading(true);
      }, 1000)
    }
  }, [fetchTrxs,setSingleFilter,searchFilters,roleInfo]
  );

  useEffect(() => { searchTrxs() }, [searchTrxs,roleInfo]);
  useEffect(() => { getTicket() }, [selectedInfo, getTicket]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Reporte {tipoReporte.toLocaleLowerCase()} arqueo de caja </h1>
      <div className="w-full px-10 my-10">
        <Form grid>
          <Select
            id="trxState"
            name="trxState"
            label="Estado de la transacción"
            options={[
              // { value: "null", label: "" },
              { value: "true", label: "Aprobada" },
              { value: "false", label: "Fallida" },
            ]}
            onChange={(ev) => {
              setSearchFilters((old)=>{
                const copy = new Map(old)
                  .set("status", ev.target.value);
                return copy;
              });
            }}
            defaultValue={"true"}
            disabled={loading}
          />
          <Input
            id="id"
            label="Fecha"
            name="fecha"
            type="date"
            autoComplete="off"
            onChange={(e) => {
              let bool = validateDates(e.target.value );    
              if (bool && tipoReporte !== "General" ) {
                setFecha(e.target.value)
                setSearchFilters((old)=>{
                  const copy = new Map(old)
                    .set("date", e.target.value);
                  return copy;
                });
              }
            }}
            value={fecha}
            disabled={tipoReporte === "General" || loading ? true : false}
            required
          />
 
          <Fieldset
            legend={"Totales"}
            className='lg:col-span-2'>
            <Input
              id='total_valor'
              name='total_valor'
              label={"Total Valor General"}
              value={formatMoney.format(montoTotal)}
              autoComplete='off'
              disabled
            />
            <Input
              id='total_trx'
              name='total_trx'
              label={"Total Transacciones General"}
              value={totalTransacciones}
              autoComplete='off'
              disabled
            />
            {tipo_reporte !== "" ? (
              <>
                <Input
                  id='total_monto_type'
                  name='total_monto_type'
                  label={`Total ${tipoReporte}`}
                  value={formatMoney.format(total_monto_type)}
                  autoComplete='off'
                  disabled
                />
                <Input
                  id='total_trx_type'
                  name='total_trx_type'
                  label={`Total Transacciones ${tipoReporte}`}
                  value={totalTrxType}
                  autoComplete='off'
                  disabled
                />
              </>
            ) : ("")}
          </Fieldset>
        </Form>
        <Accordion
          titulo={
            <GridRow
              cols={["Id", "Autorizador", `Total Valor ${tipoReporte}`, "No. Transacciones", ""]}
            />
          }
        />
        <TreeView
          tree={trxTree}
          onClickLastChild={(info, ev) => {
            setSelectedInfo(info)
          }}
        />
      </div>
      <Modal show={selected} handleClose={handleClose}>
        {selected?.ticket && JSON.stringify(selected?.ticket) !== "{}" ? (
          <div className="flex flex-col justify-center items-center">
            {selected?.ticket.autorizador === 14 ||  selected?.id_autorizador === 14 ? (
              <TicketColpatria
                refPrint={printDiv}
                type="Reimpresión"
                ticket={selected?.ticket}
                stateTrx={selected?.status_trx}
              />
            ) : selected?.ticket?.autorizador === 17 ||  selected?.id_autorizador === 17 ? (
              <TicketsAval
                refPrint={printDiv}
                type="Reimpresión"
                ticket={selected?.ticket}
                stateTrx={selected?.status_trx}
              />
            ) : selected?.ticket?.autorizador === 16 ||  selected?.id_autorizador === 16 ? (
              <TicketsAgrario
                refPrint={printDiv}
                type="Reimpresión"
                ticket={selected?.ticket}
                stateTrx={selected?.status_trx}
              />
            ) : selected?.id_autorizador === 13 ? (
              <TicketsDavivienda
                refPrint={printDiv}
                type="Reimpresión"
                ticket={selected?.ticket}
                stateTrx={selected?.status_trx}
              />
            ) : selected?.id_tipo_transaccion === 43 ||
              selected?.id_tipo_transaccion === 44 ||
              selected?.id_tipo_transaccion === 45 ? (
              <div ref={printDiv}>
                {selected?.ticket?.ticket2 ? (
                  <>
                    <TicketsPines
                      refPrint={null}
                      ticket={selected?.ticket?.ticket1}
                      type="Reimpresión"
                      stateTrx={selected?.status_trx}
                      logo="LogoVus"
                    />
                    <TicketsPines
                      refPrint={null}
                      ticket={selected?.ticket?.ticket2}
                      type="Reimpresión"
                      stateTrx={selected?.status_trx}
                      logo="LogoVus"
                    />
                  </>
                ) : (
                  <TicketsPines
                    refPrint={null}
                    ticket={selected?.ticket}
                    type="Reimpresión"
                    stateTrx={selected?.status_trx}
                    logo="LogoVus"
                  />
                )}
              </div>
            ) : selected?.id_autorizador === 3 ? (
              <TicketsLot
                refPrint={printDiv}
                type="Reimpresión"
                ticket={selected?.ticket}
                loteria={"Lotería de Bogotá"}
                stateTrx={selected?.status_trx}
              />
            ) : selected?.id_autorizador === 8 ? (
              <TicketsLot
                refPrint={printDiv}
                type="Reimpresión"
                ticket={selected?.ticket}
                loteria={"Lotería del Tolima"}
                stateTrx={selected?.status_trx}
              />
            ) : selected?.id_autorizador === 19 ? (
              <TicketsLot
                refPrint={printDiv}
                type="Reimpresión"
                ticket={selected?.ticket}
                loteria={"Lotería de Cundinamarca"}
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
              <Button onClick={() => handleClose()}>Cerrar</Button>
            </ButtonBar>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center mx-auto container">
            <PaymentSummary
              title="Resumen transacción"
              subtitle=""
              summaryTrx={summaryTrx}
            >
              <h1 className="text-3xl mt-6 text-aling">
                No hay ticket registrado
              </h1>
              <ButtonBar>
                <Button onClick={() => handleClose()}>Cerrar</Button>
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
