import React, { Fragment, useCallback, useEffect, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import { notify, notifyError } from "../../../utils/notify";
import {
  getTipoMovimientosCupo,
  postTipoMovimientosCupo,
} from "../utils/fetchCupo";

const TipoMovimientoCupo = () => {
  const [limit, setLimit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(null);
  const [summary, setSummary] = useState({});
  const [pk_id_tipo_movimiento, setPk_id_tipo_movimiento] = useState(null);
  const [paymentStatus] = useState(false);
  const [nombreTipoMovimiento, setNombreTipoMovimiento] = useState(null);
  const [dataTipoMovimientoCupo, setDataTipoMovimientoCupo] = useState(null);
  const [nuevoTipoDeMovimiento, setNuevoTipoDeMovimiento] = useState(null);
  useEffect(() => {
    consultaTipoMovimienots(
      pk_id_tipo_movimiento,
      page,
      limit,
      nombreTipoMovimiento
    );
  }, [page, limit, pk_id_tipo_movimiento, nombreTipoMovimiento]);

  const consultaTipoMovimienots = (
    pk_id_tipo_movimiento,
    page,
    limit,
    nombreTipoMovimiento
  ) => {
    getTipoMovimientosCupo(
      pk_id_tipo_movimiento,
      page,
      limit,
      nombreTipoMovimiento
    )
      .then((objUdusrio) => {
        setDataTipoMovimientoCupo(objUdusrio);
      })
      .catch((reason) => {
        console.log(reason.message);
        notifyError("Error al cargar Datos ");
      });
  };
  const onChange = useCallback((ev) => {
    if (ev.target.name === "Id tipo de movimiento") {
      setPk_id_tipo_movimiento(ev.target.value);
    } else if (ev.target.name === "Tipo de moviento cupo") {
      setNombreTipoMovimiento(ev.target.value);
    } else if (ev.target.name === "Crear tipo de movimiento cupo") {
      setNuevoTipoDeMovimiento(ev.target.value.trimLeft());
    }
  }, []);
  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);
  const onSubmitCrearTipoMovimiento = useCallback(
    (e) => {
      const body = {
        nombre: nuevoTipoDeMovimiento,
      };
      postTipoMovimientosCupo(body)
        .then((res) => {
          if (!res?.status) {
            notifyError(res?.msg);
            return;
          }
          consultaTipoMovimienots(
            pk_id_tipo_movimiento,
            page,
            limit,
            nombreTipoMovimiento
          );
          notify("Creacion de movimiento exitosa");
          setNuevoTipoDeMovimiento("");
        })
        .catch((r) => {
          console.error(r.message);
          notifyError("Error al crear movimiento cupo");
        });
      setShowModal(false);
    },
    [
      nuevoTipoDeMovimiento,
      limit,
      page,
      nombreTipoMovimiento,
      pk_id_tipo_movimiento,
    ]
  );
  const onSubmitCrearMovimiento = useCallback(
    (e) => {
      e.preventDefault();
      setShowModal(true);
      setSummary({
        "Tipo de movimiento cupo": nuevoTipoDeMovimiento,
      });
    },
    [nuevoTipoDeMovimiento]
  );
  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Tipos de movimientos</h1>
      <Form onSubmit={onSubmitCrearMovimiento} onChange={onChange} grid>
        <Input
          id="Crear tipo de movimiento cupo"
          name="Crear tipo de movimiento cupo"
          label="Crear movimiento"
          type="text"
          autoComplete="off"
          maxLength="30"
          value={nuevoTipoDeMovimiento}
          onInput={() => {}}
          info="Maximo 30 caracteres"
          required
        />
        <ButtonBar>
          <Button type={"submit"}>Crear tipo de movimiento</Button>
        </ButtonBar>
      </Form>
      <TableEnterprise
        title="Tipo movimiento"
        headers={["Id del movimiento", "Tipo de movimiento"]}
        data={
          dataTipoMovimientoCupo?.results.map(
            ({ pk_id_tipo_movimiento, nombre }) => ({
              pk_id_tipo_movimiento,
              nombre,
            })
          ) ?? []
        }
        onSelectRow={(e, i) => {}}
        onSetPageData={(pagedata) => {
          setPage(pagedata.page);
          setLimit(pagedata.limit);
        }}
        maxPage={dataTipoMovimientoCupo?.maxPages}
      >
        <Form onChange={onChange} grid>
          <Input
            id="Id tipo de movimiento"
            name="Id tipo de movimiento"
            label="Id del movimiento"
            type="number"
            autoComplete="off"
            onInput={() => {}}
            required
          />
          <Input
            id="Tipo de movimiento cupo"
            name="Tipo de moviento cupo"
            label="Tipo de movimiento"
            type="text"
            autoComplete="off"
            onInput={() => {}}
            required
          />
        </Form>
      </TableEnterprise>
      <Modal
        show={showModal}
        handleClose={paymentStatus ? () => {} : handleClose}
      >
        <PaymentSummary
          title="¿Está seguro de crear este tipo de movimiento?"
          subtitle=""
          summaryTrx={summary}
        >
          <ButtonBar>
            <Button type="button" onClick={onSubmitCrearTipoMovimiento}>
              Aceptar
            </Button>
            <Button onClick={handleClose}>Cancelar</Button>
          </ButtonBar>
        </PaymentSummary>
      </Modal>
    </Fragment>
  );
};

export default TipoMovimientoCupo;
