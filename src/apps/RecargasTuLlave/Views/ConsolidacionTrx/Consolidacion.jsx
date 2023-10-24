import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import useFetchDispatchDebounce,{ErrorPDPFetch} from "../../../../hooks/useFetchDispatchDebounce";
import useMap from "../../../../hooks/useMap";
import Accordion from "../../../../components/Base/Accordion";
// import Button from "../../../../components/Base/Button";
import Fieldset from "../../../../components/Base/Fieldset";
// import ButtonBar from "../../../../components/Base/ButtonBar";
// import ButtonLink from "../../../../components/Base/ButtonLink";
import Form from "../../../../components/Base/Form";
// import Modal from "../../../../components/Base/Modal";
import Select from "../../../../components/Base/Select";
import { useAuth } from "../../../../hooks/AuthHooks";
import { makeMoneyFormatter } from "../../../../utils/functions";
import { notifyError,notifyPending } from "../../../../utils/notify";
import { buscarReporteTrxTuLlave } from "../../utils/fetchTuLlave";
import { validateDates } from "../../../../pages/Gestion/utils/functions";
import Input from "../../../../components/Base/Input/Input";

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
    className={`grid gap-4 ${self ? "py-2 px-2 bg-secondary-light" : ""
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
    console.log(info)
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

const ReporteTuLLaveTrx = () => {
  const { roleInfo } = useAuth();
  const { pathname } = useLocation();

  const initialSearchFilters = new Map([
    ["id_comercio", roleInfo?.id_comercio ?? ""],
    ["id_usuario", roleInfo?.id_usuario ?? ""],
    ["status", "true"],
    ["date",  Intl.DateTimeFormat("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date()).split("/").reverse().join("-")],
  ]);
  const printDiv = useRef();

  const [tipoReporte, setTipoReporte] = useState("");


  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const [searchFilters, { setAll: setSearchFilters, set: setSingleFilter  }] =
    useMap(initialSearchFilters);

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
  // const [totalTrxType, setTotalTrxType] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(false);
  const [summaryTrx, setSummaryTrx] = useState(null);

  const handleClose = useCallback(() => {
    setSelected(false);
    setSelectedInfo(false);
    setSummaryTrx(null);
  }, []);

  const [fetchTrxs] = useFetchDispatchDebounce({
    onSuccess: useCallback((res) => {
      setTrxTree(res?.obj?.results);
      setMontoTotal(res?.obj?.monto);
      setTotal_monto_type(res?.obj?.total_monto_type ?? 0);
      setTotalTransacciones(res?.obj?.total_trxs);
      // setTotalTrxType(res?.obj?.total_trxs_type ?? 0);
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
      const url =buscarReporteTrxTuLlave()
      const queries = new URLSearchParams(tempMap.entries()).toString();
      fetchTrxs(`${url}?${queries}`);
      setTimeout(() => {
        setLoading(true);
      }, 1000)
    }
  }, [fetchTrxs,setSingleFilter,searchFilters,roleInfo]
  );

  useEffect(() => { searchTrxs() }, [searchTrxs,roleInfo]);
  // useEffect(() => { getTicket() }, [selectedInfo, getTicket]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Recargas Tarjetas TuLlave</h1>
      <div className="w-full px-10 my-10">
        <Form grid>
          <Select
            id="trxState"
            name="trxState"
            label="Tipo de transacción"
            options={[
              // { value: "null", label: "" },
              { value: "true", label: "Carga" },
              { value: "false", label: "Anulación" },
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
            disabled={loading ? true : false}
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
    </Fragment>
  );
};

export default ReporteTuLLaveTrx;
