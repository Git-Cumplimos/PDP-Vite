import { Redirect, Route } from "react-router-dom";
import { useAuth } from "../../../hooks/AuthHooks";

const PrivateRoute = ({ children, ...rest }) => {
  const { isSignedIn } = useAuth();
  return (
    <Route
      {...rest}
      render={({ location }) =>
        isSignedIn ? (
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
