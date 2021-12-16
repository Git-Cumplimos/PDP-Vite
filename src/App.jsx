import Amplify from "aws-amplify";
import awsconfig from "./aws-exports";

import { useAuth } from "./hooks/AuthHooks";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";
import LoginLayout from "./layouts/LoginLayout/LoginLayout";
import { Switch } from "react-router-dom";
import { useUrls } from "./hooks/UrlsHooks";

Amplify.configure(awsconfig);

function App() {
  const { cognitoUser, isSignedIn } = useAuth();
  const { allRoutes } = useUrls();

  return cognitoUser && isSignedIn ? (
    <AdminLayout>
      <Switch>{allRoutes}</Switch>
    </AdminLayout>
  ) : (
    <LoginLayout>
      <Switch>{allRoutes}</Switch>
    </LoginLayout>
  );
}

export default App;
