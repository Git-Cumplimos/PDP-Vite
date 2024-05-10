import React, { Fragment, useState } from "react";

import ModalAceptarTerminos from "./ModalAceptarTerminos";
import ModalComunication from "./ModalComunication";
import ModalQuestions from "./ModalQuestions";
import ButtonBar from "../../../../../../components/Base/ButtonBar";
import Button from "../../../../../../components/Base/Button";
import Input from "../../../../../../components/Base/Input";
import {
  PropsModalInfoClient,
  TypingShowModalInfoClient,
} from "../../../utils/utils_typing";

const ModalInfoClient = ({ infoClient }: PropsModalInfoClient) => {
  const [showModalInfoClient, setShowModalInfoClient] =
    useState<TypingShowModalInfoClient>(null);
  const [acepto, setAcepto] = useState<boolean>(false);
  return (
    <Fragment>
      <ButtonBar>
        <Button onClick={() => setShowModalInfoClient("Questions")}>
          Preguntas frecuentes
        </Button>
        <Button onClick={() => setShowModalInfoClient("Comunication")}>
          Canales de comunicación
        </Button>
      </ButtonBar>
      <Input
        type="checkbox"
        label="Aceptar Términos y Condiciones"
        required
        value={"acepto"}
        onChange={() =>
          setAcepto((old) => {
            if (!old) {
              setShowModalInfoClient("AceptarTerminos");
              return old;
            } else {
              return false;
            }
          })
        }
        checked={acepto}
      />
      {showModalInfoClient === "Questions" && (
        <ModalQuestions
          setShowModalInfoClient={setShowModalInfoClient}
          showModalInfoClient={showModalInfoClient}
          infoClientConst={infoClient.question.const}
        >
          {infoClient.question.modal}
        </ModalQuestions>
      )}
      {showModalInfoClient === "Comunication" && (
        <ModalComunication
          setShowModalInfoClient={setShowModalInfoClient}
          showModalInfoClient={showModalInfoClient}
          infoClientConst={infoClient.comunication.const}
        >
          {infoClient.comunication.modal}
        </ModalComunication>
      )}
      {showModalInfoClient === "AceptarTerminos" && (
        <ModalAceptarTerminos
          setShowModalInfoClient={setShowModalInfoClient}
          showModalInfoClient={showModalInfoClient}
          setAcepto={setAcepto}
          infoClientConst={infoClient.aceptarTerminos.const}
        >
          {infoClient.aceptarTerminos.modal}
        </ModalAceptarTerminos>
      )}
    </Fragment>
  );
};

export default ModalInfoClient;
