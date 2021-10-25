import Admin from "./layouts/Admin/Admin";
import ProvideAuth from "./components/Compound/ProvideAuth/ProvideAuth";
import ProvideUrls from "./components/Compound/ProvideUrls/ProvideUrls";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Amplify from "aws-amplify";
import awsconfig from "./aws-exports";
import { ToastContainer } from "react-toastify";

import dayjs from 'dayjs'
Amplify.configure(awsconfig);

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname === "/login") {
      document.body.classList.remove("loggedBackground");
      document.body.classList.add("loginBackground");
    } else {
      document.body.classList.remove("loginBackground");
      document.body.classList.add("loggedBackground");
    }
  }, [pathname]);

  return (
    <ProvideAuth>
      <ProvideUrls>
        <ToastContainer />
        <Admin />
        <h3 align='right'>Hola {(dayjs().format())}</h3>
      </ProvideUrls>
    </ProvideAuth>
    
  );
}

export default App;
