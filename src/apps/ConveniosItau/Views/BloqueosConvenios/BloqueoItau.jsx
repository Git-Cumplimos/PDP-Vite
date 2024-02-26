import { useNavigate } from "react-router-dom";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../components/Base/Button/Button";
import ConsultaConveniosBloqueados from "../../components/ConsultaConveniosBloqueados/ConsultaConveniosBloqueados";

const BloqueoItau = () => {
  const navigate = useNavigate();

  return (
    <>
      <h1 className="text-3xl mt-6">Bloqueo Convenios Itaú</h1>
      <ButtonBar>
        <Button onClick={() => navigate("crear")} type='submit'>
          Registrar Convenio
        </Button>
      </ButtonBar>
      <ConsultaConveniosBloqueados navigate={navigate} />
    </>
  );
};

export default BloqueoItau;