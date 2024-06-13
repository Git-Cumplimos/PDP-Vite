import { useNavigate } from "react-router-dom";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../components/Base/Button/Button";
import ConsultaComerciosBloqueados from "../../components/ConsultaComerciosBloqueados/ConsultaComerciosBloqueados";

const BloqueoComerciosCierre = () => {
  const navigate = useNavigate();

  return (
    <>
      <h1 className="text-3xl mt-6">Bloqueo Comercios Por Cierre Financiero</h1>
      <ButtonBar>
        <Button onClick={() => navigate("crear")} type='submit'>
          Bloquear Comercio
        </Button>
        <Button  type='submit'>
          Bloqueo - Desbloqueo Masivo
        </Button>
      </ButtonBar>
      <ConsultaComerciosBloqueados navigate={navigate} />
    </>
  );
};

export default BloqueoComerciosCierre;