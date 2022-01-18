import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import Modal from "../../../components/Base/Modal/Modal";
import { Fragment, useState, useCallback } from "react";

const Deposito = () => {
  const [showModal, setShowModal] = useState(false);
  const onSubmitDeposit = useCallback((e) => {
    e.preventDefault();
    setShowModal(true);
  });
  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Depositos Daviplata</h1>
      <Form grid>
        <Input
          id="numCliente"
          label="Número telefónico de cliente"
          autocomplete="off"
          required
        ></Input>
        <Input
          id="valor"
          label="Valor a depositar"
          autocomplete="off"
          required
        ></Input>
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Realizar deposito</Button>
        </ButtonBar>
      </Form>
    </Fragment>
  );
};

export default Deposito;
