import classes from "./TicketLot.module.css";
import LogoLoto from "../../../../components/Base/LogoLoto";
import LogoLoTolima from "../../../../components/Base/LogoLoTolima";
import LogoLoCundinamarca from "../../../../components/Base/LogoLoCundinamarca";

const TicketLot = ({
  refPrint,
  type = "ORIGINAL",
  ticket,
  stateTrx = true,
  loteria,
}) => {
  const { divPrint, smallertext } = classes;

  if (!ticket) {
    return <div>Sin informacion de ticket</div>;
  }

  const {
    title,
    timeInfo,
    commerceInfo,
    commerceName,
    descriPM,
    trxInfo,
    disclamer,
  } = ticket;

  return (
    <div style={{ border: "1px solid black" }}>
      <div className={divPrint} ref={refPrint}>
        <div className="flex flex-row justify-center items-center w-full">
          {loteria == "Lotería de Bogotá" ? (
            <LogoLoto xsmall />
          ) : loteria == "Lotería del Tolima" ? (
            <LogoLoTolima xsmall />
          ) : (
            <LogoLoCundinamarca xsmall />
          )}
        </div>
        <h1 className="text-xl font-semibold text-center uppercase">{title}</h1>
        <hr className="border-gray-400 my-1" />
        <div className="flex flex-col gap-1 px-2 text-xs">
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
        <hr className="border-gray-400 my-1" />
        <div className={smallertext}>
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
                        } flex-auto gap-1`}
                      >
                        <h1 className="font-semibold">
                          {key ? `${key}:` : ""}
                        </h1>
                        <h1>{val}</h1>
                      </div>
                    );
                  })}
                </div>
              );
            })}
        </div>
        <h1 className="uppercase text-center px-8 my-1 text-sm font-semibold">
          {commerceName ?? ""}
        </h1>
        <h1 className="uppercase text-center px-8 my-1 text-sm font-semibold">
          Transacción {stateTrx ? "exitosa" : "rechazada"}
        </h1>
        <h1 className="uppercase text-center px-8 my-1 text-xs font-semibold">
          {descriPM ?? ""}
        </h1>
        <div className="flex flex-col gap-1 px-2 my-1 text-xs">
          {trxInfo
            .map((e, i, arr) => {
              const chunkSize = 3;
              return i % chunkSize === 0 ? arr.slice(i, i + chunkSize) : null;
            })
            .filter((e) => e)
            .map((e, i) => {
              return (
                <div
                  key={i}
                  className={`flex flex-row ${
                    e.length < 3 ? "justify-center" : "justify-between"
                  } w-full`}
                >
                  {e.map(([key, val], idx) => {
                    return (
                      <div
                        key={`${key}_${idx}`}
                        className={`flex flex-row ${
                          e.length < 3
                            ? "justify-center"
                            : idx % 3 === 0
                            ? "justify-start"
                            : "justify-end"
                        } flex-auto gap-1`}
                      >
                        <h1 className="font-semibold">
                          {key ? `${key}:` : ""}
                        </h1>
                        <h1>{val}</h1>
                      </div>
                    );
                  })}
                </div>
              );
            })}
        </div>
        <hr className="border-gray-400 my-1" />
        <h1 className="uppercase text-center px-8 my-1 text-sm font-semibold">
          ***{type}***
        </h1>
        <h1 className="text-center px-1 my-1 text-xs font-normal">
          {disclamer}
        </h1>
        <h1 className="text-center my-1 text-xs font-semibold">
          Vigilado Supersalud
        </h1>
      </div>
    </div>
  );
};

export default TicketLot;
