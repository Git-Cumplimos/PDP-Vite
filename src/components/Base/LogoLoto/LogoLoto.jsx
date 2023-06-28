import { useImgs } from "../../../hooks/ImgsHooks";
import LogoPDP from "../LogoPDP/LogoPDP"

const LogoLoto = () => {

  const {
    imgs: { Loteria_de_Bogota: LogoPng },
  } = useImgs();
  return (
    <div className="flex flex-row flex-nowrap justify-center items-center p-2" >
      <div className="p-1 mx-2" style={{ display: 'inline-block', maxWidth: '30%' }}>
        <img src={LogoPng} alt="Logo loteria de bogota" />
      </div>
      <LogoPDP xsmall/>
    </div>
  );
};

export default LogoLoto;
