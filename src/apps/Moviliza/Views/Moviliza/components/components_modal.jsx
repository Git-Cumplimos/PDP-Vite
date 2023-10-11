import React, { Fragment } from "react";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import { formatMoney } from "../../../../../components/Base/MoneyInput";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";

export const ComponentsModalSummaryTrx = ({
  summary,
  loadingPeticion,
  peticion,
  handleClose,
}) => {
  return (
    <Fragment>
      <PaymentSummary
        title="Respuesta de consulta Moviliza"
        subtitle="Resumen de la transacción"
        summaryTrx={{
          "Número de referencia": summary.numero_moviliza,
          // "Fecha de pago": summary.fecha_vencimiento,
          "Total derechos RUNT": formatMoney.format(summary.object?.totalRUNT),
          "Total derechos MT": formatMoney.format(summary.object?.totalMT),
          "Total derechos locales": formatMoney.format(summary.object?.totalLocal),
          "Total a pagar": formatMoney.format(summary.object?.totalLiquidacion),
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
