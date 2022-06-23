import { Navigate, useLocation } from "react-router-dom";

import LoginForm from "../../components/Compound/LoginForm";
import { useAuth } from "../../hooks/AuthHooks";

const Login = () => {
  const { isSignedIn } = useAuth();
  const { state, pathname } = useLocation();

  if (!isSignedIn) {
    return <LoginForm />;
  }

  return (
    <Navigate
      to={
        state?.from?.pathname
          ? state?.from?.pathname
          : pathname === "/login"
          ? "/"
          : pathname
      }
    ></Navigate>
  );
};

export default Login;
