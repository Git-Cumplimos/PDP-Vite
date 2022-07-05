import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Select from "../../../../components/Base/Select";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { notifyError } from "../../../../utils/notify";
import { getConsultaDtlMovCupo } from "../../utils/fetchCupo";

const DtlMovComercio = () => {
  const [dtlCupo, setDtlCupo] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [fechaini, setFechaini] = useState();
  const [fechaEnd, setFechaEnd] = useState();
  const [tipoAfectacion, setTipoAfectacion] = useState(null);
  const [tipoTransaccion, setTipoTransaccion] = useState(null);
  let { id_comercio } = useParams();
  useEffect(() => {
    getConsultaDtlMovCupo(
      id_comercio,
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
    id_comercio,
    page,
    limit,
    fechaEnd,
    fechaini,
    tipoAfectacion,
    tipoTransaccion,
  ]);

  const onChange = useCallback((ev) => {
    if (ev.target.name === "fecha_inico") {
      setFechaini(ev.target.value);
    } else if (ev.target.name === "fecha_final") {
      setFechaEnd(ev.target.value);
    }
  }, []);
  const onSubmitDeposit = useCallback((e) => {
    e.preventDefault();
  }, []);
  return (
    <div>
      <Fragment>
        <h1 className="text-3xl mt-6">Detalle movimineto cupo comercio</h1>
        {/* <Form onSubmit={onSubmitDeposit} onChange={onChange} grid>
          <Input
            id="fecha_inico"
            name="fecha_inico"
            label="Fecha inico"
            type="date"
            autoComplete="off"
            // minLength={"10"}
            // maxLength={"10"}
            // value={""}
            onInput={() => {}}
            required
          />
          <Input
            id="fecha_final"
            name="fecha_final"
            label="Fecha _final"
            type="date"
            autoComplete="off"
            // minLength={"10"}
            // maxLength={"10"}
            // value={""}
            onInput={() => {}}
            required
          />
        </Form> */}

        <TableEnterprise
          title="Detalle movimientos cupo Comercios"
          headers={[
            "id detalle_mov",
            "Id comercio",
            "Tipo de movimiento",
            "Tipo de afectacion",
            "Valor afectación",
            "Fecha afectación",
            "Hora afectación",
            "Cupo antes de afectación",
            "Cupo despues de afectación",
            "usuario",
            "Id transaccion",
          ]}
          data={
            dtlCupo?.results.map(
              ({
                pk_id_dtl_mov,
                fk_id_comercio,
                tipo_movimiento,
                nombre,
                valor_afectacion,
                fecha_afectacion,
                hora_afectacion,
                cupo_antes_afectacion,
                cupo_dsp_afectacion,
                usuario,
                fk_id_trx,
              }) => ({
                pk_id_dtl_mov,
                fk_id_comercio,
                tipo_movimiento,
                nombre,
                valor_afectacion,
                fecha_afectacion,
                hora_afectacion,
                cupo_antes_afectacion,
                cupo_dsp_afectacion,
                usuario,
                fk_id_trx,
              })
            ) ?? []
          }
          // onSelectRow={(e, i) => {
          //     navegateValid(
          //       `/cupo/cupo-comercio/detalles-cupo/${cupoComer?.results[i].pk_id_comercio}`
          //     );
          //     console.log(e, cupoComer?.results[i]);
          //   }}
          onSetPageData={(pagedata) => {
            setPage(pagedata.page);
            setLimit(pagedata.limit);
          }}
          maxPage={dtlCupo?.maxPages}
        >
          <Form onSubmit={onSubmitDeposit} onChange={onChange} grid>
            <Input
              id="fecha_inico"
              name="fecha_inico"
              label="Fecha inico"
              type="datetime-local"
              autoComplete="off"
              // minLength={"10"}
              // maxLength={"10"}
              // value={""}
              // onInput={() => {}}
              required
            />
            <Input
              id="fecha_final"
              name="fecha_final"
              label="Fecha final"
              type="datetime-local"
              autoComplete="off"
              // minLength={"10"}
              // maxLength={"10"}
              // value={""}
              // onInput={() => {}}
              required
            />
            <Select
              label="Tipo de afectación"
              options={{
                "": null,
                "Cash-In": true,
                "Cash-Out": false,
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
      </Fragment>
    </div>
  );
};

export default DtlMovComercio;
