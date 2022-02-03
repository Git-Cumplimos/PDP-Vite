import { Navigate, useLocation } from "react-router-dom";

import LoginForm from "../components/Compound/LoginForm/LoginForm";
import { useAuth } from "../hooks/AuthHooks";

const Login = () => {
  const { isSignedIn } = useAuth();
  const { state, pathname } = useLocation();

  if (!isSignedIn) {
    return <LoginForm></LoginForm>;
  }

  return (
    <Navigate
      to={state?.from || pathname === "/login" ? "/" : pathname}
    ></Navigate>
  );
};

export default Login;
