import { Fragment } from "react";
// import { Navigate, useNavigate } from "react-router-dom";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Button from "../../../../components/Base/Button";

const DescargarReporteRecaudo = () => {
  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Descargar reporte de recaudo</h1>
      <Form onSubmit={(e) => { e.preventDefault(); console.log(e) }} >
        <Input
          id={"fecha"}
          label={"Fecha inicial"}
          name={"fecha"}
          type="date"
          autoComplete="off"
          required
        />
        <Input
          id={"fecha"}
          label={"Fecha final"}
          name={"fecha"}
          type="date"
          autoComplete="off"
          required
        />
        {/* <Input
          id={"NIT"}
          label={"Nit"}
          name={"nit"}
          type="text"
          autoComplete="off"
          required
        /> */}
        <ButtonBar>
          <Button type={"submit"}>Descargar reporte</Button>
        </ButtonBar>
      </Form>
    </Fragment>
  )
}

export default DescargarReporteRecaudo