import { Fragment, useState } from "react";
import classes from "./Accordion.module.css";

const { accordion, active, panel } = classes;

const Accordion = ({ children, titulo }) => {
  const [activo, setActivo] = useState(false);

  return (
    <Fragment>
      <button
        className={`${accordion} ${activo ? active : ""}`}
        onClick={(ev) => setActivo((old) => !old)}
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
