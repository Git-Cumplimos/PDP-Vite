import React, { Fragment } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";

export const ComponentsModalSummaryTrx = ({
  loadingPeticion,
  peticion,
  handleClose,
  tipoIdentificacion,
  numeroIdentificacion,
  valorPin
}) => {
  return (
    <Fragment>
      <PaymentSummary
        title="Respuesta de Consulta Pin"
        subtitle="Resumen de la transacción"
        summaryTrx={{
          "Tipo de identificación": 
          tipoIdentificacion == 1? "Cédula de ciudadanía":
          tipoIdentificacion == 2? "Cédula de extranjería":
          tipoIdentificacion == 3? "Tarjeta de identidad":
          tipoIdentificacion == 4? "NIT":
          tipoIdentificacion == 5? "Pasaporte":"",
          "Número de identificación": numeroIdentificacion,
          "Valor del Pin": valorPin,
        }}
      >
        {!loadingPeticion ? (
          <>
            <ButtonBar>
              <Button type={"submit"} onClick={peticion}>
              Realizar Pago
              </Button>
              <Button onClick={handleClose}>Cancelar</Button>
            </ButtonBar>
          </>
        ) : (
          <h1 className="text-2xl font-semibold">Procesando . . .</h1>
        )}
      </PaymentSummary>
    </Fragment>
  );
};
