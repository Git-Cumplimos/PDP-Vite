import React, { Dispatch, SetStateAction } from "react";

import { PropOperadoresComponent } from "../TypeDinamic";
import { useImgs } from "../../../../hooks/ImgsHooks";

import classes from "./LayoutTelefoniaMovil.module.css";
import { notifyError } from "../../../../utils/notify";

//FRAGMENT ********* CONST PARA CSS ***********
const {
  contenedorLayoutTelefoniaMovil,
  zoom,
  li_css,
  operador,
  contenedorImg,
} = classes;

//FRAGMENT ********* COMPONENTE ***********
const LayoutTelefoniaMovil = ({
  operadores,
  setOperadorCurrent,
  loadingPeticionGlobal,
}: {
  operadores: PropOperadoresComponent[];
  setOperadorCurrent: Dispatch<SetStateAction<PropOperadoresComponent | null>>;
  loadingPeticionGlobal: Boolean;
}) => {
  const { svgs }: any = useImgs();
  return (
    <div className={contenedorLayoutTelefoniaMovil}>
      {operadores.map((operadorInd) => (
        <div
          className={contenedorImg}
          onClick={
            loadingPeticionGlobal
              ? () =>
                  notifyError(
                    "No puede seleccionar un nuevo operador, hasta que termine la búsqueda del anterior operador",
                    1000,
                    {
                      toastId: "notify-lot-busqueda",
                    }
                  )
              : () => setOperadorCurrent(operadorInd)
          }
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
