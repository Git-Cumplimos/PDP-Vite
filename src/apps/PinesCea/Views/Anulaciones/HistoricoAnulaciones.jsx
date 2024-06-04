import React, { useEffect, useState, useCallback, useMemo } from "react";
import Input from "../../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { notifyError } from "../../../../utils/notify";
import useMap from "../../../../hooks/useMap";
import useFetchDebounce from "../../../../hooks/useFetchDebounce";
import useFetchDispatchDebounce from "../../../../hooks/useFetchDispatchDebounce";
import { makeDateFormatter } from "../../../../utils/functions";

const urlBackend = process.env.REACT_APP_URL_PinesVus;
const urlBackend2 = process.env.REACT_APP_URL_PinesVus;

const initialSearchFilters = new Map([
  ["fecha_ini", ""],
  ["fecha_fin", ""],
  ["name_tipo_transaccion", ""],
  ["page", 1],
  ["limit", 10],
]);

const dateFormatter = makeDateFormatter(true);

const HistoricoAnulaciones = () => {
  const [datosTablaContingencia, setDatosTablaContingencia] = useState([]);
  const [cantidadPaginas, setCantidadPaginas] = useState(0);

  const [searchFilters, { setAll: setSearchFilters}] =
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

  const [fetchExcel] = useFetchDispatchDebounce({
    onSuccess: useCallback((res) => window.open(res?.obj?.url, "_self"), []),
    onError: useCallback((error) => {
      console.error(error);
      notifyError("Error al cargar Datos ");
    }, []),
  });

  const downloadExcel = useCallback(
    (data) => {
      fetchExcel(`${urlBackend2}/generarExcelHistorico`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    [fetchExcel]
  );


  useFetchDebounce(
    useMemo(() => {
      const tempMap = new Map(searchFilters);

      tempMap.forEach((val, key, map) => {
        if (!val) {
          map.delete(key);
        }
      });
      tempMap.set("nombre_archivo", "nulacionescea.csv")
      if (
        !tempMap.has("fecha_ini") ||
        !tempMap.has("fecha_fin")
      ) {
        tempMap.delete("fecha_ini");
        tempMap.delete("fecha_fin");
      }

      const queries = new URLSearchParams(tempMap.entries()).toString();
      return { url: `${urlBackend}/consultarAnulaciones?${queries}`, options: {} };
    }, [searchFilters]),
    {
      onSuccess: useCallback((res) => {
        if (res?.obj?.results?.maxElems === 0) {
          notifyError("No se encontraron registros");
          return;
        }
        setCantidadPaginas(res?.obj?.maxPages);
        setDatosTablaContingencia(res?.obj?.results);
      }, []),
      onError: useCallback((error) => {
        console.error(error);
        notifyError("Error al cargar Datos ");
      }, []),
    }
  );

//   useEffect(() => {
//     setSingleFilter("identificador_banco", (old) => banco ?? old);
//   }, [banco, setSingleFilter]);

  return (
    <TableEnterprise
      title="Histórico de contingencia"
      maxPage={cantidadPaginas}
      headers={[
        "Cantidad de registros del archivo",
        "Cantidad de registros procesados exitosamente",
        "Cantidad de registros fallidos",
        "Fecha y hora de la ejecución",
        "Nombre del archivo",
      ]}
      data={
        datosTablaContingencia?.map((inf, created) => {
          const tempDate = new Date(inf.fecha_carga_archivo);
          tempDate.setHours(tempDate.getHours() + 5);
          created = dateFormatter.format(tempDate);
          return {
            cantidad_registros: inf.cantidad_registros,
            cantidad_trx_exitos: inf.cantidad_trx_exitosas,
            cantidad_trx_fallidas: inf.cantidad_trx_fallidas,
            fecha_carga_archivo: created,
            nombre_archivo: inf.nombre_archivo,
          };
        }) ?? []
      }
      onSelectRow={(_, i) =>{
        console.log(datosTablaContingencia[i].pk_estado_cargue_anulaciones)
        downloadExcel({
            pk_estado_cargue_anulaciones:datosTablaContingencia[i].pk_estado_cargue_anulaciones,
        })}
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
        name="fecha_ini"
        type="date"
      />
      <Input
        id="dateEnd"
        label="Fecha final"
        name="fecha_fin"
        type="date"
      />
    </TableEnterprise>
  );
};

export default HistoricoAnulaciones;
