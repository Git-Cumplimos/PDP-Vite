import Button from "../../../../../../../components/Base/Button";
import ButtonBar from "../../../../../../../components/Base/ButtonBar";
import { formatMoney } from "../../../../../../../components/Base/MoneyInput";
import PaymentSummary from "../../../../../../../components/Compound/PaymentSummary";
export const ComponentsModalSummaryTrxTarjCredito = ({
  numero_tarjcredito,
  valor_pagar,
  loadingPeticion,
  peticion,
  handleClose,
}) => {
  return (
    <PaymentSummary
      title="¿Está seguro de realizar la transacción?"
      subtitle="Resumen de transacción"
      summaryTrx={{
        "Número tarjeta crédito": numero_tarjcredito,
        "Valor a pagar": formatMoney.format(valor_pagar),
      }}
    >
      {!loadingPeticion ? (
        <>
          <ButtonBar>
            <Button type={"submit"} onClick={(e) => {
              e.preventDefault();
              peticion(e, numero_tarjcredito, valor_pagar)
            }}>
              Aceptar
            </Button>
            <Button onClick={handleClose}>Cancelar</Button>
          </ButtonBar>
        </>
      ) : (
        <h1 className="text-2xl font-semibold">Procesando . . .</h1>
      )}
    </PaymentSummary>
  );
};
