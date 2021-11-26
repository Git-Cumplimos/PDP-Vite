import LogoPng from "../../../assets/img/Loteria_de_Bogota.png";
import classes from "./LogoLoto.module.css";

const LogoLoto = ({ large = false, small = false, xsmall = false }) => {
  const { logoPDP, lgImg, smImg, xsImg } = classes;
  return (
    <div
      className={`${logoPDP} ${large ? lgImg : ""} ${small ? smImg : ""} ${
        xsmall ? xsImg : ""
      } ${!large && !small && !xsmall ? small : ""}`}
    >
      <div className="aspect-w-8 aspect-h-9">
        <img src={LogoPng} alt="Logo loteria de bogota" />
      </div>
    </div>
  );
};

export default LogoLoto;