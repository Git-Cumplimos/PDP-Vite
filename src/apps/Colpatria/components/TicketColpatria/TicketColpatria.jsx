import LogoPDP from "../../../../components/Base/LogoPDP";
import { useImgs } from "../../../../hooks/ImgsHooks";
import Tickets from "../../../../components/Base/Tickets/Tickets";

const TicketColpatria = ({
  refPrint,
  type = "ORIGINAL",
  ticket,
  stateTrx = true,
}) => {
  const {
    imgs: { ScotiabankColpatria },
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
      <div className={"my-2 w-72"}>
        <div className="aspect-w-13 aspect-h-1">
          <img
            src={ScotiabankColpatria}
            alt="Logo scotiabank colpatria"
            className="object-center object-cover"
          />
        </div>
      </div>
      <LogoPDP xsmall />
    </Tickets>
  );
};

export default TicketColpatria;
