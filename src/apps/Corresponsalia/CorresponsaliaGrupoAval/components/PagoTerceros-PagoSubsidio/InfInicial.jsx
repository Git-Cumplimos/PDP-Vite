import React, { Fragment } from "react";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";

const InfInicial = ({
  summaryInitial,
  loadingPeticion,
  Peticion,
  HandleClose,
}) => {
  return (
    <Fragment>
      <PaymentSummary
        title="¿Está seguro de realizar la transacción?"
        subtitle="Resumen de transacción"
        summaryTrx={summaryInitial}
      >
        {!loadingPeticion ? (
          <>
            <ButtonBar>
              <Button type={"submit"} onClick={Peticion}>
                Aceptar
              </Button>
              <Button onClick={HandleClose}>Cancelar</Button>
            </ButtonBar>
          </>
        ) : (
          <h1 className="text-2xl font-semibold">Procesando . . .</h1>
        )}
      </PaymentSummary>
    </Fragment>
  );
};

export default InfInicial;
