import { Redirect, Route } from "react-router-dom";
import { useAuth } from "../../../utils/AuthHooks";

const PrivateRoute = ({ children, role, ...rest }) => {
  const auth = useAuth();
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth.isSignedIn ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};
export default PrivateRoute;
