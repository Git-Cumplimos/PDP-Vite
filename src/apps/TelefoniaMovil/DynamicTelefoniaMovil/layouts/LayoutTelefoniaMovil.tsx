import React, { useRef } from "react";

import { PropOperadoresComponent } from "../utils/TypesUtils";
import { useImgs } from "../../../../hooks/ImgsHooks";

import classes from "./LayoutTelefoniaMovil.module.css";

const {
  contenedorLayoutTelefoniaMovil,
  zoom,
  li_css,
  operador,
  contenedorImg,
} = classes;

const LayoutTelefoniaMovil = ({
  operadores,
  operadorCurrent,
  setOperadorCurrent,
}: {
  operadores: PropOperadoresComponent[];
  operadorCurrent: any;
  setOperadorCurrent: any;
}) => {
  const { svgs }: any = useImgs();

  return (
    <div className={contenedorLayoutTelefoniaMovil}>
      {operadores.map((operadorInd) => (
        <div
          className={contenedorImg}
          onClick={() => {
            setOperadorCurrent(operadorInd);
          }}
        >
          <nav>
            <ul>
              <li className={li_css}>
                <img
                  className={zoom}
                  // className="w-24 transition duration-150 ease-out hover:ease-in"
                  src={
                    operadorInd?.logo?.includes("http")
                      ? operadorInd?.logo
                      : svgs?.[operadorInd?.logo]
                  }
                  alt={operadorInd?.name}
                />
                <h1 className={operador}>{operadorInd.name}</h1>
              </li>
            </ul>
          </nav>
        </div>
      ))}
    </div>
  );
};

export default LayoutTelefoniaMovil;
