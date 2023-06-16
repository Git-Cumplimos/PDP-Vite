import LogoVus from "../../../../components/Base/LogoVus/LogoVus";
import LogoMiLicencia from "../../../../components/Base/LogoMiLicencia";
import Tickets from "../../../../components/Base/Tickets/Tickets";

const TicketsPines = ({
  refPrint,
  type = "ORIGINAL",
  ticket,
  stateTrx = true,
  logo,
}) => {
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
      {logo === "LogoVus" ? <LogoVus xsmall /> : <LogoMiLicencia xsmall />}
    </Tickets>
  );
};

export default TicketsPines;
