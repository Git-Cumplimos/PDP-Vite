import React, { Fragment, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import MoneyInput, { formatMoney } from "../../../components/Base/MoneyInput";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import { useAuth } from "../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../utils/notify";
import { postCupoComercio } from "../utils/fetchCupo";

const CrearCupo = () => {
  const [idComercio, setIdComercio] = useState(null);
  const [deuda, setDeuda] = useState(null);
  const [paymentStatus] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState({});
  const [sobregiro, setSobregiro] = useState(null);
  const [canje, setCanje] = useState(null);
  const limitesMontos = {
    max: 9999999999,
    min: 0,
  };
  const { roleInfo } = useAuth();
  const navigate = useNavigate();

  const onChangeId = useCallback((ev) => {
    const formData = new FormData(ev.target.form);
    const idComer = (
      (formData.get("Id comercio") ?? "").match(/\d/g) ?? []
    ).join("");
    setIdComercio(idComer);
  }, []);

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const onSubmitComercio = useCallback(
    (e) => {
      e.preventDefault();
      if (
        sobregiro !== null &&
        sobregiro !== "" &&
        deuda !== null &&
        deuda !== "" &&
        canje !== null &&
        canje !== ""
      ) {
        setShowModal(true);
        setSummary({
          "Id del comercio": idComercio,
          "Sobregiro": formatMoney.format(sobregiro),
          Deuda: formatMoney.format(deuda),
          "Cupo en canje": formatMoney.format(canje),
        });
      } else {
        notifyError(
          "Los campos sobregiro, deuda o cupo en canje no pueden estar vacíos"
        );
      }
    },
    [idComercio, deuda, canje, sobregiro]
  );
  const crearComercio = useCallback(
    (e) => {
      const body = {
        pk_id_comercio: idComercio,
        limite_cupo: sobregiro,
        deuda: deuda,
        cupo_en_canje: canje,
        usuario: roleInfo.id_usuario,
      };
      postCupoComercio(body)
        .then((res) => {
          if (!res?.status) {
            notifyError(res?.msg);
          }
          else notify("Cupo creado exitosamente");
          navigate(`/cupo`)
        })
        .catch((r) => {
          console.error(r.message);
          notifyError("Error al crear cupo");
        });
    },
    [idComercio, deuda, canje, sobregiro, roleInfo.id_usuario, navigate]
  );

  const onMoneyChange = useCallback((e, valor) => {
    if (e.target.name === "sobregiro") setSobregiro(valor);
    if (e.target.name === "deuda") setDeuda(valor);
    if (e.target.name === "cupo_canje") setCanje(valor);
  }, []);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Crear cupo Comercios</h1>
      <Form onSubmit={onSubmitComercio} grid>
        <Input
          id="Id comercio"
          name="Id comercio"
          label="Id comercio"
          type="text"
          autoComplete="off"
          value={idComercio ?? ""}
          // minLength={"1"}
          maxLength={"10"}
          onChange={onChangeId}
          required
        />
        <MoneyInput
          id="sobregiro"
          name="sobregiro"
          label="Sobregiro"
          autoComplete="off"
          maxLength={"14"}
          min={limitesMontos?.min}
          max={limitesMontos?.max}
          onInput={onMoneyChange}
          required
        />
        <MoneyInput
          id="deuda"
          name="deuda"
          label="Deuda"
          autoComplete="off"
          maxLength={"14"}
          min={limitesMontos?.min}
          max={limitesMontos?.max}
          onInput={onMoneyChange}
          required
        />
        <MoneyInput
          id="cupo_canje"
          name="cupo_canje"
          label="Cupo en canje"
          autoComplete="off"
          maxLength={"14"}
          min={limitesMontos?.min}
          max={limitesMontos?.max}
          onInput={onMoneyChange}
          required
        />

        <ButtonBar className={"lg  col-span-2"}>
          <Button type={"submit"}>Asignar cupo al comercio</Button>
        </ButtonBar>
      </Form>
      <Modal
        show={showModal}
        handleClose={paymentStatus ? () => {} : handleClose}
      >
        <PaymentSummary
          title="¿Está seguro de asignar el cupo al comercio?"
          subtitle="Resumen del comercio"
          summaryTrx={summary}
        >
          <ButtonBar>
            <Button type="submit" onClick={crearComercio}>
              Aceptar
            </Button>
            <Button onClick={handleClose}>Cancelar</Button>
          </ButtonBar>
        </PaymentSummary>
      </Modal>
    </Fragment>
  );
};

export default CrearCupo;
