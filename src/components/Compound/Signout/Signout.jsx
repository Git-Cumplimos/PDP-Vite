import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/AuthHooks";

const AuthButton = () => {
  const { isSignedIn, signOut } = useAuth();

  const navigate = useNavigate();

  return isSignedIn ? (
    <button
      onClick={() => {
        signOut();
        navigate("/login", { replace: true });
      }}
    >
      Cerrar sesion
    </button>
  ) : (
    ""
  );
};

export default AuthButton;
