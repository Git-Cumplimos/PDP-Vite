import { Route, Switch } from "react-router-dom";

import PrivateRoute from "../../components/Compound/PrivateRoute/PrivateRoute";
import Header from "../../components/Compound/Header/Header";
import { useUrls } from "../../utils/UrlsHooks";
import classes from "./Admin.module.css";

const Admin = () => {
  const { adminLayout } = classes;

  const urls = useUrls();

  return (
    <div className={adminLayout}>
      <Header />
      <main className="container">
        <Switch>
          {urls.urlsPrivate
            .filter(({ link }) => !(link === undefined || link === null))
            .map(({ link, component: Component, props }) => {
              return (
                <PrivateRoute key={link} exact path={link}>
                  <Component {...props} />
                </PrivateRoute>
              );
            })}
          {urls.urlsPrivApps.map(({ link, component: Component, props }) => {
            return (
              <PrivateRoute key={link} exact path={link}>
                <Component {...props} />
              </PrivateRoute>
            );
          })}
          {urls.urlsPublic.map(({ link, component: Component, props }) => {
            return (
              <Route key={link} exact path={link}>
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
