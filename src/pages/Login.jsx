import { Redirect } from "react-router-dom";
import LoginForm from "../components/Compound/LoginForm/LoginForm";
import { useAuth } from "../utils/AuthHooks";

const Login = () => {
  const auth = useAuth();
  return !auth.isSignedIn ? <LoginForm /> : <Redirect to="/" />;
};

export default Login;
