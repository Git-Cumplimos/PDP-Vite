import { Fragment, useCallback, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import useQuery from "../../../hooks/useQuery";
import FlujoRecaudo from "../components/FlujoRecaudo/FlujoRecaudo";

const initFounds = [
  {
    nombre_referencia: "Numero de contrato",
    name: "referencias",
    minLength: 10,
    maxLength: 10,
    defaultValue: "1242432477",
    required: true,
  },
  {
    nombre_referencia: "Documento",
    name: "referencias",
    minLength: 10,
    maxLength: 10,
    defaultValue: "1080100200",
    required: true,
  },
  {
    nombre_referencia: "Valor",
    name: "valor",
    minLength: 4,
    maxLength: 8,
    defaultValue: "5000",
  },
];

const RecaudoCodigo = () => {
  const [{ barcode }, setQuery] = useQuery();
  const [foundRefs, setFoundRefs] = useState(null);

  const onSubmitBarcode = useCallback(
    (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      setFoundRefs(initFounds);
      setQuery({ barcode: formData.get("barcode"), id_convenio: 5 }, { replace: true });
    },
    [setQuery]
  );

  return (
    <Fragment>
      <Form onSubmit={onSubmitBarcode} grid>
        <Input
          id={"barcode"}
          name={"barcode"}
          label={"Codigo de barras"}
          type={"search"}
          autoComplete="off"
          defaultValue={barcode}
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Buscar</Button>
        </ButtonBar>
      </Form>
      <FlujoRecaudo foundRefs={foundRefs} />
    </Fragment>
  );
};

export default RecaudoCodigo;
