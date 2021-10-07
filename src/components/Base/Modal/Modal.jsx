import { useRef } from "react";
import classes from "./Modal.module.css";

const Modal = ({ handleClose, show, children }) => {
  const { modal, modalContent, close } = classes;
  const showHideClassName = show ? "flex" : "hidden";

  const refModal = useRef();

  window.onclick = function(event) {
    if (event.target === refModal.current) {
      handleClose();
    }
  }

  return (
    <div ref={refModal} className={`${modal} ${showHideClassName}`}>
      <section className={`container ${modalContent}`}>
        <span className={`bi bi-x ${close}`} onClick={handleClose} />
        {children}
      </section>
    </div>
  );
};

export default Modal;
