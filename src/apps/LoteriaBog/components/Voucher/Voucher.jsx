import classes from "./Voucher.module.css";

const Voucher = ({ setPrintDiv, refPrint, ...info }) => {
  const { divPrint } = classes;

  return (
    <div className={divPrint} ref={refPrint}>
      {Object.entries(info).map(([key, value]) => {
        return (
          <div className="flex flex-row justify-between w-full" key={key}>
            <h1>{key}:</h1>
            <h1>{value}</h1>
          </div>
        );
      })}
    </div>
  );
};

export default Voucher;
