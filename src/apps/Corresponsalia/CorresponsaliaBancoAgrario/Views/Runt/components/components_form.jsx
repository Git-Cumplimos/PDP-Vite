import React, { Fragment } from "react";
import BarcodeReader from "../../../../../../components/Base/BarcodeReader";
import Button from "../../../../../../components/Base/Button";
import ButtonBar from "../../../../../../components/Base/ButtonBar";
import Input from "../../../../../../components/Base/Input";

export const LecturaBarcode = ({ loadingPeticion, onSubmit }) => {
  return (
    <Fragment>
      <ButtonBar></ButtonBar>
      <BarcodeReader onSearchCodigo={onSubmit} />
      {!loadingPeticion ? (
        <>
          <ButtonBar className="lg:col-span-2">
            <Button type="reset">Volver a ingresar código de barras</Button>
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
          // label="Número de RUNT"
          type="text"
          autoComplete="off"
          value={numeroRunt}
          disabled
        />
      )}
      {procedimiento === option_manual && (
        <Input
          // label="Número de RUNT"
          type="text"
          autoComplete="off"
          value={numeroRunt}
          maxLength={"18"}
          onChange={onChange}
        />
      )}
      <ButtonBar className="lg:col-span-0.6">
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
