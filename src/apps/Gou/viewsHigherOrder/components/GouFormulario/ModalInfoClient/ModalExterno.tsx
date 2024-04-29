import React, { Fragment } from "react";

import ModalAceptarTerminos from "./ModalAceptarTerminos";
import ModalComunication from "./ModalComunication";
import ModalQuestions from "./ModalQuestions";
import { PropsModalExterno } from "./TypingModalInfoClient";
import { constComunication, constQuestion } from "./Const";

const ModalExterno = ({
  showModalInfoClient,
  setShowModalInfoClient,
  setAcepto,
}: PropsModalExterno) => {
  return (
    <Fragment>
      {showModalInfoClient === "Questions" && (
        <ModalQuestions
          constInfo={constQuestion}
          setShowModalInfoClient={setShowModalInfoClient}
          showModalInfoClient={showModalInfoClient}
        ></ModalQuestions>
      )}
      {showModalInfoClient === "Comunication" && (
        <ModalComunication
          constInfo={constComunication}
          setShowModalInfoClient={setShowModalInfoClient}
          showModalInfoClient={showModalInfoClient}
        ></ModalComunication>
      )}
      {showModalInfoClient === "AceptarTerminos" && (
        <ModalAceptarTerminos
          constInfo={constComunication}
          setShowModalInfoClient={setShowModalInfoClient}
          showModalInfoClient={showModalInfoClient}
          setAcepto={setAcepto}
        ></ModalAceptarTerminos>
      )}
    </Fragment>
  );
};

export default ModalExterno;
