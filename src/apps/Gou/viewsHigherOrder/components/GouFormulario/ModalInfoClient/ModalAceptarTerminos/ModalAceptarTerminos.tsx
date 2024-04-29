import React from "react";
import Modal from "../../../../../../../components/Base/Modal";
import PaymentSummary from "../../../../../../../components/Compound/PaymentSummary";
import ButtonBar from "../../../../../../../components/Base/ButtonBar";
import Button from "../../../../../../../components/Base/Button";
import { PropsModalInternoAcepto } from "../TypingModalInfoClient";

//FRAGMENT ******************** COMPONENT *******************************
const ModalAceptarTerminos = ({
  constInfo,
  showModalInfoClient,
  setShowModalInfoClient,
  setAcepto,
}: PropsModalInternoAcepto) => {
  return (
    <Modal
      show={showModalInfoClient !== null ? true : false}
      handleClose={() => setShowModalInfoClient(null)}
    >
      <PaymentSummary title="Aceptar Términos y condiciones" subtitle="">
        <ButtonBar>
          <></>
          <Button
            type={"submit"}
            onClick={() => {
              setAcepto(true);
              setShowModalInfoClient(null);
            }}
          >
            Aceptar
          </Button>
          <Button onClick={() => setShowModalInfoClient(null)}>Cerrar</Button>
        </ButtonBar>
      </PaymentSummary>
    </Modal>
  );
};

export default ModalAceptarTerminos;
