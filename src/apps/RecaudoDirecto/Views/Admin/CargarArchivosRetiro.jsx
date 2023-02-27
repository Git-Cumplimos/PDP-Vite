import { Fragment } from "react";
// import { Navigate, useNavigate } from "react-router-dom";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Button from "../../../../components/Base/Button";
// import BarcodeReader from "../../../../components/Base/BarcodeReader";

const CargarArchivosRetiro = () => {
  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Cargar archivos de Retiro</h1>
      <Form onSubmit={(e) => { e.preventDefault();console.log(e) }}>
        <Input
          // label='Seleccionar Archivo'
          type='file'
          autoComplete='off'
        />
        <ButtonBar>
          <Button type="submit">Cargar Archivo</Button>
        </ButtonBar>
      </Form>
    </Fragment>
  )
}

export default CargarArchivosRetiro