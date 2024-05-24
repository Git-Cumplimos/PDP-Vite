import Tickets from "../../../../../components/Base/Tickets/Tickets";
import { useImgs } from "../../../../../hooks/ImgsHooks";

const TicketsItau = ({
  refPrint,
  type = "ORIGINAL",
  ticket,
  stateTrx = true,
}) => {
  const {
    imgs: { logoItau: LogoPng, pdpHorizontal: LogoPdp },
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
      whitespaceDisclaimer={true}
    >
      <div className="flex flex-col mx-2 my-1 gap-1">
        <div className="flex flex-row justify-center items-center w-full">
          <div className="flex flex-row mx-auto items-center gap-4">
            <div className="mx-auto w-30 h-14">
              <div className="aspect-w-20 aspect-h-20">
                <img src={LogoPdp} alt="Logo punto de pago" />
              </div>
            </div>
            <div className="mx-auto w-22 h-22">
              <div className="aspect-w-5 aspect-h-5">
                <img
                  src={LogoPng}
                  alt="Logo punto de pago"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Tickets>
  );
};

export default TicketsItau;
