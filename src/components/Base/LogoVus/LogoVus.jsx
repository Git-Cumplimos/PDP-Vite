import { useImgs } from "../../../hooks/ImgsHooks";
import classes from "./LogoVus.module.css";

const LogoVus = ({ large = false, small = false, xsmall = false }) => {
  const { logoPDP, lgImg, smImg, xsImg } = classes;

  const {
    imgs: { PINVUS: LogoPng },
  } = useImgs();
  return (
    <div
      className={`${logoPDP} ${large ? lgImg : ""} ${small ? smImg : ""} ${
        xsmall ? xsImg : ""
      } ${!large && !small && !xsmall ? small : ""}`}
    >
      <div className="aspect-w-8 aspect-h-9">
        <img src={LogoPng} alt="Logo Pin Vus" />
      </div>
    </div>
  );
};

export default LogoVus;