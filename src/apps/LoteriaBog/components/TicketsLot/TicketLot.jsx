import Tickets from "../../../../components/Base/Tickets/Tickets";
import { useImgs } from "../../../../hooks/ImgsHooks";

const TicketLot = ({
  refPrint,
  type = "ORIGINAL",
  ticket,
  stateTrx = true,
  loteria,
}) => {
  const {
    imgs: {
      Loteria_de_Bogota,
      Loteria_de_Tolima,
      Loteria_de_Cundinamarca,
      pdpHorizontal: LogoPdp,
    },
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
      chunkSizeTrx={3}
    >
      {loteria === "Lotería de Bogotá" ? (
        <div className="flex flex-row gap-4 mx-2 items-center">
          <div className="mx-auto w-20">
            <div className="aspect-w-1 aspect-h-1">
              <img src={Loteria_de_Bogota} alt="Logo loteria bogota" />
            </div>
          </div>
          <div className="mx-auto w-30">
            <div className="aspect-w-16 aspect-h-9">
              <img src={LogoPdp} alt="Logo punto de pago" />
            </div>
          </div>
        </div>
      ) : loteria === "Lotería del Tolima" ? (
        <div className="flex flex-row gap-4 mx-2 items-center">
          <div className="w-30 mx-auto">
            <div className="aspect-w-5 aspect-h-3">
              <img src={Loteria_de_Tolima} alt="Logo loteria tolima" />
            </div>
          </div>
          <div className="mx-auto w-30">
            <div className="aspect-w-16 aspect-h-9">
              <img src={LogoPdp} alt="Logo punto de pago" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-row mx-2">
          <div className="w-30 mx-auto">
            <div className="aspect-w-16 aspect-h-8">
              <img src={Loteria_de_Cundinamarca} alt="Logo loteria cundinamarca" />
            </div>
          </div>
          <div className="mx-auto w-30">
            <div className="aspect-w-16 aspect-h-9">
              <img src={LogoPdp} alt="Logo punto de pago" />
            </div>
          </div>
        </div>
      )}
    </Tickets>
  );
};

export default TicketLot;
