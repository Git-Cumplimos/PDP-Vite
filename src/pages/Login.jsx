import { Redirect, useLocation } from "react-router-dom";
import LoginForm from "../components/Compound/LoginForm/LoginForm";
import { useAuth } from "../hooks/AuthHooks";

const Login = () => {
  const auth = useAuth();
  const location = useLocation();
  return !auth.isSignedIn ? (
    <LoginForm />
  ) : (
    <Redirect
      to={
        location.state
          ? location.state.from
          : location.pathname === "/login"
          ? "/"
          : location.pathname
      }
    />
  );
};

export default Login;
