import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/AuthHooks";

const PrivateRoute = ({ children, redirectTo = "/login" }) => {
  const { isSignedIn } = useAuth();
  const location = useLocation();

  if (!isSignedIn) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }
  return children;
};
export default PrivateRoute;
