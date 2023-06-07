import React, { Fragment } from "react";
import BarcodeReader from "../../../../../../components/Base/BarcodeReader";
import Button from "../../../../../../components/Base/Button";
import ButtonBar from "../../../../../../components/Base/ButtonBar";
import Input from "../../../../../../components/Base/Input";
import classes from "../PagarRunt.module.css";
import Form from "../../../../../../components/Base/Form/Form";

//Clases estilos
const { styleComponentsInput, formItem } = classes;

export const LecturaNumeroObligacion = ({
  loadingPeticion,
  onSubmit,
  handleClose,
  onChange,
  procedimiento,
  numero_obligacion,
  numero_cedula,
  numeroPagoCartera,
}) => {
  return (
    <Fragment>
      <ButtonBar></ButtonBar>
      <h2 className="text-1xl mt-6">{procedimiento}</h2>
      <ButtonBar></ButtonBar>
      {/* <Form > */}

      {procedimiento === numero_cedula && (

        <Input
          required
          className={styleComponentsInput}
          type="text"
          autoComplete="off"
          value={numeroPagoCartera}
          disabled={true}
        />
      )}
      {procedimiento === numero_obligacion && (
        <Input
          required
          className={styleComponentsInput}
          type="text"
          autoComplete="off"
          value={numeroPagoCartera}
          maxLength={"20"}
          onChange={onChange}
        />
      )}

      <ButtonBar className="flex justify-center py-6">
        <Button type={"submit"} onClick={onSubmit} disabled={numeroPagoCartera === "" || numeroPagoCartera === 0 ? !loadingPeticion : loadingPeticion}>
          Realizar consulta
        </Button>
        <Button type={"reset"} onClick={handleClose} disabled={loadingPeticion}>
          Cancelar
        </Button>
      </ButtonBar>
      {/* </Form> */}
    </Fragment>
  );
};

export const LecturaNumeroCedula = ({
  loadingPeticion,
  onSubmit,
  handleClose,
  onChange,
  procedimiento,
  numero_obligacion,
  numero_cedula,
  numeroPagoCartera,
}) => {  
  return (
    <Fragment>
      <ButtonBar></ButtonBar>
      <h2 className="text-1xl mt-6">{procedimiento}</h2>
      <ButtonBar></ButtonBar>
      {/* <Form > */}

      {procedimiento === numero_obligacion && (
        
        <Input
          required
          className={styleComponentsInput}
          type="text"
          autoComplete="off"
          value={numeroPagoCartera}
          disabled={true}
        />
      )}
      {procedimiento === numero_cedula && (
        <Input
          required
          className={styleComponentsInput}
          type="text"
          autoComplete="off"
          value={numeroPagoCartera}
          maxLength={"20"}
          onChange={onChange}
        />
      )}

      <ButtonBar className="flex justify-center py-6">
        <Button type={"submit"} onClick={onSubmit} disabled={numeroPagoCartera === "" || numeroPagoCartera === 0 ? !loadingPeticion : loadingPeticion }>
          Realizar consulta
        </Button>
        <Button type={"reset"} onClick={handleClose} disabled={loadingPeticion}>
          Cancelar
        </Button>
      </ButtonBar>
      {/* </Form> */}
    </Fragment>
  );
};
