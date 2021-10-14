import { useHistory } from "react-router-dom";
import { useAuth } from "../../../utils/AuthHooks";

const AuthButton = () => {
  const auth = useAuth();

  const history = useHistory();

  return auth.isSignedIn ? (
    <button
      onClick={() => {
        auth.signOut();
        history.push("/login");
      }}
    >
      Cerrar sesion
    </button>
  ) : (
    ""
  );
};

export default AuthButton;
