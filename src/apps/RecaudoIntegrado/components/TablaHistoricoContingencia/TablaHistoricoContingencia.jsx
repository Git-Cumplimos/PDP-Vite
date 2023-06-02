import React, { useEffect, useState, useCallback, useMemo } from "react";
import Input from "../../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { notifyError } from "../../../../utils/notify";
import useMap from "../../../../hooks/useMap";
import useFetchDebounce from "../../../../hooks/useFetchDebounce";
import useFetchDispatchDebounce from "../../../../hooks/useFetchDispatchDebounce";
import { makeDateFormatter } from "../../../../utils/functions";

const urlBackend = `${process.env.REACT_APP_URL_RECAUDO_EMPRESARIAL}/servicio-contingencia-empresarial-pdp`;
// const urlBackend = `http://localhost:5000/servicio-contingencia-empresarial-pdp`;

const initialSearchFilters = new Map([
  ["fecha_inicio_inicio", ""],
  ["fecha_inicio_fin", ""],
  ["identificador_banco", ""],
  ["name_tipo_transaccion", ""],
  ["page", 1],
  ["limit", 10],
]);

const dateFormatter = makeDateFormatter(true);

const TablaHistoricoContingencia = ({ banco }) => {
  const [datosTablaContingencia, setDatosTablaContingencia] = useState([]);
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

  const [fetchExcel] = useFetchDispatchDebounce({
    onSuccess: useCallback((res) => window.open(res?.url, "_self"), []),
    onError: useCallback((error) => {
      console.error(error);
      notifyError("Error al cargar Datos ");
    }, []),
  });

  const downloadExcel = useCallback(
    (data) => {
      fetchExcel(`${urlBackend}/descargarexcel`, {
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
      if (
        !tempMap.has("fecha_inicio_inicio") ||
        !tempMap.has("fecha_inicio_fin")
      ) {
        tempMap.delete("fecha_inicio_inicio");
        tempMap.delete("fecha_inicio_fin");
      }

      const queries = new URLSearchParams(tempMap.entries()).toString();
      return { url: `${urlBackend}/search?${queries}`, options: {} };
    }, [searchFilters]),
    {
      onSuccess: useCallback((res) => {
        if (res?.obj?.results?.maxElems === 0) {
          notifyError("No se encontraron registros");
          return;
        }
        setCantidadPaginas(res?.obj?.results?.maxPages);
        setDatosTablaContingencia(res?.obj?.results?.results);
      }, []),
      onError: useCallback((error) => {
        console.error(error);
        notifyError("Error al cargar Datos ");
      }, []),
    }
  );

  useEffect(() => {
    setSingleFilter("identificador_banco", (old) => banco ?? old);
  }, [banco, setSingleFilter]);

  return (
    <TableEnterprise
      title="Histórico de contingencia"
      maxPage={cantidadPaginas}
      headers={[
        "Banco",
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
            identificador_banco: inf.identificador_banco
              .toLowerCase()
              .split(" ")
              .map((word) => word.replace(word[0], word[0].toUpperCase()))
              .join(" "),
            cantidad_registros: inf.cantidad_registros,
            cantidad_trx_exitos: inf.cantidad_trx_exitosas,
            cantidad_trx_fallidas: inf.cantidad_trx_fallidas,
            fecha_carga_archivo: created,
            nombre_archivo: inf.nombre_archivo,
          };
        }) ?? []
      }
      onSelectRow={(_, i) =>
        downloadExcel({
          pk_contingencia_recaudo_bancos:datosTablaContingencia[i].pk_contingencia_recaudo_bancos,
          nombre_banco: datosTablaContingencia[i].identificador_banco,
          // fecha_carga: datosTablaContingencia[i].fecha_carga_archivo,
          // total_registros: datosTablaContingencia[i].cantidad_registros,
          // registros_procesados: datosTablaContingencia[i].cantidad_trx_exitosas,
          // registros_fallidos: datosTablaContingencia[i].cantidad_trx_fallidas,
          // respuesta_trx_exitosas: JSON.stringify(
          //   datosTablaContingencia[i].respuuestas_trx
          // ),
          // respuesta_trx_fallidas: JSON.stringify(
          //   datosTablaContingencia[i].respuestas_trx_fallidas
          // ),
        })
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
    </TableEnterprise>
  );
};

export default TablaHistoricoContingencia;
