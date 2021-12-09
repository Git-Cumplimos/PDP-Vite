import { Route, Switch, useLocation } from "react-router-dom";
import { useUrls } from "../../utils/UrlsHooks";

import PrivateRoute from "../../components/Compound/PrivateRoute/PrivateRoute";
import Header from "../../components/Compound/Header/Header";
import classes from "./Admin.module.css";
import SocialBar from "../../components/Compound/SocialBar/SocialBar";
import Error404 from "../../pages/Error404";

const Admin = () => {
  const { adminLayout, wave } = classes;

  const { urlsPrivate, urlsPublic, urlsPrivateApps } = useUrls();

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
        <Switch>
          {urlsPrivate
            .filter(({ link }) => !(link === undefined || link === null))
            .map(({ link, component: Component, props, exact }) => {
              exact = exact === undefined ? true : exact;
              return (
                <PrivateRoute key={link} exact={exact} path={link}>
                  <Component {...props} />
                </PrivateRoute>
              );
            })}
          {urlsPrivateApps
            .filter(({ extern }) => !extern)
            .map(({ link, component: Component, subRoutes }) => {
              return (
                <PrivateRoute key={link} path={link} exact>
                  <Component subRoutes={subRoutes} />
                </PrivateRoute>
              );
            })}
          {urlsPrivateApps
            .filter(({ extern }) => !extern)
            .map(({ subRoutes }) => {
              return Array.isArray(subRoutes)
                ? subRoutes.map(
                    ({ link, component: SubComponent, label }) => {
                      return (
                        <PrivateRoute key={link} path={link} exact>
                          <SubComponent route={{ label }} />
                        </PrivateRoute>
                      );
                    }
                  )
                : "";
            })}
          {urlsPublic.map(({ link, component: Component, props, exact }) => {
            exact = exact === undefined ? true : exact;
            return (
              <Route key={link} exact={exact} path={link}>
                <Component {...props} />
              </Route>
            );
          })}
          <Route path="*">
            <Error404 />
          </Route>
        </Switch>
      </main>
    </div>
  );
};

export default Admin;
