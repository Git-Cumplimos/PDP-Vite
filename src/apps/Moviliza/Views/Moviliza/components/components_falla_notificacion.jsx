import React, { Fragment } from "react";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";

export const ComponentsMsgFallaNotificacion = (
  {
  handleClose,
}
) => {
  return (
    <Fragment>
      <PaymentSummary
        title=""
        subtitle="La notificación de pago de Moviliza presento inconvenientes por favor realice el cambio de estado manualmente en Moviliza"
      >
          <>
            <ButtonBar>
              <Button onClick={handleClose}>Cerrar</Button>
            </ButtonBar>
          </>
      </PaymentSummary>
    </Fragment>
  );
};
