import React, { Fragment, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import MoneyInput, { formatMoney } from "../../../components/Base/MoneyInput";
import Select from "../../../components/Base/Select";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import { useAuth } from "../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../utils/notify";
import { postCupoComercio, postDtlCambioLimiteCanje } from "../utils/fetchCupo";

const CrearCupo = () => {
  const [idComercio, setIdComercio] = useState(null);
  const [deuda, setDeuda] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState({});
  const [limite, setLimite] = useState(null);
  const [canje, setCanje] = useState(null);
  const { roleInfo } = useAuth();
  const onChange = useCallback((ev) => {
    if (ev.target.name === "Id comercio") {
      setIdComercio(ev.target.value);
    }
  }, []);
  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);
  const onSubmitComercio = useCallback(
    (e) => {
      e.preventDefault();
      setShowModal(true);
      setSummary({
        pk_id_comercio: idComercio,
        limite_cupo: formatMoney.format(limite),
        deuda: formatMoney.format(deuda),
        cupo_en_canje: formatMoney.format(canje),
      });
    },
    [idComercio, deuda, canje, limite]
  );
  const crearComercio = useCallback(
    (e) => {
      const body = {
        pk_id_comercio: idComercio,
        limite_cupo: limite,
        deuda: deuda,
        cupo_en_canje: canje,
        usuario: roleInfo.id_usuario,
      };
      postCupoComercio(body)
        .then((res) => {
          if (!res?.status) {
            notifyError("Error al crear cupo");
            return;
          }
          notify("Cupo creado exitosamente");
        })
        .catch((r) => {
          console.error(r.message);
          notifyError("Error al crear cupo");
        });
    },
    [idComercio, deuda, canje, limite]
  );
  const onMoneyChangeDeuda = useCallback((e, valor) => {
    setDeuda(valor);
  }, []);
  const onMoneyChangeLimite = useCallback((e, valor) => {
    setLimite(valor);
  }, []);
  const onMoneyChangeCanje = useCallback((e, valor) => {
    setCanje(valor);
  }, []);
  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Crear cupo Comercios</h1>
      <Form onSubmit={onSubmitComercio} onChange={onChange} grid>
        <Input
          id="Id comercio"
          name="Id comercio"
          label="Id comercio"
          type="number"
          autoComplete="off"
          // minLength={"10"}
          // maxLength={"10"}
          // value={""}
          onInput={() => {}}
          required
        />
        <MoneyInput
          id="cupo_limite"
          name="cupo_limite"
          label="Limite de cupo"
          autoComplete="off"
          onInput={onMoneyChangeLimite}
          required
        />
        <MoneyInput
          id="deuda"
          name="deuda"
          label="Deuda"
          autoComplete="off"
          onInput={onMoneyChangeDeuda}
          required
        />
        <MoneyInput
          id="cupo_canje"
          name="cupo_canje"
          label="Cupo en canje"
          autoComplete="off"
          onInput={onMoneyChangeCanje}
          required
        />

        <ButtonBar className={"lg  col-span-2"}>
          <Button type={"submit"}>Asignar límite cupo</Button>
        </ButtonBar>
        <Modal
          show={showModal}
          handleClose={paymentStatus ? handleClose : () => {}}
        >
          <PaymentSummary summaryTrx={summary}>
            <ButtonBar>
              <Link to="/cupo">
                <Button type="button" onClick={crearComercio}>
                  Aceptar
                </Button>
              </Link>
              <Button onClick={handleClose}>Cancelar</Button>
            </ButtonBar>
          </PaymentSummary>
        </Modal>
      </Form>
    </Fragment>
  );
};

export default CrearCupo;
