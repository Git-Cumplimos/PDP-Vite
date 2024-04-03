import { Fragment, useState } from "react";
import classes from "./Accordion.module.css";

const { accordion, active, panel } = classes;

const Accordion = ({ children, titulo, activated = false }) => {
  const [activo, setActivo] = useState(activated);

  return (
    <Fragment>
      <button
        className={`${accordion} ${activo ? active : ""}`}
        onClick={(ev) => setActivo((old) => !old)}
        type="button"
      >
        {titulo}
      </button>
      <div className={`${panel} ${activo ? "block" : "hidden"}`}>
        {children}
      </div>
    </Fragment>
  );
};

export default Accordion;
