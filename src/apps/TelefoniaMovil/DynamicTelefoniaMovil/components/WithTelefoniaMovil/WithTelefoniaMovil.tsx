import React, { Fragment, FunctionComponent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { notifyError } from "../../../../../utils/notify";
import { useImgs } from "../../../../../hooks/ImgsHooks";

import { PropOperadoresComponent } from "../../TypeDinamic";
import useHookFetchLayouts, {
  errorFront_servicio,
} from "../../hook/useHookFetchLayouts";
import LayoutTelefoniaMovil from "../../layouts/LayoutTelefoniaMovil";

import classes from "./WithTelefoniaMovil.module.css";
import { ErrorCustomFetch } from "../../utils/utils";

const { Lineadivisora, Mensaje } = classes;

const WithTelefoniaMovil = (
  ComponectBody: FunctionComponent<any>,
  componectName: string
) => {
  const [operadores, setOperadores] = useState<PropOperadoresComponent[]>([]);
  const [operadorCurrent, setOperadorCurrent] =
    useState<PropOperadoresComponent | null>(null);
  const [loadingPeticionOperadores, peticionOperadores] = useHookFetchLayouts(
    componectName.toLowerCase()
  );

  const validNavigate = useNavigate();

  const { svgs }: any = useImgs();

  useEffect(() => {
    peticionOperadores()
      .then((resPromise: PropOperadoresComponent[]) => {
        if (resPromise?.length === 0) {
          notifyError(
            `En el modulo ${componectName.toLowerCase()} ningún operador tiene permisos para este usuario`,
            5000,
            { toastId: "notify-not-permission" }
          );
          validNavigate("/telefonia-movil");
        } else {
          setOperadores(resPromise);
          setOperadorCurrent(resPromise?.[0]);
        }
      })
      .catch((error: any) => {
        if (!(error instanceof ErrorCustomFetch)) {
          notifyError(errorFront_servicio, 5000, { toastId: "notify-module" });
          console.error("Error respuesta Front-end PDP", {
            "Error PDP": errorFront_servicio,
            "Error Sequence":
              "WithTelefoniaMovil - Error en sin controla en el modulo",
            "Error Console": `${error.message}`,
          });
        }
        validNavigate("/telefonia-movil");
      });
  }, [peticionOperadores, componectName, validNavigate]);

  return (
    <div>
      {operadores.length > 0 && operadorCurrent !== null ? (
        <LayoutTelefoniaMovil
          operadores={operadores}
          operadorCurrent={operadorCurrent}
          setOperadorCurrent={setOperadorCurrent}
        />
      ) : (
        <></>
      )}

      {operadores.length === 0 && loadingPeticionOperadores ? (
        <h1 className={Mensaje}>Buscando operadores disponibles</h1>
      ) : (
        <></>
      )}

      <div className={Lineadivisora}></div>
      {operadores.length > 0 && operadorCurrent !== null ? (
        <ComponectBody operadorCurrent={operadorCurrent}>
          <img
            className="w-24 "
            src={
              operadorCurrent?.logo?.includes("http")
                ? operadorCurrent?.logo
                : svgs?.[operadorCurrent?.logo]
            }
          ></img>
        </ComponectBody>
      ) : (
        <></>
      )}
    </div>
  );
};

export default WithTelefoniaMovil;
