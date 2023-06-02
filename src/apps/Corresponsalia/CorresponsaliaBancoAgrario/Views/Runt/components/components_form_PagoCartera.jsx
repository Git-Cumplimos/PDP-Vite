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
  numeroRunt,
}) => {
  console.log("LLEGO ACA 1 loadingPeticion", loadingPeticion)
  console.log("LLEGO ACA 1 onSubmit", onSubmit)
  console.log("LLEGO ACA 1 handleClose", handleClose)
  console.log("LLEGO ACA 1 procedimiento", procedimiento)
  console.log("LLEGO ACA 1 numero_obligacion", numero_obligacion)
  console.log("LLEGO ACA 1 numero_cedula", numero_cedula)
  console.log("LLEGO ACA 1 numeroRunt", numeroRunt)
  return (
    <Fragment>
      <ButtonBar></ButtonBar>
      <h2 className="text-1xl mt-6">Número de RUNT</h2>
      <ButtonBar></ButtonBar>
      {/* <Form > */}

      {procedimiento === numero_cedula && (

        <Input
          required
          className={styleComponentsInput}
          type="text"
          autoComplete="off"
          value={numeroRunt}
          disabled={true}
        />
      )}
      {procedimiento === numero_obligacion && (
        <Input
          required
          className={styleComponentsInput}
          type="text"
          autoComplete="off"
          value={numeroRunt}
          maxLength={"18"}
          onChange={onChange}
        />
      )}

      <ButtonBar className="flex justify-center py-6">
        <Button type={"submit"} onClick={onSubmit} disabled={numeroRunt === "" || numeroRunt === 0 ? !loadingPeticion : loadingPeticion}>
          Consultar
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
  numeroRunt,
}) => {
  console.log("LLEGO ACA 2 loadingPeticion", loadingPeticion)
  console.log("LLEGO ACA 2 onSubmit", onSubmit)
  console.log("LLEGO ACA 2 handleClose", handleClose)
  console.log("LLEGO ACA 2 procedimiento", procedimiento)
  console.log("LLEGO ACA 2 numero_obligacion", numero_obligacion)
  console.log("LLEGO ACA 2 numero_cedula", numero_cedula)
  console.log("LLEGO ACA 2 numeroRunt", numeroRunt)
  return (
    <Fragment>
      <ButtonBar></ButtonBar>
      <h2 className="text-1xl mt-6">Número de RUNT</h2>
      <ButtonBar></ButtonBar>
      {/* <Form > */}

      {procedimiento === numero_obligacion && (
        
        <Input
          required
          className={styleComponentsInput}
          type="text"
          autoComplete="off"
          value={numeroRunt}
          disabled={true}
        />
      )}
      {procedimiento === numero_cedula && (
        <Input
          required
          className={styleComponentsInput}
          type="text"
          autoComplete="off"
          value={numeroRunt}
          maxLength={"18"}
          onChange={onChange}
        />
      )}

      <ButtonBar className="flex justify-center py-6">
        <Button type={"submit"} onClick={onSubmit} disabled={numeroRunt === "" || numeroRunt === 0 ? !loadingPeticion : loadingPeticion }>
          Consultar
        </Button>
        <Button type={"reset"} onClick={handleClose} disabled={loadingPeticion}>
          Cancelar
        </Button>
      </ButtonBar>
      {/* </Form> */}
    </Fragment>
  );
};
