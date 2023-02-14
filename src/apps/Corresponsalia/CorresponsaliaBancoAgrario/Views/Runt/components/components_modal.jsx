import React, { Fragment } from "react";
import Button from "../../../../../../components/Base/Button";
import ButtonBar from "../../../../../../components/Base/ButtonBar";
import { formatMoney } from "../../../../../../components/Base/MoneyInput";
import PaymentSummary from "../../../../../../components/Compound/PaymentSummary";

export const ComponentsModalSummaryTrx = ({
  summary,
  loadingPeticion,
  peticion,
  handleClose,
}) => {
  return (
    <Fragment>
      <PaymentSummary
        title="¿Está seguro de realizar la transacción?"
        subtitle="Resumen de transacción"
        summaryTrx={{
          "Número Runt": summary.numero_runt,
          "Fecha de pago": summary.fecha_vencimiento,
          "Total derechos Runt": formatMoney.format(summary.valor_runt),
          "Total derechos MT": formatMoney.format(summary.valor_mt),
          "Total a pagar": formatMoney.format(summary.valor_total_trx),
        }}
      >
        {!loadingPeticion ? (
          <>
            <ButtonBar>
              <Button type={"submit"} onClick={peticion}>
                Pagar
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
