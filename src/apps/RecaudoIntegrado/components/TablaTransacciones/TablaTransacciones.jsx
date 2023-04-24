import { useCallback, useEffect, useMemo, useState } from "react";

import Input from "../../../../components/Base/Input";
import Select from "../../../../components/Base/Select";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { notifyError } from "../../../../utils/notify";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import useMap from "../../../../hooks/useMap";
import useFetchDebounce from "../../../../hooks/useFetchDebounce";
import { makeDateFormatter } from "../../../../utils/functions";

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

  useFetchDebounce(
    useMemo(() => {
      const tempMap = new Map(searchFilters);

      tempMap.forEach((val, key, map) => {
        if (!val) {
          map.delete(key);
        }
      });
      if (
        !tempMap.has("fecha_inicio_inicio") ||
        !tempMap.has("fecha_inicio_fin")
      ) {
        tempMap.delete("fecha_inicio_inicio");
        tempMap.delete("fecha_inicio_fin");
      }

      const queries = new URLSearchParams(tempMap.entries()).toString();
      return { url: `${urlBackend}/searchtrx?${queries}`, options: {} };
    }, [searchFilters]),
    {
      onSuccess: useCallback((res) => {
        if (res?.obj?.results?.maxElems === 0) {
          notifyError("No se encontraron registros");
          return;
        }
        setCantidadPaginas(res?.obj?.results?.maxPages);
        setDatosTablaTrx(res?.obj?.results?.results);
      }, []),
      onError: useCallback((error) => {
        console.error(error);
        notifyError("Error al cargar Datos ");
      }, []),
    }
  );

  useEffect(() => {
    setSingleFilter("nombre_banco", (old) => banco ?? old);
  }, [banco, setSingleFilter]);

  return (
    <div className="w-full flex flex-col justify-center items-center my-8">
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
              status: inf.status_trx ? "Aprobado" : "Declinado",
              tipo_proceso: inf.is_trx_contingencia
                ? "Contingencia"
                : "En linea",
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
        <Select
          className="place-self-stretch"
          label="Tipo operación"
          name="name_tipo_transaccion"
          options={[
            "",
            "Consulta Liberacion Cupo",
            "Liberacion Cupo",
            "Reverso Liberacion Cupo",
          ].map((val) => ({ value: val, label: val }))}
        />
      </TableEnterprise>
    </div>
  );
};

export default TablaTransacciones;
