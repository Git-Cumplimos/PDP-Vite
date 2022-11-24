import React, { useState } from "react";
import Select from "../../../components/Base/Select";
import PpsObligatorioDemanda from "./PpsObligatorioDemanda";
import PpsVoluntarioDemanda from "./PpsVoluntarioDemanda";
import classes from "./TipoPpsADemanda.module.css";
const TipoPpsADemanda = ({ numCed }) => {
  const { contenedorLabel } = classes;
  const [tipoPps, setTipoPps] = useState("");
  return (
    <div>
      {/* */}
      <label className={contenedorLabel}>Tipo de aporte PPS</label>
      <Select
        onChange={(event) => setTipoPps(event.target.value)}
        id="comissionType" /* para que es esto */
        /* label="Tipo de PPS" */
        options={{
          "": "",
          "PPS Voluntario": "Pps Voluntario A Demanda",
          "PPS Obligatorio": "Pps Obligatorio A Demanda",
        }}
        /*  info={"      Seleccione un Tipo de PPS"} */
      ></Select>
      {tipoPps === "Pps Voluntario A Demanda" ? (
        <PpsVoluntarioDemanda ced={numCed}></PpsVoluntarioDemanda>
      ) : tipoPps === "Pps Obligatorio A Demanda" ? (
        <PpsObligatorioDemanda ced={numCed}></PpsObligatorioDemanda>
      ) : (
        ""
      )}
    </div>
  );
};

export default TipoPpsADemanda;
