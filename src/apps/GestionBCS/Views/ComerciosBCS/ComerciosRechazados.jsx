import { useNavigate } from "react-router-dom";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../components/Base/Button/Button";
import ConsultaComerciosRechazados from "../../components/ConsultaComerciosRechazados/ConsultaComerciosRechazados";

const ComerciosRechazados = () => {
  const navigate = useNavigate();

  return (
    <>
      <h1 className="text-3xl mt-6">Comercios Rechazados Por BCS</h1>
      <ButtonBar>
        {/* <Button onClick={() => navigate("crear")} type='submit'>
          Registrar Convenio
        </Button> */}
      </ButtonBar>
      <ConsultaComerciosRechazados navigate={navigate} />
    </>
  );
};

export default ComerciosRechazados;