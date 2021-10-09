import { useRef } from "react";
import classes from "./Modal.module.css";

const Modal = ({ handleClose, show, full = false, children }) => {
  const { modal, modalContent, close } = classes;
  const showHideClassName = show ? "flex" : "hidden";
  const hasPadding = full ? "p-0" : "p-6";

  const refModal = useRef();

  window.onclick = function(event) {
    if (event.target === refModal.current) {
      handleClose();
    }
  }

  if (show) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return (
    <div ref={refModal} className={`${modal} ${showHideClassName}`}>
      <section className={`container ${modalContent} ${hasPadding}`}>
        <span className={`bi bi-x ${close}`} onClick={handleClose} />
        {children}
      </section>
    </div>
  );
};

export default Modal;
