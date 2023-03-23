import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { notifyError, notifyPending } from "../../../../utils/notify";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Button from "../../../../components/Base/Button";
import BarcodeReader from "../../../../components/Base/BarcodeReader";

const RecaudoBarras = () => {
  const navigate = useNavigate();

  const searchCodigo = ({ codigo_barras }) => {
    notifyError("Lectura de barras en desarrollo")
    // navigate(`/recaudo-directo/recaudo/${codigo_barras}`);
  };

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Consulta recaudo código de barras</h1>
      <Form formDir="col">
        <BarcodeReader
          onSearchCodigo={(codigo) => searchCodigo({ codigo_barras: codigo })}
        />
        <ButtonBar className="lg:col-span-2">
          <Button type="reset">Volver a ingresar código de barras</Button>
        </ButtonBar>
      </Form>
    </Fragment>
  );
};

export default RecaudoBarras;
