import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import { Fragment } from "react";

const Retiro = () => {
  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Retiros Daviplata</h1>
      <Form grid>
        <Input
          id="numCliente"
          label="Número telefónico de cliente"
          autocomplete="off"
          required
        ></Input>
        <Input
          id="token"
          label="Token de retiro"
          autocomplete="off"
          required
        ></Input>
        <Input
          id="valor"
          label="Valor a retirar"
          autocomplete="off"
          required
        ></Input>
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Realizar retiro</Button>
        </ButtonBar>
      </Form>
    </Fragment>
  );
};

export default Retiro;
