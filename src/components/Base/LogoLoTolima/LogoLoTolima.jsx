import { useImgs } from "../../../hooks/ImgsHooks";
import LogoPDP from "../LogoPDP/LogoPDP"

const LogoLoTolima = () => {

  const {
    imgs: { Loteria_de_Tolima: LogoPng },
  } = useImgs();
  return (
    <div className="flex flex-row flex-nowrap justify-center items-center" >
      <div className="mx-2" style={{ display: 'inline-block', maxWidth: '45%' }}>
        <img src={LogoPng} alt="Logo loteria de tolima" />
      </div>
      <LogoPDP xsmall/>
    </div>
  );
};

export default LogoLoTolima;