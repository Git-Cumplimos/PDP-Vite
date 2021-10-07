import { useHistory } from "react-router-dom";
import { useAuth } from "../../../utils/AuthHooks";

const AuthButton = () => {
  const auth = useAuth();

  const history = useHistory();

  return auth.isSignedIn ? (
    <button
      // className="px-4 py-2 rounded-md text-white"
      // style={{
      //   backgroundColor: "var(--primary)",
      // }}
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
