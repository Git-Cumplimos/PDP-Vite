import LogoPDP from "../../../../components/Base/LogoPDP";

const TicketCierre = ({
  refPrint,
  type = "ORIGINAL",
  ticket,
  stateTrx = true,
}) => {
  if (!ticket) {
    return <div>Sin informacion de ticket</div>;
  }

  const { title, timeInfo, commerceInfo, cajaInfo, trxInfo } = ticket;

  return (
    <div style={{ border: "1px solid black" }}>
      <div
        ref={refPrint}
        style={{
          width: "80mm",
          margin: 0,
          padding: "0.5rem 0",
        }}
      >
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
        <h1 className="uppercase text-center px-8 my-3 text-sm font-semibold">
          Cierre de caja
        </h1>
        <div className="flex flex-col gap-2 px-2 text-xs">
          {cajaInfo
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
        <h1 className="uppercase text-center px-8 my-3 text-sm font-semibold">
          Reporte del arqueo
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
        {/* <hr className="border-gray-400 my-3" />
        <h1 className="uppercase text-center px-8 my-3 text-sm font-semibold">
          ***{type}***
        </h1>
        <h1 className="text-center my-3 text-xs font-normal">{disclamer}</h1> */}
      </div>
    </div>
  );
};

export default TicketCierre;
