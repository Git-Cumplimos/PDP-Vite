import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import Modal from "../../../components/Base/Modal/Modal";
import useQuery from "../../../hooks/useQuery";
import { Fragment, useState, useCallback } from "react";

const formatMoney = Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
});

const Deposito = () => {
  const [showModal, setShowModal] = useState(false);
  const [{ phone, valor }, setQuery] = useQuery();

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const onSubmitDeposit = useCallback(
    (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const phone = formData.get("numCliente");
      const valor = formData.get("valor");
      setQuery({ phone, valor }, { replace: true });
      setShowModal(true);
    },
    [setQuery]
  );

  const onChange = useCallback(
    (ev) => {
      const formData = new FormData(ev.target.form);
      const phone = (
        (formData.get("numCliente") ?? "").match(/\d/g) ?? []
      ).join("");
      const valor = (
        (formData.get("valor") ?? "").match(/(\d+\.?\d*|\.\d+)/g) ?? []
      ).join("");
      setQuery({ phone, valor }, { replace: true });
    },
    [setQuery]
  );

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Depositos Daviplata</h1>
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
          id="valor"
          name="valor"
          label="Valor a depositar"
          type="number"
          autoComplete="off"
          min={"5000"}
          max={"9999999.99"}
          value={valor}
          onChange={() => {}}
          info={`${formatMoney.format(valor ?? 0)}`}
          required
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Realizar deposito</Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={handleClose}>
        Seguro?
      </Modal>
    </Fragment>
  );
};

export default Deposito;
