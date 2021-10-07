import Admin from "./layouts/Admin/Admin";
import ProvideAuth from "./components/Compound/ProvideAuth/ProvideAuth";
import ProvideUrls from "./components/Compound/ProvideUrls/ProvideUrls";

import { useEffect } from "react";
import { useHistory } from "react-router-dom";

import Amplify from "aws-amplify";
import awsconfig from "./aws-exports";

Amplify.configure(awsconfig);

function App() {
  const history = useHistory();

  useEffect(() => {
    if (history.location.pathname === "/login") {
      document.body.classList.remove("loggedBackground");
      document.body.classList.add("loginBackground");
    } else {
      document.body.classList.remove("loginBackground");
      document.body.classList.add("loggedBackground");
    }
    history.listen((location) => {
      if (location.pathname === "/login") {
        document.body.classList.remove("loggedBackground");
        document.body.classList.add("loginBackground");
      } else {
        document.body.classList.remove("loginBackground");
        document.body.classList.add("loggedBackground");
      }
    });
  }, [history]);

  return (
    <ProvideAuth>
      <ProvideUrls>
        <Admin />
      </ProvideUrls>
    </ProvideAuth>
  );
}

export default App;
