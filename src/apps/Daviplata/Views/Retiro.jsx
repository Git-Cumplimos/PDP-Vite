import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import { Fragment, useCallback, useState } from "react";
import Modal from "../../../components/Base/Modal/Modal";
import useQuery from "../../../hooks/useQuery";

const formatMoney = Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
});

const Retiro = () => {
  const [showModal, setShowModal] = useState(false);
  const [{ phone, valor, otp }, setQuery] = useQuery();

  const handleClose = useCallback(() => {
    setShowModal(false)
  }, []);

  const onSubmitDeposit = useCallback((e) => {
    e.preventDefault();
    setShowModal(true);
  }, []);

  const onChange = useCallback(
    (ev) => {
      const formData = new FormData(ev.target.form);
      const phone = (
        (formData.get("numCliente") ?? "").match(/\d/g) ?? []
      ).join("");
      const valor = (
        (formData.get("valor") ?? "").match(/(\d+\.?\d*|\.\d+)/g) ?? []
        ).join("");
      const otp = (
        (formData.get("OTP") ?? "").match(/\d/g) ?? []
      ).join("");
      setQuery({ phone, valor, otp }, { replace: true });
    },
    [setQuery]
  );

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Retiros Daviplata</h1>
      <Form onSubmit={onSubmitDeposit} onChange={onChange} grid>
      <Input
          id="numCliente"
          name="numCliente"
          label="Número telefónico de cliente"
          type="text"
          autoComplete="off"
          minLength={"10"}
          maxLength={"10"}
          value={phone}
          onChange={() => {}}
          required
        />
        <Input
          id="OTP"
          name="OTP"
          label="Token de retiro"
          type="text"
          minLength="6"
          maxLength="6"
          autoComplete="off"
          value={otp}
          onChange={() => {}}
          required
        />
        <Input
          id="valor"
          name="valor"
          label="Valor a depositar"
          type="number"
          step="any"
          autoComplete="off"
          min={"5000"}
          max={"9999999.99"}
          value={valor}
          onChange={() => {}}
          info={`${formatMoney.format(valor ?? 0)}`}
          required
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Realizar retiro</Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={handleClose}>
        Seguro?
      </Modal>
    </Fragment>
  );
};

export default Retiro;
