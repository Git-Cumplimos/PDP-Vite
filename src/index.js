import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "./App";
import ProvideAuth from "./components/Compound/ProvideAuth/ProvideAuth";
import ProvideUrls from "./components/Compound/ProvideUrls/ProvideUrls";
import MessengerCustomerChat from "react-messenger-customer-chat";
import ContactMenu from "./components/Compound/ContactMenu/ContactMenu";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.render(
  <Router>
    <ProvideAuth>
      <ProvideUrls>
        <ToastContainer />
        <App />
        <MessengerCustomerChat
          pageId="455201114671494"
          appId="603779204002555"
          language="es_LA"
        />
        <ContactMenu
          wa="573102976460"
          tl="PDP_MultibancoBot"
          msg="Hola, requiero más información"
        />
      </ProvideUrls>
    </ProvideAuth>
  </Router>,
  document.getElementById("root")
);
