import { Fragment, useCallback, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import ButtonLink from "../../../../components/Base/ButtonLink/ButtonLink";
import Modal from "../../../../components/Base/Modal/Modal";
import Tickets from "../../../../components/Base/Tickets/Tickets";
import RefsForm from "../RefsForm/RefsForm";

const initFoundsVal = [
  ["Numero de contrato", "12424324"],
  ["Documento", "1080100200"],
  ["Telefono", "3002004530"],
  ["Valor", "$35,000"],
];

const FlujoRecaudo = ({ foundRefs, opts }) => {
  const [brokerData, setBrokerData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const onSubmitRefs = useCallback((e) => {
    e.preventDefault();
    setBrokerData(initFoundsVal);
  }, []);

  const onSubmitPayment = useCallback((e) => {
    e.preventDefault();
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const onMakePayment = useCallback(() => {
    setPaymentStatus(true);
  }, []);

  return (
    <Fragment>
      <RefsForm
        data={brokerData ? brokerData : foundRefs}
        onSubmit={brokerData ? onSubmitPayment : onSubmitRefs}
        btnName={brokerData ? "Confirmar pago" : "Consultar"}
      />
      <Modal
        show={showModal}
        handleClose={paymentStatus ? () => {} : closeModal}
      >
        {paymentStatus ? (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <Tickets refPrint={printDiv} />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <ButtonLink to="/recaudo">Cerrar</ButtonLink>
            </ButtonBar>
          </div>
        ) : (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <h1>¿Esta seguro de realizar el pago?</h1>
            <h1>Resumen de pago</h1>
            <ButtonBar>
              <Button onClick={onMakePayment}>Aceptar</Button>
              <Button onClick={closeModal}>Cancelar</Button>
            </ButtonBar>
          </div>
        )}
      </Modal>
    </Fragment>
  );
};

export default FlujoRecaudo;
