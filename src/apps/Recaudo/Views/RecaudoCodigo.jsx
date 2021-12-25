import { Fragment, useCallback, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import FlujoRecaudo from "../components/FlujoRecaudo/FlujoRecaudo";

const initFounds = [
  ["Numero de contrato", "12424324"],
  ["Documento", "1080100200"],
  ["Telefono", "3002004530"],
];

const initOpts = {
  pago_parcial: true,
  pago_vencido: false,
};

const RecaudoCodigo = () => {
  const [opts, setOpts] = useState(null);
  const [foundRefs, setFoundRefs] = useState(null);

  const onSubmitBarcode = useCallback((e) => {
    e.preventDefault();
    setFoundRefs(initFounds);
    setOpts(initOpts);
  }, []);

  return (
    <Fragment>
      <Form onSubmit={onSubmitBarcode} grid>
        <Input
          id={"barcode"}
          name={"barcode"}
          label={"Codigo de barras"}
          type={"search"}
          autocomplete="off"
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Buscar</Button>
        </ButtonBar>
      </Form>
      <FlujoRecaudo opts={opts} foundRefs={foundRefs} />
    </Fragment>
  );
};

export default RecaudoCodigo;
