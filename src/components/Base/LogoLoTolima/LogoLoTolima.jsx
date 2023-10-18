import { useImgs } from "../../../hooks/ImgsHooks";
import LogoPDP from "../LogoPDP/LogoPDP"

const LogoLoTolima = () => {

  const {
    imgs: { Loteria_de_Tolima: LogoPng },
  } = useImgs();
  return (
    <div className="flex flex-row flex-nowrap justify-center items-center" >
      <div style={{width:'80%',height:'100%'}}>
        <img src={LogoPng} alt="Logo loteria de tolima" style={{width:'100%',height:'87px'}}/>
      </div>
      <LogoPDP xsmall/>
    </div>
  );
};

export default LogoLoTolima;