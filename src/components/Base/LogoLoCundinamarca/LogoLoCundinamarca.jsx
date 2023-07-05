import { useImgs } from "../../../hooks/ImgsHooks";
import LogoPDP from "../LogoPDP/LogoPDP"

const LogoLoCundinamarca = () => {

  const {
    imgs: { Loteria_de_Cundinamarca: LogoPng },
  } = useImgs();
  return (
    <div className="flex flex-row flex-nowrap justify-center items-center" >
      <div style={{ display: 'inline-block', maxWidth: '50%' }}>
        <img src={LogoPng} alt="Logo loteria de Cundinamarca" />
      </div>
      <LogoPDP xsmall/>
    </div>
  );
};

export default LogoLoCundinamarca;