import { useRef } from "react";
import classes from "./Modal.module.css";

const Modal = ({
  handleClose,
  show,
  full = false,
  bigger = false,
  children,
}) => {
  const { modal, modalContent, close } = classes;
  const hasPadding = full ? "p-0" : "p-6";
  const limit = !bigger ? "md:max-w-2xl" : "";

  const refModal = useRef();

  window.onclick = function (event) {
    if (event.target === refModal.current && handleClose) {
      handleClose?.();
    }
  };

  if (show) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return show ? (
    <div ref={refModal} className={`${modal} flex`}>
      <section className={`container ${limit} ${modalContent} ${hasPadding}`}>
        {handleClose && (
          <span
            className={`bi bi-x ${close}`}
            onClick={() => handleClose?.()}
          />
        )}
        <br />
        {children}
      </section>
    </div>
  ) : (
    <></>
  );
};

export default Modal;
