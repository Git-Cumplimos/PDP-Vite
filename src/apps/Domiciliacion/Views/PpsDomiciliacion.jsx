import React, { Fragment, useState } from "react";
import Select from "../../../components/Base/Select";
import PpsObligatorio from "./PpsObligatorio";
import PpsVoluntario from "./PpsVoluntario";

const PpsDomiciliacion = () => {
  const [tipoPps, setTipoPps] = useState("");
  return (
    <Fragment>
      <Select
        onChange={(event) => setTipoPps(event.target.value)}
        id="comissionType" /* para que es esto */
        label="Tipo de PPS"
        options={{
          "": "",
          "Pps Voluntario": "Pps Voluntario",
          "Pps Obligatorio": "Pps Obligatorio",
        }}
      ></Select>
      {tipoPps === "Pps Voluntario" ? (
        <PpsVoluntario></PpsVoluntario>
      ) : tipoPps === "Pps Obligatorio" ? (
        <PpsObligatorio></PpsObligatorio>
      ) : (
        ""
      )}
    </Fragment>
  );
};

export default PpsDomiciliacion;
