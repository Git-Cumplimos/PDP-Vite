import { Fragment, useCallback, useMemo, useState, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { notifyError, notifyPending } from "../../../../utils/notify";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Button from "../../../../components/Base/Button";
import BarcodeReader from "../../../../components/Base/BarcodeReader";


const RecaudoBarras = () => {
  const formRef = useRef(null);
  const navigate = useNavigate();

  const searchCodigo=({codigo_barras})=>{
    navigate(
      `/recaudo-directo/recaudo/${codigo_barras}`
    );
  }

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Consulta recaudo código de barras</h1>
      <Form
        onSubmit={(ev) => {
          ev.preventDefault();
          const formData = new FormData(ev.target);
          searchCodigo(Object.fromEntries(formData));
        }}
        formDir="col"
        ref={formRef}
      >
        <BarcodeReader
        onSearchCodigo={(codigo) => searchCodigo({ codigo_barras: codigo })}
        />
        <ButtonBar className="lg:col-span-2">
          <Button type="reset" >
            Volver a ingresar código de barras
          </Button>
        </ButtonBar>
      </Form>
    </Fragment>
  )
}

export default RecaudoBarras