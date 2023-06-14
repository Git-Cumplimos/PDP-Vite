import classes from "./TicketsAgrario.module.css";
import LogoAgrario from "../../../../../../components/Base/LogoAgrario/LogoAgrario";
import { useEffect } from "react";

const TicketsAgrario = ({
  refPrint,
  type = "ORIGINAL",
  ticket,
  stateTrx = true,
  logo,
}) => {
  const { divPrint } = classes;

  console.log("ESTO ES EL TIKET DESDE EL COMPONENTEN TicketsAgrario ",ticket);
  if (!ticket) {
    return <div>Sin informacion de ticket</div>;
  }
 
  console.log("ESTO ES ticket", ticket)
  console.log("ESTO ES typeof(ticket)", typeof ticket)
  if (ticket) { 

    console.log("ESTO ES ticket?.timeInfo", ticket?.timeInfo)
    console.log("ESTO ES ticket?.timeInfo", ticket?.commerceInfo)
    console.log("ESTO ES ticket?.timeInfo", ticket?.commerceName)
  }
  // console.log("ESTO ES timeInfo", timeInfo)
  const { title, timeInfo, commerceInfo, commerceName, trxInfo, disclamer } = ticket;
  return (
    <div style={{ border: "1px solid black" }}>
      <div className={divPrint} ref={refPrint}>
        <div className='flex flex-row justify-center items-center w-full'>
          <LogoAgrario xsmall />
        </div>
        <h1 className='text-xs font-semibold text-center uppercase mb-5'>
          CORRESPONSAL BANCARIO PUNTO DE PAGO
        </h1>
        <h1 className='text-xl font-semibold text-center uppercase'>{title}</h1>
        <hr className='border-gray-400 my-3' />
        <div className='flex flex-col gap-2 px-2 text-xs'>
          <div className='flex flex-row justify-between w-full'>
            {ticket?.timeInfo &&             
              Object.entries(timeInfo).map(([key, value], idx) => {
                return (
                  <div
                    key={idx}
                    className='flex flex-row justify-start flex-auto gap-2'>
                    <h1 className='font-semibold'>{key}:</h1>
                    <h1>{value}</h1>
                  </div>
                );
              })
            }
          </div>
        </div>
        <hr className='border-gray-400 my-3' />
        <div className='flex flex-col gap-2 px-2 text-xs text-left'>
          {commerceInfo && commerceInfo
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
                  } w-full`}>
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
                        } flex-auto gap-2`}>
                        <h1 className='font-semibold'>
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
        <h1 className='uppercase text-center px-8 my-3 text-sm font-semibold'>
          {commerceName ?? ""}
        </h1>
        <h1 className='uppercase text-center px-8 my-3 text-sm font-semibold'>
          Transacción {stateTrx ? "exitosa" : "rechazada"}
        </h1>
        <div className='flex flex-col gap-2 px-2 text-xs'>
          {trxInfo && trxInfo.map((e, i, arr) => {
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
                  } w-full`}>
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
                        } flex-auto gap-2`}>
                        <h1 className='font-semibold'>
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
        <hr className='border-gray-400 my-3' />
        <h1 className='uppercase text-center px-8 my-3 text-sm font-semibold'>
          ***{type}***
        </h1>
        <h1 className='text-center my-3 text-xs font-normal'>{disclamer}</h1>
      </div>
    </div>
  );
};

export default TicketsAgrario;
