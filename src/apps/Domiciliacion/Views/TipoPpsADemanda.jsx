import React, { useCallback, useState } from "react";
import Button from "../../../components/Base/Button";
import Select from "../../../components/Base/Select";
import PpsObligatorioDemanda from "./PpsObligatorioDemanda";
import PpsVoluntarioDemanda from "./PpsVoluntarioDemanda";
import classes from "./TipoPpsADemanda.module.css";
const TipoPpsADemanda = ({ numCed, fun }) => {
  const { contenedorLabel } = classes;
  const [tipoPps, setTipoPps] = useState("");

  const borrarData = useCallback(() => {
    setTipoPps("ddfdsfsd");
  }, [tipoPps]);

  /* const borrarData = () => {
    console.log("tipoooooo");
    setTipoPps("");
  }; */
  return (
    <div>
      {/* */}
      <label className={contenedorLabel}>Tipo de aporte PPS</label>
      <Select
        onChange={(event) => setTipoPps(event.target.value)}
        value={tipoPps}
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
        <PpsVoluntarioDemanda
          ced={numCed}
          fun={fun}
          funBorrar={borrarData}
        ></PpsVoluntarioDemanda>
      ) : tipoPps === "Pps Obligatorio A Demanda" ? (
        <PpsObligatorioDemanda ced={numCed} fun={fun}></PpsObligatorioDemanda>
      ) : (
        ""
      )}
      {/*  <Button onClick={() => fun()}>Clic Hijo</Button> */}
    </div>
  );
};

export default TipoPpsADemanda;
