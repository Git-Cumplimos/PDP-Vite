import classes from "./TicketsPowwi.module.css";
import { useCallback, useEffect, useState } from "react";
import { useImgs } from "../../../../hooks/ImgsHooks";
import LogoPowwi from "./LogoPowwi.png"

const { divPrint } = classes;

const TicketsPowwi = ({
  refPrint,
  type = "ORIGINAL",
  ticket = {
    title: "Recibo de pago",
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
    commerceName: "Loteria de bogotá",
    trxInfo: [
      ["Billete", "0222"],
      ["Serie", "231"],
      ["Valor pago", 20000.0],
    ],
    disclamer: "Para quejas o reclamos comuniquese al *num PDP*",
  },
}) => {
  const { title, timeInfo, commerceInfo, commerceName, trxInfo, disclamer } =
    ticket;
    
  const {
    imgs: { pdpHorizontal: LogoPng },
  } = useImgs();

  return (
    <div style={{ border: "1px solid black" }}>
      <div className={divPrint} ref={refPrint}>
        <div className="flex flex-row mx-2 ">
          <div className="w-30 mx-auto mt-2 ml-1">
            <div className="aspect-w-14 aspect-h-5">
              <img src={LogoPowwi} alt="Logo punto de pago"/>
            </div>
          </div>
          <div className="w-30 mx-auto">
            <div className="aspect-w-16 aspect-h-9">
              <img src={LogoPng} alt="Logo punto de pago"/>
            </div>
          </div>
        </div>
        <h1 className="text-xl font-semibold text-center uppercase">{title}</h1>
        <hr className="border-gray-400 my-1" />
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
        <hr className="border-gray-400 my-1" />
        <div className="flex flex-col gap-1 px-2 text-xs text-left">
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
                        {typeof val === "string" &&
                        val?.includes("<strong>") ? (
                          <h1 className="font-bold">
                            {val?.replace("<strong>", "")}
                          </h1>
                        ) : (
                          <h1>{val}</h1>
                        )}
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
        <h1 className='uppercase text-center px-8 my-1 text-sm font-semibold'>
          Transacción exitosa
        </h1>
        <div className="flex flex-col gap-1 px-2 text-xs">
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
        <hr className="border-gray-400 my-1" />
        <h1 className="uppercase text-center px-8 my-1 text-sm font-semibold">
          ***{type}***
        </h1>
        <div className="flex px-2">
          <div className="block justify-center items-center">
            <h1 className="text-center my-1 text-xs font-normal whitespace-pre-wrap">
              {disclamer}
            </h1>
          </div>
        </div>
        {/* <div className="flex px-2">
          <div>
            <h1
              className="text-center my-1 text-xs font-normal"
              style={{
                writingMode: "vertical-lr",
                transform: "rotate(-180deg)",
                padding: "0 1px",
                borderLeft: " 1px solid black",
                borderRight: "1px solid black",
                // borderWidth: "5px 0",
              }}
            >
              VIGILADO
            </h1>
          </div>
          <div>
            <h1 className="text-center my-1 text-xs font-normal">
              Punto De Pago
            </h1>
            <h1 className="text-center my-1 text-xs font-normal">
              Punto DaviPlata - Corresponsal Bancario Davivienda
            </h1>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default TicketsPowwi;
