import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "./App";
import ProvideAuth from "./components/Compound/ProvideAuth/ProvideAuth";
import ProvideUrls from "./components/Compound/ProvideUrls/ProvideUrls";
import ProvideImgs from "./components/Compound/ProvideImgs/ProvideImgs";
import MessengerCustomerChat from "react-messenger-customer-chat";
// import ContactMenu from "./components/Compound/ContactMenu/ContactMenu";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import * as serviceWorkerRegistration from './serviceWorkerRegistration';

import "./utils/LoadFonts";

ReactDOM.render(
  <Router>
    <ToastContainer />
    <ProvideAuth>
      <ProvideImgs>
        <ProvideUrls>
          <App />
        </ProvideUrls>
      </ProvideImgs>
    </ProvideAuth>
    <MessengerCustomerChat
      pageId="455201114671494"
      appId="603779204002555"
      language="es_LA"
    />
    {/* <ContactMenu
      wa="573102976460"
      tl="PDP_MultibancoBot"
      msg="Hola, requiero más información"
    /> */}
  </Router>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();