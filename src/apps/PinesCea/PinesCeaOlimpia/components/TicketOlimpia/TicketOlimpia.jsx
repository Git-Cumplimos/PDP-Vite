import { useImgs } from "../../../../../hooks/ImgsHooks";
import Tickets from "../../../../../components/Base/Tickets/Tickets";

const TicketOlimpia = ({
  refPrint,
  type = "ORIGINAL",
  ticket,
  stateTrx = true,
}) => {
  const {
    imgs: { pdpHorizontal: LogoPng },
  } = useImgs();

  if (!ticket) {
    return <div>Sin informacion de ticket</div>;
  }

  return (
    <Tickets
      refPrint={refPrint}
      ticket={ticket}
      stateTrx={stateTrx}
      type={type}
    >
      <div className="flex flex-col items-center">
        <div className="w-30">
          <div className="aspect-w-16 aspect-h-9">
            <img src={LogoPng} alt="Logo punto de pago" />
          </div>
        </div>
      </div>
    </Tickets>
  );
};

export default TicketOlimpia;
