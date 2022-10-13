import React, { useState } from "react";
import Select from "../../../components/Base/Select";
import PpsObligatorioDemanda from "./PpsObligatorioDemanda";
import PpsVoluntarioDemanda from "./PpsVoluntarioDemanda";

const TipoPpsADemanda = ({ numCed }) => {
  const [tipoPps, setTipoPps] = useState("");
  return (
    <div>
      {/*    TipoPpsADemandatipocedula,cedula,numerocelular,valoraportar,se debe
      consultar si esta domiciliado hacer el registro en la tabla de
      transacciones preguntar alguno,consumir el servicio de crear planilla */}

      <Select
        onChange={(event) => setTipoPps(event.target.value)}
        id="comissionType" /* para que es esto */
        label="Tipo de PPS"
        options={{
          "": "",
          "Pps Voluntario": "Pps Voluntario A Demanda",
          "Pps Obligatorio": "Pps Obligatorio A Demanda",
        }}
        info={"Seleccione un elemento de la lista"}
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
