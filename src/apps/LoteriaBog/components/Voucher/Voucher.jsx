import classes from "./Voucher.module.css";
import LogoPDP from "../../../../components/Base/LogoPDP/LogoPDP";

const Voucher = ({ setPrintDiv, refPrint, ...info }) => {
  const { divPrint } = classes;

  return (
    
    <div className={divPrint} ref={refPrint}>
      <div className="flex flex-row justify-center items-center w-full">
        <LogoPDP xsmall />
      </div>
      <h1 className="text-xl font-semibold text-center uppercase">
        Recibo de pago
      </h1>
      <hr className="border-gray-400 my-3" />
      <div className="flex flex-col gap-2 px-2 text-xs">
        <div className="flex flex-row justify-between w-full">
          <div className="flex flex-row justify-start flex-auto gap-2">
            <h1 className="font-semibold">Fecha de venta:</h1>
            <h1>{info["Fecha de venta"]}</h1>
          </div>
          <div className="flex flex-row justify-end flex-auto gap-2">
            <h1 className="font-semibold">Hora:</h1>
            <h1>{info.Hora}</h1>
          </div>
        </div>
      </div>
      <hr className="border-gray-400 my-3" />
      <div className="flex flex-col gap-2 px-2 text-xs text-left">
        <div className="flex flex-row justify-between w-full">
          <div className="flex flex-row justify-start flex-auto gap-2">
            <h1 className="font-semibold">Comercio:</h1>
            <h1>{info.Comercio}</h1>
          </div>
          <div className="flex flex-row justify-end flex-auto gap-2">
            <h1 className="font-semibold">No. terminal:</h1>
            <h1>{info['No.terminal']}</h1>
          </div>
        </div>
        <div className="flex flex-row justify-between w-full">
          <div className="flex flex-row justify-start flex-auto gap-2">
            <h1 className="font-semibold">Direccion:</h1>
            <h1>{info["Dirección"]}</h1>
          </div>
          <div className="flex flex-row justify-end flex-auto gap-2">
            <h1 className="font-semibold">Telefono:</h1>
            <h1>{info.telefono}</h1>
          </div>
        </div>
        <div className="flex flex-row justify-between w-full">
          <div className="flex flex-row justify-start flex-auto gap-2">
            <h1 className="font-semibold">Id Trx:</h1>
            <h1>{info.Id_registro}</h1>
          </div>
          <div className="flex flex-row justify-end flex-auto gap-2">
            <h1 className="font-semibold">Id Transacción:</h1>
            <h1>{info["Id Transacción"]}</h1>
          </div>
        </div>
      </div>
      <h1 className="uppercase text-center px-8 my-3 text-sm font-semibold">
        {info["Nombre de loteria"]} Transacción exitosa
      </h1>
      <div className="flex flex-col gap-2 px-2 text-xs">
        <div className="flex flex-row justify-between w-full">
          <div className="flex flex-row justify-start flex-auto gap-2">
            <h1 className="font-semibold">Billete:</h1>
            <h1>{info["Numero de billete"]}</h1>
          </div>
          <div className="flex flex-row justify-end flex-auto gap-2">
            <h1 className="font-semibold">Serie:</h1>
            <h1>{info.Serie}</h1>
          </div>
        </div>
        <div className="flex flex-row justify-center w-full">
          <div className="flex flex-row justify-center flex-auto gap-2">
            <h1 className="font-semibold">Valor pago:</h1>
            <h1>{info["Valor pagado"]}</h1>
          </div>
        </div>
      </div>
      <hr className="border-gray-400 my-3" />
      <h1 className="uppercase text-center px-8 my-3 text-sm font-semibold">
        ***ORIGINAL***
      </h1>
      <h1 className="text-center my-3 text-xs font-normal">
        Disclaimer
      </h1>
    </div>
  );
};

export default Voucher;
