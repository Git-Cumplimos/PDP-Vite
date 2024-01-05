import React, { ReactNode, useRef } from "react";
import Tickets from "../../../../components/Base/Tickets";
import { useReactToPrint } from "react-to-print";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";

type Props = {
  children?: ReactNode
  title?: ReactNode
  ticketData?: any
  ticketType?: string
};

const TicketBlock = ({ ticketData, title, children, ticketType = "Reimpresión" }: Props) => {
  const printDiv = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  return (
    <div className="grid grid-flow-row auto-rows-max place-content-between justify-center items-center h-full">
      {title}
      <Tickets
        refPrint={printDiv}
        ticket={ticketData}
        type={ticketType}
        stateTrx
      />
      <ButtonBar>
        <Button onClick={handlePrint}>Imprimir</Button>
        {children}
      </ButtonBar>
    </div>
  );
};

export default TicketBlock;
