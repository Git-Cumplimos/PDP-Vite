import React, { Fragment, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Tickets from "../../../../../components/Base/Tickets";

const ModalTicket = ({ infTicket, handleClose2 }) => {
  const printDiv = useRef();
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  return (
    <Fragment>
      <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
        <Tickets refPrint={printDiv} ticket={infTicket} />
        <ButtonBar>
          <Button onClick={handlePrint}>Imprimir</Button>
          <Button onClick={handleClose2}>Cerrar</Button>
        </ButtonBar>
      </div>
    </Fragment>
  );
};

export default ModalTicket;
