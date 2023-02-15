import React, { Fragment, useState } from "react";
import Select from "../../../components/Base/Select";
import BuscarComercioEmail from "./BuscarComercioEmail";
import PpsObligatorio from "./PpsObligatorio";
import PpsVoluntario from "./PpsVoluntario";

const PpsDomiciliacion = ({ datosDomiciliacion }) => {
  const [tipoPps, setTipoPps] = useState("");
  const [emailVerificado, setEmailVerificado] = useState(true);
  // console.log(datosDomiciliacion);
  return (
    <Fragment>
      {emailVerificado === true ? (
        <Fragment>
          <Select
            onChange={(event) => setTipoPps(event.target.value)}
            id="comissionType" /* para que es esto */
            label="Tipo de PPS"
            options={{
              "": "",
              "Pps Voluntario": "Pps Voluntario",
              // "Pps Obligatorio": "Pps Obligatorio",
            }}
            info={"Seleccione un elemento de la lista"}
          ></Select>
          {tipoPps === "Pps Voluntario" ? (
            <PpsVoluntario datosConsulta={datosDomiciliacion}></PpsVoluntario>
          ) : tipoPps === "Pps Obligatorio" ? (
            <PpsObligatorio datosConsulta={datosDomiciliacion}></PpsObligatorio>
          ) : (
            ""
          )}
        </Fragment>
      ) : (
        <BuscarComercioEmail></BuscarComercioEmail>
      )}
    </Fragment>
  );
};

export default PpsDomiciliacion;
