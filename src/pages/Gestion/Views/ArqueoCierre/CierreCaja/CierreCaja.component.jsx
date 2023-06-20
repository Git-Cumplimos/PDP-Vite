import { Fragment, useState } from "react";
import "./CierreCaja.style.css";

const Accordion = ({ children, titulo, estiloTitulo }) => {
  const [activo, setActivo] = useState(false);

  return (
    <Fragment>
      <button
        className={`${estiloTitulo ? "accordion tittle": "accordion"} ${activo ? "active" : ""}`}
        onClick={(ev) => setActivo((old) => !old)}
      >
        {titulo}
      </button>
      <div className={`${"panel"} ${activo ? "block" : "hidden"}`}>
        {children}
      </div>
    </Fragment>
  );
};

export default Accordion;
