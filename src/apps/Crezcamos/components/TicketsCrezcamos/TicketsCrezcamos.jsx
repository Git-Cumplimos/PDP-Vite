import Tickets from "../../../../components/Base/Tickets/Tickets";
import { useImgs } from "../../../../hooks/ImgsHooks";

const TicketsCrezcamos = ({
  refPrint,
  type = "ORIGINAL",
  ticket,
  stateTrx = true,
}) => {
  const {
    imgs: { LogoCrezcamos: LogoPng, pdpHorizontal: LogoPdp },
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
      <div className="flex flex-row mx-2 ">
        <div className="w-30 mx-auto mt-2">
          <div className="aspect-w-14 aspect-h-5">
            <img src={LogoPng} alt="Logo punto de pago"/>
          </div>
          </div>
          <div className="w-30 mx-auto">
            <div className="aspect-w-16 aspect-h-9">
            <img src={LogoPdp} alt="Logo punto de pago"/>
            </div>
        </div>
      </div>
    </Tickets>
  );
};

export default TicketsCrezcamos;