import { useImgs } from "../../../hooks/ImgsHooks";
import classes from "./LogoMiLicencia.module.css";
import LogoPDP from "../LogoPDP/LogoPDP";

const LogoMiLicencia = ({ large = false, small = false, xsmall = false }) => {
  const { logoMiLicencia ,lgImg, smImg, xsImg } = classes;

  const {
    imgs: { MiLicencia: LogoPng },
  } = useImgs();
  return (
    <div className="px-2 flex flex-row flex-nowrap" style={{width: "80mm"}}>
    <LogoPDP xsmall/>
    <div
    className={`${logoMiLicencia} ${large ? lgImg : ""} ${small ? smImg : ""} ${
      xsmall ? xsImg : ""
    } ${!large && !small && !xsmall ? small : ""}`}
    >
    <div className="aspect-w-14 aspect-h-5 my-4">
      <img src={LogoPng} alt="Logo Mi licencia" />
    </div>
  </div>
  </div>
  );
};

export default LogoMiLicencia;
