import { memo } from "react";
import { useImgs } from "../../../hooks/ImgsHooks";
import classes from "./LogoPDP.module.css";

const LogoPDP = memo(({ large = false, small = false, xsmall = false }) => {
  const { logoPDP, lgImg, smImg, xsImg } = classes;

  const {
    imgs: { pdpHorizontal: LogoPng },
  } = useImgs();
  return (
    <div
      className={`${logoPDP} ${large ? lgImg : ""} ${small ? smImg : ""} ${
        xsmall ? xsImg : ""
      } ${!large && !small && !xsmall ? small : ""}`}
    >
      <div className="aspect-w-13 aspect-h-7">
        <img src={LogoPng} alt="Logo punto de pago" />
      </div>
    </div>
  );
});

export default LogoPDP;
