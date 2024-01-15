import React, { Dispatch, SetStateAction } from "react";

import { PropOperadoresComponent } from "../TypeDinamic";
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
  setOperadorCurrent,
}: {
  operadores: PropOperadoresComponent[];
  setOperadorCurrent: Dispatch<SetStateAction<PropOperadoresComponent | null>>;
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
                  src={`${svgs?.TELEFONIA_MOVIL}${operadorInd?.logo}`}
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
