import classes from "./Tickets.module.css";
import LogoPDP from "../../../../components/Base/LogoPDP/LogoPDP";

const Tickets = ({
  refPrint,
  type = "ORIGINAL",
  ticket = {
    title: "Recaudo",
    timeInfo: {
      "Fecha de venta": "28/01/2022",
      Hora: "12:22:00",
    },
    commerceInfo: [
      ["Id Comercio", 2],
      ["No. terminal", 233],
      ["Municipio", "Bogota"],
      ["Dirección", "Calle 11 # 11 - 2"],
      ["Id Trx", 233],
      ["Id Transacción", 99],
    ],
    commerceName: "Fundación de la mujer",
    trxInfo: [
      ["# Crédito", ""],
      ["Valor pago", 347893],
    ],
    disclamer: "Para quejas o reclamos comuniquese al *num PDP*",
  },
}) => {
  const { divPrint } = classes;
  const { title, timeInfo, commerceInfo, commerceName, trxInfo, disclamer } =
    ticket;

  return (
    <div className={divPrint} ref={refPrint}>
      <div className="flex flex-row justify-center items-center w-full">
        <LogoPDP xsmall />
      </div>
      <h1 className="text-xl font-semibold text-center uppercase">{title}</h1>
      <hr className="border-gray-400 my-3" />
      <div className="flex flex-col gap-2 px-2 text-xs">
        <div className="flex flex-row justify-between w-full">
          {Object.entries(timeInfo).map(([key, value], idx) => {
            return (
              <div
                key={idx}
                className="flex flex-row justify-start flex-auto gap-2"
              >
                <h1 className="font-semibold">{key}:</h1>
                <h1>{value}</h1>
              </div>
            );
          })}
        </div>
      </div>
      <hr className="border-gray-400 my-3" />
      <div className="flex flex-col gap-2 px-2 text-xs text-left">
        {commerceInfo
          .map((e, i, arr) => {
            const chunkSize = 2;
            return i % chunkSize === 0 ? arr.slice(i, i + chunkSize) : null;
          })
          .filter((e) => e)
          .map((e, i) => {
            return (
              <div
                key={i}
                className={`flex flex-row ${
                  e.length < 2 ? "justify-center" : "justify-between"
                } w-full`}
              >
                {e.map(([key, val], idx) => {
                  return (
                    <div
                      key={`${key}_${idx}`}
                      className={`flex flex-row ${
                        e.length < 2
                          ? "justify-center"
                          : idx % 2 === 0
                          ? "justify-start"
                          : "justify-end"
                      } flex-auto gap-2`}
                    >
                      <h1 className="font-semibold">{key ? `${key}:` : ""}</h1>
                      <h1>{val}</h1>
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>
      <h1 className="uppercase text-center px-8 my-3 text-sm font-semibold">
        {commerceName ?? ""} Transacción exitosa
      </h1>
      <div className="flex flex-col gap-2 px-2 text-xs">
        {trxInfo
          .map((e, i, arr) => {
            const chunkSize = 2;
            return i % chunkSize === 0 ? arr.slice(i, i + chunkSize) : null;
          })
          .filter((e) => e)
          .map((e, i) => {
            return (
              <div
                key={i}
                className={`flex flex-row ${
                  e.length < 2 ? "justify-center" : "justify-between"
                } w-full`}
              >
                {e.map(([key, val], idx) => {
                  return (
                    <div
                      key={`${key}_${idx}`}
                      className={`flex flex-row ${
                        e.length < 2
                          ? "justify-center"
                          : idx % 2 === 0
                          ? "justify-start"
                          : "justify-end"
                      } flex-auto gap-2`}
                    >
                      <h1 className="font-semibold">{key ? `${key}:` : ""}</h1>
                      <h1>{val}</h1>
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>
      <hr className="border-gray-400 my-3" />
      <h1 className="uppercase text-center px-8 my-3 text-sm font-semibold">
        ***{type}***
      </h1>
      <h1 className="text-center my-3 text-xs font-normal">{disclamer}</h1>
    </div>
  );
};

export default Tickets;
