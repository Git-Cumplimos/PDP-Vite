import LogoPng from "../../../assets/img/logosPuntoDePagoHorizontal.png";
import classes from "./LogoPDP.module.css";

const LogoPDP = ({ large = false, small = false, xsmall = false }) => {
  const { logoPDP, lgImg, smImg, xsImg } = classes;
  return (
    <div
      className={`${logoPDP} ${large ? lgImg : ""} ${small ? smImg : ""} ${
        xsmall ? xsImg : ""
      } ${!large && !small && !xsmall ? small : ""}`}
    >
      <div className="aspect-w-4 aspect-h-1">
        <img src={LogoPng} alt="Logo punto de pago" />
      </div>
    </div>
  );
};

export default LogoPDP;