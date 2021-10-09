import Admin from "./layouts/Admin/Admin";
import ProvideAuth from "./components/Compound/ProvideAuth/ProvideAuth";
import ProvideUrls from "./components/Compound/ProvideUrls/ProvideUrls";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Amplify from "aws-amplify";
import awsconfig from "./aws-exports";

Amplify.configure(awsconfig);

function App() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/login") {
      document.body.classList.remove("loggedBackground");
      document.body.classList.add("loginBackground");
    } else {
      document.body.classList.remove("loginBackground");
      document.body.classList.add("loggedBackground");
    }
  }, [location.pathname]);

  return (
    <ProvideAuth>
      <ProvideUrls>
        <Admin />
      </ProvideUrls>
    </ProvideAuth>
  );
}

export default App;
