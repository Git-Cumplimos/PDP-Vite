import Tickets from "../../../../../components/Base/Tickets/Tickets";
import { useImgs } from "../../../../../hooks/ImgsHooks";

const TicketsDale = ({
  refPrint,
  type = "ORIGINAL",
  ticket,
  stateTrx = true,
}) => {
  const {
    imgs: { LogoDale: LogoPng, pdpHorizontal: LogoPdp },
  } = useImgs();

  if (!ticket) {
    return <div>Sin informacion de ticket</div>;
  }

  return (
    <Tickets
      refPrint={refPrint}
      ticket={ticket}
      stateTrx={stateTrx}
      type={type}>
      <div className='flex flex-col mx-2 my-1 gap-1'>
        <div className='flex flex-row justify-center items-center w-full'>
          <div className='flex flex-row mx-auto items-center gap-4'>
            <div className='mx-auto w-20'>
              <div className='aspect-w-16 aspect-h-9'>
                <img src={LogoPdp} alt='Logo punto de pago' />
              </div>
            </div>
            <div className='mx-auto w-20'>
              <div className='aspect-w-15 aspect-h-10'>
                <img src={LogoPng} alt='Logo punto de pago' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Tickets>
  );
};

export default TicketsDale;
