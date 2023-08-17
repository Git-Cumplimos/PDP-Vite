import React, { Fragment, useCallback, useState } from "react";
import { onChangeNumber } from "../../../utils/functions";
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
  const [deuda, setDeuda] = useState(0);
  const [paymentStatus] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState({});
  const [sobregiro, setSobregiro] = useState(0);
  const [diasMaxSobregiro, setDiasMaxSobregiro] = useState(0);
  const [canje, setCanje] = useState(0);
  const [baseCaja, setBaseCaja] = useState(0);
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
        sobregiro !== 0 && deuda !== 0 && canje !== 0
      ) {
        setShowModal(true);
        setSummary({
          "Id del comercio": idComercio,
          "Sobregiro": formatMoney.format(sobregiro),
          Deuda: formatMoney.format(deuda),
          "Cupo en canje": formatMoney.format(canje),
          "Base de caja": formatMoney.format(baseCaja),
          "Dias máximos de sobregiro": diasMaxSobregiro,
        });
      } else {
        notifyError(
          "Los campos sobregiro, deuda o cupo en canje no pueden ser cero"
        );
      }
    },
    [idComercio, deuda, canje, sobregiro, baseCaja, diasMaxSobregiro]
  );
  const crearComercio = useCallback(
    (e) => {
      const body = {
        pk_id_comercio: idComercio,
        sobregiro: sobregiro,
        deuda: deuda,
        cupo_en_canje: canje,
        base_caja: baseCaja ?? 0,
        dias_max_sobregiro: parseInt(diasMaxSobregiro) ?? 0,
        usuario: roleInfo.id_usuario ?? -1,
      };
      postCupoComercio(body)
        .then((res) => {
          if (!res?.status) {
            notifyError(res?.msg);
            return;
          }
          notify("Cupo creado exitosamente")
          navigate(`/cupo`)
        })
        .catch((r) => {
          console.error(r.message);
          notifyError("Error al crear cupo");
        });
    },
    [
      idComercio,
      deuda,
      baseCaja,
      diasMaxSobregiro,
      canje,
      sobregiro,
      roleInfo.id_usuario,
      navigate
    ]
  );

  const onMoneyChange = useCallback((e, valor) => {
    const setValues = {
      "sobregiro": () => setSobregiro(valor),
      "deuda": () => setDeuda(valor),
      "cupo_canje": () => setCanje(valor),
      "base_caja": () => setBaseCaja(valor),
    }
    setValues[e.target.name]?.()
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
          value={sobregiro ?? 0}
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
          value={deuda ?? 0}
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
          value={canje ?? 0}
          onInput={onMoneyChange}
          required
        />
        <MoneyInput
          id="base_caja"
          name="base_caja"
          label="Base de caja"
          autoComplete="off"
          maxLength={"14"}
          min={limitesMontos?.min}
          max={limitesMontos?.max}
          value={baseCaja ?? 0}
          onInput={onMoneyChange}
        />
        <Input
          id="dias_max_sobregiro"
          name="dias_max_sobregiro"
          label="Dias máximos sobregiro"
          type="tel"
          autoComplete="off"
          minLength={0}
          maxLength={2}
          defaultValue={0}
          onInput={(ev) => { setDiasMaxSobregiro(onChangeNumber(ev))}}
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
