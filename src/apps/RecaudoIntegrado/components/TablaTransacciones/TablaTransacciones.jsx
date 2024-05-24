import { useCallback, useEffect, useState } from "react";
import Input from "../../../../components/Base/Input";
import Select from "../../../../components/Base/Select";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import useFetchDispatchDebounce,{ErrorPDPFetch} from "../../../../hooks/useFetchDispatchDebounce";
import { notifyError } from "../../../../utils/notify";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import useMap from "../../../../hooks/useMap";
import { makeDateFormatter, onChangeNumber } from "../../../../utils/functions";


const urlBackend = `${process.env.REACT_APP_URL_RECAUDO_EMPRESARIAL}/servicio-contingencia-empresarial-pdp`;
// const urlBackend = `http://localhost:5000/servicio-contingencia-empresarial-pdp`;

const initialSearchFilters = new Map([
  ["fecha_inicio_inicio", ""],
  ["fecha_inicio_fin", ""],
  ["nombre_banco", ""],
  ["name_tipo_transaccion", ""],
  ["page", 1],
  ["limit", 10],
]);

const dateFormatter = makeDateFormatter(true);

const TablaTransacciones = ({ banco }) => {
  const [datosTablaTrx, setDatosTablaTrx] = useState([]);
  const [cantidadPaginas, setCantidadPaginas] = useState(0);

  const [searchFilters, { setAll: setSearchFilters, set: setSingleFilter }] =
    useMap(initialSearchFilters);

  const setPageData = useCallback(
    ({ page, limit }) =>
      setSearchFilters((old) => {
        if (page !== old.get("page") || limit !== old.get("limit")) {
          const tempMap = new Map(old);
          tempMap.set("page", page);
          tempMap.set("limit", limit);
          return tempMap;
        }
        return old;
      }),
    [setSearchFilters]
  );


  const [fetchTrxs] = useFetchDispatchDebounce({
    onSuccess: useCallback((res) => {
      if (res?.obj?.results?.maxElems === 0) {
        notifyError("No se encontraron registros");
        return;
      }
      setCantidadPaginas(res?.obj?.results?.maxPages);
      setDatosTablaTrx(res?.obj?.results?.results);
    }, []),
    onError: useCallback((error) => {
      if (error instanceof ErrorPDPFetch) {
        notifyError(error.message);
      }
      else if (!(error instanceof DOMException)) {
        notifyError("Error al cargar Datos ");
      }
    }, []),
  },{delay:2000});

  const searchTrxs = useCallback(() => {
    const tempMap = new Map(searchFilters);

    tempMap.forEach((val, key, map) => {
      if (!val) { map.delete(key); }
    });
    if ( !tempMap.has("fecha_inicio_inicio") ) { tempMap.delete("fecha_inicio_inicio") }
    if ( !tempMap.has("fecha_inicio_fin") ) { tempMap.delete("fecha_inicio_fin") }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(Object.fromEntries(tempMap))
    };
    // const queries = new URLSearchParams(tempMap.entries()).toString();
    fetchTrxs(`${urlBackend}/searchtrx`,options);
  }, [fetchTrxs, searchFilters]);

  useEffect(() => { searchTrxs(); }, [searchTrxs]);

  useEffect(() => {
    setSingleFilter("nombre_banco", (old) => banco ?? old);
  }, [banco, setSingleFilter]);

  return (
    <TableEnterprise
      title="Transacciones"
      maxPage={cantidadPaginas}
      headers={[
        "Id transacción",
        "Id comercio",
        "Operación",
        "Monto",
        "Fecha y hora",
        "Estado Trx",
        "Tipo de proceso",
      ]}
      data={
        datosTablaTrx?.map((inf, created) => {
          const tempDate = new Date(inf.fecha_trx);
          tempDate.setHours(tempDate.getHours() + 5);
          created = dateFormatter.format(tempDate);
          const money = formatMoney.format(inf.valor_trx);
          return {
            id_transaccion: inf.id_trx,
            id_comercio: inf?.id_comercio ?? null,
            operacion: inf.name_tipo_transaccion,
            monto: money,
            fecha: created,
            status: inf.status_trx ? "Aprobado" : "Declinado",
            tipo_proceso: inf.is_trx_contingencia ? "Contingencia" : "En línea",
          };
        }) ?? []
      }
      onSetPageData={setPageData}
      onChange={(ev) =>
        setSearchFilters((old) =>
          new Map(old).set(ev.target.name, ev.target.value)
        )
      }
    >
      <Input
        id="dateInit"
        label="Fecha inicial"
        name="fecha_inicio_inicio"
        type="date"
      />
      <Input
        id="dateEnd"
        label="Fecha final"
        name="fecha_inicio_fin"
        type="date"
      />
      <Input
        id="id_comercio"
        label="Id comercio"
        name="id_comercio"
        type="tel"
        maxLength={"15"}
        onInput={(ev) => { ev.target.value = onChangeNumber(ev); }}
      />
      <Input
        id="id_transacción"
        label="Id transacción"
        name="id_trx"
        type="tel"
        maxLength={"15"}
        onInput={(ev) => { ev.target.value = onChangeNumber(ev); }}
      />
      <Select
        className="place-self-stretch"
        label="Tipo operación"
        name="name_tipo_transaccion"
        options={[
          "",
          "Consulta recaudo",
          "Notificación recaudo",
          "Reverso notificación recaudo",
        ].map((val) => ({ value: val, label: val }))}
      />
      <Select
        className="place-self-stretch"
        label="Tipo de proceso"
        name="is_trx_contingencia"
        options={[
          "",
          "En línea",
          "Contingencia",
        ].map((val) => ({ value: val === "En línea" ? "false" : "true", label: val }))}
      />
    </TableEnterprise>
  );
};

export default TablaTransacciones;
