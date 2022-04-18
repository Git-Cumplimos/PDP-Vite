import React, { useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Modal from "../../../components/Base/Modal";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Fieldset from "../../../components/Base/Fieldset";

const ParametrizacionRecaudo = () => {
  const [showModal, setShowModal] = useState(false);
  const closeModal = () => {
    setShowModal(false);
  };
  return (
    <>
      <ButtonBar>
        <Button type="submit" onClick={() => setShowModal(true)}>
          Crear cuenta recaudo
        </Button>
      </ButtonBar>
      <Modal show={showModal} handleClose={closeModal}>
        <Form>
          <Input
            id="NombreAutorizador"
            name="Nombre de autorizador"
            label={"Nombre de autorizador"}
            type="text"
            autoComplete="off"
          />
          <Input
            id="convenio"
            name="convenio"
            label={"Convenio"}
            type="text"
            autoComplete="off"
          />
          <Fieldset legend={"Cuenta de recaudo"}>
            <Input label={"Cuenta"}></Input>
            <Input label={"Banco"}></Input>
            <Input label={"Descripción"}></Input>
            <Input label={"Tipo"}></Input>
          </Fieldset>
          <ButtonBar>
            <Button type="button" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit">Crear cuenta</Button>
          </ButtonBar>
        </Form>
      </Modal>
    </>
  );
};

export default ParametrizacionRecaudo;
