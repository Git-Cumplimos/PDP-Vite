import { useNavigate } from "react-router-dom";
import Button from "../components/Base/Button";
import ButtonBar from "../components/Base/ButtonBar";

const Error403 = () => {
  const navigate = useNavigate();

  return (
    <div className="m-auto w-auto md:w-1/2 text-center">
      <h1 className="text-4xl">403</h1>
      <p className="text-2xl">Prohibido (Sin permisos)</p>
      <ButtonBar>
        <Button onClick={() => navigate(-1)}>Volver</Button>
        <Button onClick={() => navigate("/", { replace: true })}>
          Ir a inicio
        </Button>
      </ButtonBar>
    </div>
  );
};

export default Error403;
