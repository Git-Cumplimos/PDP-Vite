import { Redirect, useHistory, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthHooks";
import Button from "../components/Base/Button/Button";
import ButtonBar from "../components/Base/ButtonBar/ButtonBar";

const Error404 = () => {
  const { goBack, replace } = useHistory();
  const { userPermissions, isSignedIn } = useAuth();

  const location = useLocation();

  return isSignedIn ? (
    userPermissions ? (
      <div className="m-auto w-auto md:w-1/2 text-center">
        <h1 className="text-4xl">404</h1>
        <p className="text-2xl">Not found</p>
        <ButtonBar>
          <Button onClick={goBack}>Volver</Button>
          <Button onClick={() => replace("/")}>Ir a inicio</Button>
        </ButtonBar>
      </div>
    ) : (
      ""
    )
  ) : (
    <Redirect
      to={{
        pathname: "/login",
        state: { from: location },
      }}
    />
  );
};

export default Error404;
