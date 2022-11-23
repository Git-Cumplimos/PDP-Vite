import { isValidElement } from "react";

const PaymentSummary = ({
  title = "¿Está seguro de realizar la transacción?",
  subtitle = "Resumen de transacción",
  summaryTrx = {},
  children,
}) => {
  return (
    <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <h1 className="text-xl font-semibold">{subtitle}</h1>
      <ul className="grid grid-flow-row gap-2 justify-center align-middle">
        {Object.entries(summaryTrx ?? {}).map(([key, val]) => {
          if (
            Array.isArray(val) ||
            (typeof val === "object" && !isValidElement(val))
          ) {
            val = JSON.stringify(val);
          }
          return (
            <li key={key}>
              <h1 className="grid grid-flow-col auto-cols-fr gap-6">
                <strong className="justify-self-end">{key}:</strong>
                <p>{val}</p>
              </h1>
            </li>
          );
        })}
      </ul>
      {children}
    </div>
  );
};

export default PaymentSummary;
