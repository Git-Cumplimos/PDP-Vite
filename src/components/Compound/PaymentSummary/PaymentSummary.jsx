const PaymentSummary = ({
  title = "¿Esta seguro de realizar el transaccion?",
  subtitle = "Resumen de transaccion",
  summaryTrx = {},
  children,
}) => {
  return (
    <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <h1 className="text-xl font-semibold">{subtitle}</h1>
      <ul className="grid grid-flow-row auto-rows-fr gap-2 place-items-stretch">
        {Object.entries(summaryTrx ?? {}).map(([key, val]) => {
          return (
            <li key={key}>
              <h1 className="grid grid-flow-col auto-cols-fr gap-6 place-items-center">
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
