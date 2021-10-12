import { Route, Switch } from "react-router-dom";

import PrivateRoute from "../../components/Compound/PrivateRoute/PrivateRoute";
import Header from "../../components/Compound/Header/Header";
import { useUrls } from "../../utils/UrlsHooks";
import classes from "./Admin.module.css";

const Admin = () => {
  const { adminLayout } = classes;

  const { urlsPrivate, urlsPrivApps, urlsPublic } = useUrls();

  return (
    <div className={adminLayout}>
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
          {urlsPrivApps.map(({ link, component: Component, props, exact }) => {
            exact = exact === undefined ? true : exact;
            return (
              <PrivateRoute key={link} exact={exact} path={link}>
                <Component {...props} />
              </PrivateRoute>
            );
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
