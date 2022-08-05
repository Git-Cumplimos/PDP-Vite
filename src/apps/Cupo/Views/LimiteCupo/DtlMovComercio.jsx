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
import {
  getConsultaDtlMovCupo,
  PeticionDescargarPdf,
} from "../../utils/fetchCupo";

const DtlMovComercio = () => {
  const [dtlCupo, setDtlCupo] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [fechaini, setFechaini] = useState();
  const [fechaEnd, setFechaEnd] = useState();
  const [loadData, crearData] = useFetch(PeticionDescargarPdf);
  const [tipoAfectacion, setTipoAfectacion] = useState(null);
  const [tipoTransaccion, setTipoTransaccion] = useState(null);
  const { roleInfo } = useAuth();
  const [idComercio, setIdComercio] = useState(roleInfo?.id_comercio ?? null);

  const onChangeId = useCallback((ev) => {
    const formData = new FormData(ev.target.form);
    const idComer = (
      (formData.get("Id comercio") ?? "").match(/\d/g) ?? []
    ).join("");
    setIdComercio(idComer);
  }, []);

  useEffect(() => {
    if (roleInfo?.id_comercio) {
      setIdComercio(roleInfo?.id_comercio);
    }
  }, [roleInfo?.id_comercio]);

  useEffect(() => {
    getConsultaDtlMovCupo(
      idComercio,
      page,
      limit,
      fechaEnd,
      fechaini,
      tipoTransaccion,
      tipoAfectacion
    )
      .then((objUdusrio) => {
        setDtlCupo(objUdusrio);
      })
      .catch((reason) => {
        console.log(reason.message);
        notifyError("Error al cargar Datos ");
      });
  }, [
    idComercio,
    tipoTransaccion,
    tipoAfectacion,
    page,
    limit,
    fechaini,
    fechaEnd,
  ]);
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
  const onSubmitComercio = useCallback(
    (e) => {
      e.preventDefault();
      if (e.nativeEvent.submitter.name === "buscarComercio") {
        getConsultaDtlMovCupo(
          idComercio,
          page,
          limit,
          fechaEnd,
          fechaini,
          tipoTransaccion,
          tipoAfectacion
        )
          .then((objUdusrio) => {
            setDtlCupo(objUdusrio);
          })
          .catch((reason) => {
            console.log(reason.message);
            notifyError("Error al cargar Datos ");
          });
      }
    },
    [
      idComercio,
      page,
      limit,
      fechaEnd,
      fechaini,
      tipoAfectacion,
      tipoTransaccion,
    ]
  );
  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Detalle movimientos cupo comercios</h1>
      {!roleInfo?.id_comercio ? (
        <Form grid onSubmit={onSubmitComercio}>
          <Input
            id="idCliente"
            name="Id comercio"
            label="Id comercio"
            type="text"
            autoComplete="off"
            minLength={"0"}
            maxLength={"10"}
            value={idComercio ?? ""}
            onChange={onChangeId}
            required
          />
          <ButtonBar>
            <Button type={"submit"} name="buscarComercio">
              Buscar comercio
            </Button>
          </ButtonBar>
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
          dtlCupo?.results.map(
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
              valor_afectacion: formatMoney.format(valor_afectacion),
              fecha_afectacion,
              hora_afectacion,
              deuda_dsp_afectacion: formatMoney.format(deuda_dsp_afectacion),
              cupo_canje_dsp_afectacion: formatMoney.format(
                cupo_canje_dsp_afectacion
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
        <Form onChange={onChange} grid>
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
