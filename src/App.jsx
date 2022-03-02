import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";

import { Suspense } from "react";
import { useUrls } from "./hooks/UrlsHooks";
import SkeletonLoading from "./components/Base/SkeletonLoading";

Amplify.configure(awsconfig);

function App() {
  const { allRoutes } = useUrls();

  return <Suspense fallback={<SkeletonLoading />}>{allRoutes}</Suspense>;
}

export default App;
