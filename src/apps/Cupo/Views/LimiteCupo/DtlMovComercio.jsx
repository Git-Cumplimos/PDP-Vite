import React, { Fragment, useCallback, useEffect, useState } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import Select from "../../../../components/Base/Select";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { useAuth } from "../../../../hooks/AuthHooks";
import { useFetch } from "../../../../hooks/useFetch";
import { notifyError } from "../../../../utils/notify";
import { getConsultaDtlMovCupo } from "../../utils/fetchFunctions";
import {
  PeticionDescargarPdf,
} from "../../utils/fetchCupo";

import useFetchDispatchDebounce, { ErrorPDPFetch } from "../../../../hooks/useFetchDispatchDebounce";
import useMap from "../../../../hooks/useMap";

const initialSearchFilters = new Map([
  ["fk_id_comercio", ""],
  ["sortBy", "pk_id_dtl_mov"],
  ["sortDir", "DESC"],
  ["tipo_afectacion", null],
  ["fk_tipo_de_movimiento", null],
  ["date_end", null],
  ["date_ini", null],
  ["page", 1],
  ["limit", 10],
]);

const DtlMovComercio = () => {
  const [dtlCupo, setDtlCupo] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [fechaini, setFechaini] = useState(null);
  const [fechaEnd, setFechaEnd] = useState(null);
  const [loadData, crearData] = useFetch(PeticionDescargarPdf);
  const [tipoAfectacion, setTipoAfectacion] = useState(null);
  const [tipoTransaccion, setTipoTransaccion] = useState(null);
  const { roleInfo } = useAuth();
  const [idComercio, setIdComercio] = useState(null);
  const [nombreComercio, setNombreComercio] = useState(null);

  const [searchFilters, { setAll: setSearchFilters, set: setSingleFilter }] =
    useMap(initialSearchFilters);

  const [fetchTrxs] = useFetchDispatchDebounce({
    onSuccess: useCallback((res) => {
      setDtlCupo(res?.obj ?? {});
      setNombreComercio((res?.obj?.results ?? [{}])[0].nombre_comercio ?? "");
    }, []),
    onError: useCallback((error) => {
      setDtlCupo(null);
      if (error instanceof ErrorPDPFetch) {
        notifyError(error.message);
      }
      else if (!(error instanceof DOMException)) {
        notifyError("Error al cargar Datos ");
      }
    }, []),
  }, { delay: 2000 });

  const searchDetalleComercio = useCallback(() => {
    // if (!idComercio) return false

    setSingleFilter("page", (old) => page ?? old);
    setSingleFilter("limit", (old) => limit ?? old)
    setSingleFilter("fk_id_comercio", idComercio ?? "");
    if (tipoAfectacion) setSingleFilter("tipo_afectacion", tipoAfectacion ?? "");
    if (tipoTransaccion) setSingleFilter("fk_tipo_de_movimiento", tipoTransaccion ?? "")
    if ((fechaini && fechaEnd) && (fechaEnd >= fechaini)) {
      setSingleFilter("date_ini", fechaini ?? "")
      setSingleFilter("date_end", fechaEnd ?? "");
    };

    const tempMap = new Map(searchFilters);
    const url = getConsultaDtlMovCupo()
    tempMap.forEach((val, key, map) => {
      if (!val) {
        map.delete(key);
      }
    });
    const queries = new URLSearchParams(tempMap.entries()).toString();
    fetchTrxs(`${url}?${queries}`);
  },
    [
      page,
      limit,
      idComercio,
      tipoAfectacion,
      tipoTransaccion,
      fechaini,
      fechaEnd,
      searchFilters,
      setSingleFilter,
      fetchTrxs,
    ]
  );

  const onChangeId = useCallback((ev) => {
    const formData = new FormData(ev.target.form);
    const idComer = (
      (formData.get("Id comercio") ?? "").match(/\d/g) ?? []
    ).join("");
    setIdComercio(idComer);
    setNombreComercio("");
  }, []);

  useEffect(() => {
    setIdComercio(roleInfo?.id_comercio ?? "");
    // setNombreComercio(roleInfo?.["nombre comercio"] ?? null);
  }, [roleInfo]);

  useEffect(() => {
    searchDetalleComercio();
  }, [searchDetalleComercio]);

  const onChange = useCallback((ev) => {
    if (ev.target.name === "fecha_inico") {
      setFechaini(ev.target.value);
    } else if (ev.target.name === "fecha_final") {
      setFechaEnd(ev.target.value);
    }
  }, []);

  const onSubmitDownload = useCallback(
    (e) => {
      e.preventDefault();
      if (idComercio !== "") {
        if (fechaEnd !== null || fechaini !== null) {
          crearData(
            idComercio,
            fechaEnd,
            fechaini,
            tipoTransaccion,
            tipoAfectacion
          );
        }
      }
    },
    [idComercio, fechaEnd, fechaini, tipoTransaccion, tipoAfectacion, crearData]
  );
  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Detalle movimientos cupo comercios</h1>
      {!roleInfo?.id_comercio ? (
        <Form grid >
          <Input
            id="idCliente"
            name="Id comercio"
            label="Id comercio"
            type="text"
            autoComplete="off"
            minLength={"0"}
            maxLength={"10"}
            value={idComercio ?? ""}
            onChange={(ev) => onChangeId(ev)}
            required
          />
          {
            ( ![null,""].includes(nombreComercio) && ![null,""].includes(idComercio)) && (
              <Input
                id="nombre_comercio"
                name="Nombre comercio"
                label="Nombre comercio"
                type="text"
                value={nombreComercio ?? ""}
                autoComplete="off"
                disabled={true}
                required
              />
            )
          }
        </Form>
      ) : (
        ""
      )}
      <TableEnterprise
        title="Detalle movimientos cupo comercios"
        headers={[
          "Id detalle movimiento",
          "Tipo de movimiento",
          "Tipo de afectación",
          "Valor afectación",
          "Fecha afectación",
          "Hora afectación",
          "Deuda actual",
          "Cupo canje",
          "Usuario",
          "Id transacción",
          "Descripción afectación",
        ]}
        data={
          (dtlCupo?.results ?? []).map(
            ({
              pk_id_dtl_mov,
              tipo_movimiento,
              nombre,
              valor_afectacion,
              fecha_afectacion,
              hora_afectacion,
              deuda_dsp_afectacion,
              cupo_canje_dsp_afectacion,
              usuario,
              fk_id_trx,
              motivo_afectacion,
            }) => ({
              pk_id_dtl_mov,
              tipo_movimiento,
              nombre,
              valor_afectacion: formatMoney.format(valor_afectacion ?? 0),
              fecha_afectacion,
              hora_afectacion,
              deuda_dsp_afectacion: formatMoney.format(deuda_dsp_afectacion ?? 0),
              cupo_canje_dsp_afectacion: formatMoney.format(
                cupo_canje_dsp_afectacion ?? 0
              ),
              usuario,
              fk_id_trx,
              motivo_afectacion,
            })
          ) ?? []
        }
        onSetPageData={(pagedata) => {
          setPage(pagedata.page);
          setLimit(pagedata.limit);
        }}
        maxPage={dtlCupo?.maxPages}
      >
        <Form onChange={(ev) => onChange(ev)} grid>
          <Input
            id="fecha_inico"
            name="fecha_inico"
            label="Fecha inicio"
            type="datetime-local"
            autoComplete="off"
            required
          />
          <Input
            id="fecha_final"
            name="fecha_final"
            label="Fecha final"
            type="datetime-local"
            autoComplete="off"
            required
          />
          <Select
            label="Tipo de afectación"
            options={{
              "": null,
              "Cash-In": false,
              "Cash-Out": true,
            }}
            value={tipoAfectacion}
            /* required={true} */
            onChange={(e) => {
              setTipoAfectacion(e.target.value);
            }}
          />
          <Select
            label="Tipo de transacción"
            options={{
              "": null,
              Transacción: 1,
              Ajuste: 2,
              Asignación: 3,
            }}
            value={tipoTransaccion}
            /* required={true} */
            onChange={(e) => {
              setTipoTransaccion(e.target.value);
            }}
          />
        </Form>
      </TableEnterprise>
      <ButtonBar>
        <Button type={"submit"} disabled={loadData} onClick={onSubmitDownload}>
          Descargar reporte
        </Button>
      </ButtonBar>
    </Fragment>
  );
};

export default DtlMovComercio;
