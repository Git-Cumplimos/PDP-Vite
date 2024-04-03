import React from "react";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import { useImgs } from "../../../../hooks/ImgsHooks";

import classes from "./CheckGouOrigin.module.css";

const { contendorBorder, contendorPago } = classes;

const CheckGouOrigin = () => {
  const { imgs } = useImgs();
  return (
    <div className={contendorBorder}>
      <img src={`${imgs?.LogoGou}`} alt={"LogoGou"} />
      <PaymentSummary
        title=""
        subtitle="Estamos procesando tu transacción, por favor espera un momento"
        summaryTrx={{
          nombre: "Ana María Barreto",
          "Tipo de trámite": "Pago tarjeta",
          "Num referencia": "8754",
          "Id transacción": 1234567,
          "Estado de la transacción": "Aprobada",
          "Fecha de la transacción": "28/02/2024",
        }}
      >
        <h2 className={contendorPago}>Pago : 2000</h2>
        {/* <Button type="submit">Comprobante</Button> */}
      </PaymentSummary>
    </div>
  );
};

export default CheckGouOrigin;
