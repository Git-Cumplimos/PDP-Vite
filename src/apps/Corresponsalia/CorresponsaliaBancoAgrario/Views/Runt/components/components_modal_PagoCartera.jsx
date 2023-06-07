import React, { Fragment } from "react";
import Button from "../../../../../../components/Base/Button";
import ButtonBar from "../../../../../../components/Base/ButtonBar";
import { formatMoney } from "../../../../../../components/Base/MoneyInput";
import PaymentSummary from "../../../../../../components/Compound/PaymentSummary";

export const ComponentsModalSummaryTrx = ({
  documento,
  numero_obligacion,
  numeroPagoCartera,
  numero_cedula,
  summary,
  loadingPeticion,
  peticion,
  handleClose,
}) => {
  console.log("summary", summary);
  console.log("paso", documento);
  console.log("numero_obligacion", numero_obligacion);
  console.log("numeroPagoCartera", numeroPagoCartera);
  console.log("numero_cedula", numero_cedula);
  // console.log("loadingPeticion", loadingPeticion);
  // console.log("peticion", peticion);
  // console.log("handleClose", handleClose);
  // console.log("setPaso:", handleClose.setPaso);

  return (
    <Fragment>
      <PaymentSummary
        title="¿Está seguro de realizar la transacción?"
        subtitle="Resumen de transacción"
        summaryTrx={{
          // "Número RUNT": summary.numero_runt,
          // "Fecha de pago": summary.fecha_vencimiento,
          // "Total derechos RUNT": formatMoney.format(summary.valor_runt),
          // "Total derechos MT": formatMoney.format(summary.valor_mt),
          // "Total a pagar": formatMoney.format(summary.valor_total_trx),
          // `${numero_cedula}: ${numeroPagoCartera}`,
          // numero_cedula + ": " + numeroPagoCartera,
          // `${numero_cedula}: ${numeroPagoCartera}`,
          [documento === "LecturaNumeroObligacion" ? "Número de Obligación" : documento === "LecturaNumeroCedula" ? "Número de Cédula" : ""]: numeroPagoCartera,
          // "Total derechos RUNT": "",
          // "Total derechos MT": "",
          "Total a pagar": "",
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
