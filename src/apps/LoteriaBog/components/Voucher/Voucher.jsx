import LogoLoto from "../../../../components/Base/LogoLoto/LogoLoto";
import LogoPDPV from "../../../../components/Base/LogoPDPV/LogoPDPV";
import { ReactComponent as Icon } from "../../../../assets/svg/BarThin.svg";
import classes from "./Voucher.module.css";

const Voucher = ({ setPrintDiv, refPrint, ...info }) => {
  const { divPrint } = classes;

  return (
    <div className={divPrint} ref={refPrint}>
      <div className="flex flex-row justify-center items-center w-full">
        <LogoLoto xsmall />
        <Icon
          className="hidden sm:block"
          width="0.175rem"
          height="3rem"
          fill="rgb(220, 38, 38)"
        />
        <LogoPDPV xsmall />
      </div>
      <h1 className="text-xl font-semibold text-center mt-2 mb-4 uppercase">
        Recibo de pago
      </h1>
      <div className="flex flex-col gap-2 px-2">
        {Object.entries(info).map(([key, value]) => {
          return (
            <div className="flex flex-row justify-between w-full" key={key}>
              <h1 className="font-semibold">{key}:</h1>
              <h1>{value}</h1>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Voucher;
