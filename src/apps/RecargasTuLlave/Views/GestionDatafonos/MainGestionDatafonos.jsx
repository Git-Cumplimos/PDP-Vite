import { useNavigate } from "react-router-dom";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../components/Base/Button/Button";
import ConsultaDatafonos from "../../components/ConsultaDatafonos/ConsultaDatafonos";

const MainGestionDatafonos = () => {
  const navigate = useNavigate();

  return (
    <>
      <ButtonBar>
        <Button onClick={() => navigate("crear")} type='submit'>
          Asociar Datáfono
        </Button>
      </ButtonBar>
      <ConsultaDatafonos navigate={navigate} />
    </>
  );
};

export default MainGestionDatafonos;
