import { useEffect } from "react";

import Amplify from "aws-amplify";
import awsconfig from "./aws-exports";

import { useAuth } from "./utils/AuthHooks";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";

Amplify.configure(awsconfig);

function App() {
  const { cognitoUser, isSignedIn } = useAuth();

  console.log(cognitoUser, isSignedIn);

  useEffect(() => {
    if (cognitoUser && isSignedIn) {
      document.body.classList.remove("loginBackground");
      document.body.classList.add("loggedBackground");
    } else {
      document.body.classList.remove("loggedBackground");
      document.body.classList.add("loginBackground");
    }
  }, [cognitoUser, isSignedIn]);

  return <AdminLayout />;
}

export default App;
