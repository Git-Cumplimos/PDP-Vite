import { useImgs } from "../../../hooks/ImgsHooks";
import classes from "./LogoAgrario.module.css";
import LogoPDP from "../LogoPDP/LogoPDP";

const LogoAgrario = ({ large = false, small = false, xsmall = false }) => {
  const { logoAgrario ,lgImg, smImg, xsImg } = classes;

  const {
    imgs: { LogoAgrario: LogoPng },
  } = useImgs();
  return (
    <div className="flex flex-row flex-nowrap ml-5" style={{width:'70mm'}}>
    <div className="flex flex-row flex-nowrap my-10" style={{width:'30mm'}}>
    <LogoPDP xsmall/>
    </div>
    <div
    className={`${logoAgrario} ${large ? lgImg : ""} ${small ? smImg : ""} ${
      xsmall ? xsImg : ""
    } ${!large && !small && !xsmall ? small : ""}`}
    >
    <div className="">
      <img src={LogoPng} alt="Logo Agrario" />
    </div>
  </div>
  </div>
  );
};

export default LogoAgrario;
