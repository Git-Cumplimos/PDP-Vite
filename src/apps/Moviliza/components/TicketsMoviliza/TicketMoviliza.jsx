import { useImgs } from "../../../../hooks/ImgsHooks";
import Tickets from "../../../../components/Base/Tickets/Tickets";

const TicketMoviliza = ({
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
        <div className={"w-64"}>
          <div className="aspect-w-13 aspect-h-1">
          </div>
        </div>
        <div className="w-30">
          <div className="aspect-w-16 aspect-h-9">
            <img src={LogoPng} alt="Logo punto de pago" />
          </div>
        </div>
      </div>
    </Tickets>
  );
};

export default TicketMoviliza;
