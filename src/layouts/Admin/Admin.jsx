import { Route, Switch, useLocation } from "react-router-dom";

import PrivateRoute from "../../components/Compound/PrivateRoute/PrivateRoute";
import Header from "../../components/Compound/Header/Header";
import { useUrls } from "../../utils/UrlsHooks";
import classes from "./Admin.module.css";
import SocialBar from "../../components/Compound/SocialBar/SocialBar";

const Admin = () => {
  const { adminLayout, wave } = classes;

  const { urlsPrivate, urlsPrivApps, urlsPublic, urlsPrivateApps } = useUrls();

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
          {/* {urlsPrivApps
            .filter(({ extern }) => !extern)
            .map(({ link, component: Component, props, exact }) => {
              exact = exact === undefined ? true : exact;
              return (
                <PrivateRoute key={link} exact={exact} path={link}>
                  <Component {...props} />
                </PrivateRoute>
              );
            })} */}
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
            .map(({ link, component: Component, subRoutes }) => {
              return Array.isArray(subRoutes)
                ? subRoutes.map(
                    ({ link: _link, component: SubComponent, label }) => {
                      return (
                        <PrivateRoute key={_link} path={_link} exact>
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
        </Switch>
      </main>
    </div>
  );
};

export default Admin;
