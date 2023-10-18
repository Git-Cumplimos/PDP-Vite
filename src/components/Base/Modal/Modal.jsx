import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
      const modalElement = refModal.current;
      const focusableElements = modalElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKeyPress = (event) => {
        console.log(event.key)
        if (event.key === "Tab") {
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          } else if (
            !event.shiftKey &&
            document.activeElement === lastElement
          ) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      };
      modalElement.addEventListener("keydown", handleTabKeyPress);
      return () => {
        modalElement.removeEventListener("keydown", handleTabKeyPress);
      }
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [show]);

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
