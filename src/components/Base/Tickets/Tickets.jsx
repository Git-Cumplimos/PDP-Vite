import classes from "./Tickets.module.css";
import { useImgs } from "../../../hooks/ImgsHooks";

const { divPrint } = classes;

const Tickets = ({
  refPrint,
  type = "ORIGINAL",
  ticket,
  stateTrx = true,
  children = null,
  chunkSizeCommerce = 2,
  chunkSizeTrx = 2,
  whitespaceDisclaimer = false,
  disclamer_add = "",
}) => {
  const {
    imgs: { pdpHorizontal: LogoPng },
  } = useImgs();

  if (!ticket) {
    return <div>Sin informacion de ticket</div>;
  }

  const { title, timeInfo, commerceInfo, commerceName, trxInfo, disclamer } =
    ticket;

  return (
    <div style={{ border: "1px solid black" }}>
      <div className={divPrint} ref={refPrint}>
        <div className='flex flex-row justify-center items-center w-full'>
          {children || (
            <div className='w-30'>
              <div className='aspect-w-16 aspect-h-9'>
                <img src={LogoPng} alt='Logo punto de pago' />
              </div>
            </div>
          )}
        </div>
        <h1 className='text-xl font-semibold text-center uppercase'>{title}</h1>
        <hr className='border-gray-400 my-1' />
        <div className='flex flex-col gap-2 px-2 text-xs'>
          <div className='flex flex-row justify-between w-full'>
            {Object.entries(timeInfo).map(([key, value], idx) => {
              return (
                <div
                  key={idx}
                  className='flex flex-row justify-start flex-auto gap-2'>
                  <h1 className='font-semibold'>{key}:</h1>
                  <h1>{value}</h1>
                </div>
              );
            })}
          </div>
        </div>
        <hr className='border-gray-400 my-1' />
        <div className='flex flex-col gap-1 px-2 text-xs text-left'>
          {commerceInfo
            .map((e, i, arr) => {
              return i % chunkSizeCommerce === 0
                ? arr.slice(i, i + chunkSizeCommerce)
                : null;
            })
            .filter((e) => e)
            .map((e, i) => {
              return (
                <div
                  key={i}
                  className={`flex flex-row ${
                    e.length < chunkSizeCommerce
                      ? "justify-center"
                      : "justify-between"
                  } w-full`}>
                  {e.map(([key, val], idx) => {
                    return (
                      <div
                        key={`${key}_${idx}`}
                        className={`flex flex-row ${
                          e.length < chunkSizeCommerce
                            ? "justify-center"
                            : idx % chunkSizeCommerce === 0
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
        <h1 className='uppercase text-center px-8 my-1 text-sm font-semibold'>
          {commerceName ?? ""}
        </h1>
        <h1 className='uppercase text-center px-8 my-1 text-sm font-semibold'>
          Transacción {stateTrx ? "exitosa" : "rechazada"}
        </h1>
        <div className='flex flex-col gap-1 px-2 text-xs'>
          {trxInfo
            .map((e, i, arr) => {
              return i % chunkSizeTrx === 0
                ? arr.slice(i, i + chunkSizeTrx)
                : null;
            })
            .filter((e) => e)
            .map((e, i) => {
              return (
                <div
                  key={i}
                  className={`flex flex-row ${
                    e.length < chunkSizeTrx
                      ? "justify-center"
                      : "justify-between"
                  } w-full`}>
                  {e.map(([key, val], idx) => {
                    return (
                      <div
                        key={`${key}_${idx}`}
                        className={`flex flex-row ${
                          e.length < chunkSizeTrx
                            ? "justify-center"
                            : idx % chunkSizeTrx === 0
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
        <hr className='border-gray-400 my-1' />
        <h1 className='uppercase text-center px-8 my-1 text-sm font-semibold'>
          ***{type}***
        </h1>
        <h1 className='text-center my-1 text-xs font-semibold'>
          {disclamer_add ?? ""}
        </h1>
        <h1
          className={`text-center my-1 text-xs font-normal ${
            whitespaceDisclaimer ? "whitespace-pre" : ""
          }`}>
          {disclamer}
        </h1>
      </div>
    </div>
  );
};

export default Tickets;
