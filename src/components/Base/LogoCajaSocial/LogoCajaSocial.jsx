import { memo } from "react";
import { useImgs } from "../../../hooks/ImgsHooks";
import classes from "./logoCajaSocial.module.css";
import LogoPDP from "../LogoPDP/LogoPDP";

const logoCajaSocial = memo(
  ({ large = false, small = false, xsmall = false }) => {
    const { logoCajaSocial, lgImg, smImg, xsImg } = classes;

    const {
      imgs: { logoCajaSocial: LogoPng },
    } = useImgs();
    return (
      <div className="mr-3 mb-2 grid" style={{ width: "70mm" }}>
        <div
          className={`${logoCajaSocial} ${large ? lgImg : ""} ${
            small ? smImg : ""
          } ${xsmall ? xsImg : ""} ${!large && !small && !xsmall ? small : ""}`}
          style={{ width: "70mm" }}
        >
          <div className="aspect-w-16 aspect-h-4">
            <img src={LogoPng} alt="Logo punto de pago" />
          </div>
        </div>
        <div
          className="flex flex-row justify-center items-center px-2 mx-16"
          style={{ width: "40mm" }}
        >
          <LogoPDP xsmall />
        </div>
      </div>
    );
  }
);

export default logoCajaSocial;
