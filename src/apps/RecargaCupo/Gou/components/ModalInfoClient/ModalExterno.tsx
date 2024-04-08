import React, { Fragment } from "react";
import { constComunication, constQuestion } from "./Const";
import ModalComunication from "./ModalComunication";
import ModalQuestions from "./ModalQuestions";

//FRAGMENT ******************** Typing *******************************
type PropsModalExterno = {
  showModalInfoClient: any;
  setShowModalInfoClient: any;
};

const ModalExterno = ({
  showModalInfoClient,
  setShowModalInfoClient,
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
    </Fragment>
  );
};

export default ModalExterno;
