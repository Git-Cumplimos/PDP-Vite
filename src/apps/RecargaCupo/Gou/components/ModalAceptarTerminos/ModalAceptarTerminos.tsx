import React, { useCallback, useEffect, useState } from "react";
import Modal from "../../../../../components/Base/Modal";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Button from "../../../../../components/Base/Button";

type Props = {
  acepto: boolean;
  setAcepto: any;
};

const ModalAceptarTerminos = ({ acepto, setAcepto }: Props) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    if (acepto) {
      setShowModal(true);
    }
  }, [acepto]);

  const onClickAcepto = useCallback(() => {
    setAcepto((old: any) => ({ ...old, acepto: true }));
    setShowModal(false);
  }, [setAcepto]);

  const handleCloseModal = useCallback(() => {
    setAcepto((old: any) => ({ ...old, acepto: false }));
    setShowModal(false);
  }, [setAcepto]);

  return (
    <Modal show={showModal} handleClose={handleCloseModal}>
      <PaymentSummary title="Aceptar Terminos y condiciones" subtitle="">
        <ButtonBar>
          <Button type={"submit"} onClick={onClickAcepto}>
            Aceptar
          </Button>
          <Button onClick={() => handleCloseModal()}>Cerrar</Button>
        </ButtonBar>
      </PaymentSummary>
    </Modal>
  );
};

export default ModalAceptarTerminos;
