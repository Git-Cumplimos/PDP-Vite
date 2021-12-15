import { Switch, useLocation } from "react-router-dom";
import { useUrls } from "../../utils/UrlsHooks";

import Header from "../../components/Compound/Header/Header";
import classes from "./AdminLayout.module.css";
import SocialBar from "../../components/Compound/SocialBar/SocialBar";

const AdminLayout = () => {
  const { adminLayout, wave } = classes;

  const { allRoutes } = useUrls();

  const { pathname } = useLocation();

  return (
    <div className={adminLayout}>
      {pathname === "/login" ? (
        <div className={wave}>
          <SocialBar />
        </div>
      ) : (
        ""
      )}
      <Header />
      <main className="container">
        <Switch>{allRoutes}</Switch>
      </main>
    </div>
  );
};

export default AdminLayout;
