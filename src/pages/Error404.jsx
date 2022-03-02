import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/AuthHooks";
import Button from "../components/Base/Button";
import ButtonBar from "../components/Base/ButtonBar";

const Error404 = () => {
  const navigate = useNavigate();
  const { userPermissions, isSignedIn } = useAuth();

  const location = useLocation();

  return isSignedIn ? (
    userPermissions ? (
      <div className="m-auto w-auto md:w-1/2 text-center">
        <h1 className="text-4xl">404</h1>
        <p className="text-2xl">Not found</p>
        <ButtonBar>
          <Button onClick={() => navigate(-1)}>Volver</Button>
          <Button onClick={() => navigate("/", { replace: true })}>
            Ir a inicio
          </Button>
        </ButtonBar>
      </div>
    ) : (
      ""
    )
  ) : (
    <Navigate to={"/login"} replace state={{ from: location }} />
  );
};

export default Error404;
