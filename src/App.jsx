import Amplify from "aws-amplify";
import awsconfig from "./aws-exports";

import { Suspense, lazy } from "react";
import { useAuth } from "./hooks/AuthHooks";
import { Routes } from "react-router-dom";
import { useUrls } from "./hooks/UrlsHooks";
import SkeletonLoading from "./components/Base/SkeletonLoading/SkeletonLoading";
const AdminLayout = lazy(() => import("./layouts/AdminLayout/AdminLayout"));
const LoginLayout = lazy(() => import("./layouts/LoginLayout/LoginLayout"));

Amplify.configure(awsconfig);

function App() {
  const { cognitoUser, isSignedIn } = useAuth();
  const { allRoutes } = useUrls();

  return (
    <Suspense fallback={<SkeletonLoading />}>
      {cognitoUser && isSignedIn ? (
        <AdminLayout>
          <Routes>{allRoutes}</Routes>
        </AdminLayout>
      ) : (
        <LoginLayout>
          <Routes>{allRoutes}</Routes>
        </LoginLayout>
      )}
    </Suspense>
  );
}

export default App;
