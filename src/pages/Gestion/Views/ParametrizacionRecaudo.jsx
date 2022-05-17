import React, { useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Modal from "../../../components/Base/Modal";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Select from "../../../components/Base/Select";
import Fieldset from "../../../components/Base/Fieldset";
import TableEnterprise from "../../../components/Base/TableEnterprise";

const ParametrizacionRecaudo = () => {
  const [showModal, setShowModal] = useState(false);
  const closeModal = () => {
    setShowModal(false);
  };
  const [type, setType] = useState("");
  return (
    <>
      <ButtonBar>
        <Button type="submit" onClick={() => setShowModal(true)}>
          Crear cuenta
        </Button>
      </ButtonBar>
      <TableEnterprise
        title="Bancos/Transportadoras"
        headers={["Id", "Compañia"]}
      >
        <Input
          id="convenio"
          name="convenio"
          label={"Compañia"}
          type="text"
          autoComplete="off"
        />
      </TableEnterprise>
      <Modal show={showModal} handleClose={closeModal}>
        <Form>
          <Select
            id="searchByType"
            name="tipoComp"
            label="Tipo"
            options={[
              { value: 0, label: "" },
              { value: 1, label: "Transportadora" },
              { value: 2, label: "Bancos" },
            ]}
            onChange={(e) => {
              setType(e.target.value);
            }}
          />
          {type === "1" ? (
            <Fieldset legend={"Registrar transportadora"}>
              <Input label={"Nombre transportadora"}></Input>
            </Fieldset>
          ) : type === "2" ? (
            <Fieldset legend={"Cuenta de recaudo"}>
              <Input label={"Número cuenta"}></Input>
              <Input label={"Banco"}></Input>
              <Select
                id="searchByType"
                name="tipoComp"
                label="Tipo"
                options={[
                  { value: 0, label: "" },
                  { value: 1, label: "Cuenta corriente" },
                  { value: 2, label: "Cuenta Ahorros" },
                ]}
              />
            </Fieldset>
          ) : (
            <></>
          )}
          <ButtonBar>
            <Button type="button" onClick={closeModal}>
              Cancelar
            </Button>
            {type === "2" && (
              <Button type="button" onClick={closeModal}>
                Agregar cuenta
              </Button>
            )}
            <Button type="submit">Crear cuenta</Button>
          </ButtonBar>
        </Form>
      </Modal>
    </>
  );
};

export default ParametrizacionRecaudo;
