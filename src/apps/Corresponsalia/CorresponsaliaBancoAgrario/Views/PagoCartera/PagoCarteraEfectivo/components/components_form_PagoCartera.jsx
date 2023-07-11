import { Fragment } from "react";
import Button from "../../../../../../../components/Base/Button";
import ButtonBar from "../../../../../../../components/Base/ButtonBar";
import Input from "../../../../../../../components/Base/Input";
import classes from "../../../Runt/PagarRunt.module.css"
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
        <Button type={"submit"} onClick={onSubmit} disabled={numeroPagoCartera.length < 6|| numeroPagoCartera === "" || numeroPagoCartera === 0 ? !loadingPeticion : loadingPeticion}>
          Realizar consulta
        </Button>
        <Button type={"reset"} onClick={handleClose} disabled={loadingPeticion}>
          Cancelar
        </Button>
      </ButtonBar>
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
    </Fragment>
  );
};
