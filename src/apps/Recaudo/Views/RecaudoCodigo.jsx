import { Fragment, useCallback } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import BarcodeReader from "../../../components/Base/BarcodeReader";
import { useNavigate } from "react-router-dom";

const RecaudoCodigo = () => {
  const navigate = useNavigate();

  const navigateRecaudo = useCallback(
    ({ codigo_barras }) => {
      const urlParams = new URLSearchParams()
      urlParams.set("codigo", JSON.stringify(codigo_barras))
      navigate(`/recaudo/trx?${urlParams.toString()}`)
    },
    [navigate]
  );

  return (
    <Fragment>
      <Form
        onSubmit={(ev) => {
          ev.preventDefault();
          const formData = new FormData(ev.target);
          navigateRecaudo(Object.fromEntries(formData));
        }}
        formDir="col"
      >
        <BarcodeReader
          onSearchCodigo={(codigo) => navigateRecaudo({ codigo_barras: codigo })}
        />
        <ButtonBar className="lg:col-span-2">
          <Button type="reset">Volver a ingresar código de barras</Button>
        </ButtonBar>
      </Form>
    </Fragment>
  );
};

export default RecaudoCodigo;
