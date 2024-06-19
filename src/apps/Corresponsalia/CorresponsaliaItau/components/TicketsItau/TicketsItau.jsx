import Tickets from "../../../../../components/Base/Tickets/Tickets";
import { useImgs } from "../../../../../hooks/ImgsHooks";

const logoSize = 79.9;
const margin = logoSize / 3;
const marginLeft = 2 * margin;

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
      <div className="flex flex-col">
        <div className="">
          <div className="flex flex-row" style={{width:'301px', marginTop: '-8px'}}>
            <div className="mx-auto w-30 h-14">
              <div style={{margin: '0px'}}>
                <img src={LogoPdp} 
                alt="Logo punto de pago" 
                style={{marginTop: '30px'}}/>
              </div>
            </div>
            <div>
              <div style={{marginLeft: '-29px'}}>
                <img
                  src={LogoPng}
                  width={79.9}
                  height={79.9}
                  alt="Logo punto de pago"
                  className="object-contain"
                  style={{margin: `${margin}px`, marginLeft: `${marginLeft}px`}}
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
