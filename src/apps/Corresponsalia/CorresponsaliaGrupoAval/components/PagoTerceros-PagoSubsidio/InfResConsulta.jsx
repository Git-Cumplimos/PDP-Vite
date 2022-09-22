import React, { Fragment } from "react";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import { formatMoney } from "../../../../../components/Base/MoneyInput";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";

const InfResConsulta = ({
  value,
  summaryResConsulta,
  loadingPeticion,
  Peticion,
  HandleClose,
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
              {value > 0 && (
                <Button onClick={Peticion}>Retirar subsidio</Button>
              )}
              <Button onClick={HandleClose}>
                {value > 0 ? "Cancelar" : "Aceptar"}
              </Button>
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
