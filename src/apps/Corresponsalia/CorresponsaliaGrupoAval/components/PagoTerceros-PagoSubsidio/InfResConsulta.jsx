import React, { Fragment } from "react";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";

const InfResConsulta = ({
  value,
  summaryResConsulta,
  loadingPeticion,
  Peticion,
  HandleClose1,
  HandleClose2,
}) => {
  return (
    <Fragment>
      <PaymentSummary
        title={
          value > 0 ? "¿Desea retirar subsidio?" : "No cuenta con un subsidio"
        }
        subtitle=""
        summaryTrx={summaryResConsulta}
      >
        {!loadingPeticion ? (
          <>
            <ButtonBar>
              {value > 0 ? (
                <Fragment>
                  <Button type={"submit"} onClick={Peticion}>
                    Retirar subsidio
                  </Button>
                  <Button onClick={HandleClose1}>Cancelar</Button>
                </Fragment>
              ) : (
                <Button type={"submit"} onClick={HandleClose2}>
                  Aceptar
                </Button>
              )}
            </ButtonBar>
          </>
        ) : (
          <h1 className="text-2xl font-semibold">Procesando . . .</h1>
        )}
      </PaymentSummary>
    </Fragment>
  );
};

export default InfResConsulta;
