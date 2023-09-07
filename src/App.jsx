import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";

import { Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { UrlsContext } from "./hooks/UrlsHooks";
import SkeletonLoading from "./components/Base/SkeletonLoading";
import ProvideAuth from "./components/Compound/ProvideAuth";
import ProvideUrls from "./components/Compound/ProvideUrls";
import ProvideImgs from "./components/Compound/ProvideImgs";
import IdleTimeOut from "./components/Compound/IdleTimeOut/IdleTimeOut";
import MFAScreenProvider from "./components/Base/MFAScreen";

Amplify.configure(awsconfig);

function App() {
  return (
    <Router>
      <ProvideAuth>
        <MFAScreenProvider>
          <ProvideImgs>
            <ProvideUrls>
              <UrlsContext.Consumer>
                {({ allRoutes }) => (
                  <Suspense fallback={<SkeletonLoading />}>
                    {allRoutes}
                  </Suspense>
                )}
              </UrlsContext.Consumer>
            </ProvideUrls>
          </ProvideImgs>
          <IdleTimeOut />
        </MFAScreenProvider>
      </ProvideAuth>
    </Router>
  );
}

export default App;
