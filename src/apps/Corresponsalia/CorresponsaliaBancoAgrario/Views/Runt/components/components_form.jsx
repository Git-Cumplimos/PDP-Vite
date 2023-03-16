import React, { Fragment } from "react";
import BarcodeReader from "../../../../../../components/Base/BarcodeReader";
import Button from "../../../../../../components/Base/Button";
import ButtonBar from "../../../../../../components/Base/ButtonBar";
import Input from "../../../../../../components/Base/Input";
import classes from "../PagarRunt.module.css";

//Clases estilos
const { styleComponentsInput } = classes;

export const LecturaBarcode = ({ loadingPeticion, onSubmit, buttonDelate }) => {
  return (
    <Fragment>
      <ButtonBar></ButtonBar>
      <BarcodeReader onSearchCodigo={onSubmit} disabled={loadingPeticion} />
      {!loadingPeticion ? (
        <>
          <ButtonBar className="lg:col-span-2">
            <button ref={buttonDelate} type="reset">
              Volver a ingresar código de barras
            </button>
            {/* <Button type="reset">Volver a ingresar código de barras</Button> */}
          </ButtonBar>
        </>
      ) : (
        <Fragment>
          <ButtonBar></ButtonBar>
          <h1 className="text-2xl font-semibold">Procesando . . .</h1>
        </Fragment>
      )}
    </Fragment>
  );
};

export const LecturaRunt = ({
  loadingPeticion,
  onSubmit,
  handleClose,
  onChange,
  procedimiento,
  option_barcode,
  option_manual,
  numeroRunt,
}) => {
  return (
    <Fragment>
      <ButtonBar></ButtonBar>
      <h2 className="text-1xl mt-6">Número de RUNT</h2>
      <ButtonBar></ButtonBar>
      {procedimiento === option_barcode && (
        <Input
          className={styleComponentsInput}
          type="text"
          autoComplete="off"
          value={numeroRunt}
          disabled={true}
        />
      )}
      {procedimiento === option_manual && (
        <Input
          className={styleComponentsInput}
          type="text"
          autoComplete="off"
          value={numeroRunt}
          maxLength={"18"}
          onChange={onChange}
        />
      )}

      <ButtonBar className="flex justify-center py-6">
        <Button type={"submit"} onClick={onSubmit} disabled={loadingPeticion}>
          Tramitar RUNT
        </Button>
        <Button type={"reset"} onClick={handleClose} disabled={loadingPeticion}>
          Cancelar
        </Button>
      </ButtonBar>
    </Fragment>
  );
};
