import React, { Fragment, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import TicketsAval from "../TicketsAval";

const InfRecibo = ({ infTicket, HandleClose }) => {
  const printDiv = useRef();
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  return (
    <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
      {infTicket && (
        <Fragment>
          <TicketsAval refPrint={printDiv} ticket={infTicket} />
          <ButtonBar>
            <Button onClick={handlePrint}>Imprimir</Button>
            <Button onClick={HandleClose}>Cerrar</Button>
          </ButtonBar>
        </Fragment>
      )}
    </div>
  );
};

export default InfRecibo;
