import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";

import { Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { UrlsContext } from "./hooks/UrlsHooks";
import SkeletonLoading from "./components/Base/SkeletonLoading";
import ProvideAuth from "./components/Compound/ProvideAuth";
import ProvideUrls from "./components/Compound/ProvideUrls";
import ProvideImgs from "./components/Compound/ProvideImgs";
import MessengerCustomerChat from "react-messenger-customer-chat";
import { ToastContainer } from "react-toastify";
// import ContactMenu from "./components/Compound/ContactMenu";

Amplify.configure(awsconfig);

function App() {
  return (
    <Router>
      <ToastContainer />
      <ProvideAuth>
        <ProvideImgs>
          <ProvideUrls>
            <UrlsContext.Consumer>
              {({ allRoutes }) => (
                <Suspense fallback={<SkeletonLoading />}>{allRoutes}</Suspense>
              )}
            </UrlsContext.Consumer>
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
    </Router>
  );
}

export default App;
