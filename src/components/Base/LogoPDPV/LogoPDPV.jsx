import LogoPng from "../../../assets/img/logosPuntoDePagoVertical.jpg";
import classes from "./LogoPDPV.module.css";

const LogoPDPV = ({ large = false, small = false, xsmall = false }) => {
  const { logoPDP, lgImg, smImg, xsImg } = classes;
  return (
    <div
      className={`${logoPDP} ${large ? lgImg : ""} ${small ? smImg : ""} ${
        xsmall ? xsImg : ""
      } ${!large && !small && !xsmall ? small : ""}`}
    >
      <div className="aspect-w-4 aspect-h-3">
        <img src={LogoPng} alt="Logo punto de pago horizontal" />
      </div>
    </div>
  );
};

export default LogoPDPV;
