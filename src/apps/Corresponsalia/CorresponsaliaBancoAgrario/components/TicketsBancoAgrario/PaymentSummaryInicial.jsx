import React, { useEffect, useState } from "react";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import { formatMoney } from "../../../../../components/Base/MoneyInput";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";

const PaymentSummaryInicial = ({
  dataInput,
  handleClose,
  realizarRetiroEfectivo,
  loadingPeticionRetiroEfectivo,
  optionsSelect,
}) => {
  const [tipoCuentaVisual, setTipoCuentaVisual] = useState("");
  useEffect(() => {
    optionsSelect.map((optionInd) => {
      if (dataInput?.tipoCuenta == optionInd.value) {
        setTipoCuentaVisual(optionInd.label);
      }
    });
  }, [dataInput?.tipoCuenta]);

  return (
    <PaymentSummary
      title="¿Está seguro de realizar la transacción?"
      subtitle="Resumen de transacción"
      summaryTrx={{
        "Tipo de Cuenta": tipoCuentaVisual,
        Cuenta: dataInput?.cuenta,
        Token: dataInput?.OTP,
        Valor: formatMoney.format(dataInput?.amount),
      }}
    >
      {!loadingPeticionRetiroEfectivo ? (
        <>
          <ButtonBar>
            <Button onClick={realizarRetiroEfectivo}>Aceptar</Button>
            <Button onClick={handleClose}>Cancelar</Button>
          </ButtonBar>
        </>
      ) : (
        <h1 className="text-2xl font-semibold">Procesando . . .</h1>
      )}
    </PaymentSummary>
  );
};

export default PaymentSummaryInicial;
