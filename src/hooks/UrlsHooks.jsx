import { createContext, useContext, useMemo } from "react";
import { Route } from "react-router-dom";
import { useAuth } from "./AuthHooks";
import {
  allUrlsPrivateApps,
  privateUrls,
  publicUrls,
} from "../utils/appsRoutes";
import PrivateRoute from "../components/Compound/PrivateRoute/PrivateRoute";
import SubPage from "../components/Base/SubPage/SubPage";

const getAllRoutes = (urls) => {
  const allUrls = [];

  for (const url of urls) {
    const { subRoutes, provider } = url;
    allUrls.push({ ...url });
    if (subRoutes) {
      for (const subUrl of getAllRoutes(subRoutes)) {
        if (provider) {
          allUrls.push({ ...subUrl, provider });
        } else {
          allUrls.push(subUrl);
        }
      }
    }
  }

  return allUrls;
};

const toRoute = (urls, isPrivate = true, SubWrapper) => {
  if (!Array.isArray(urls)) {
    return [];
  }

  const allurls = getAllRoutes(urls);

  const routes = allurls
    .filter(({ link }) => !(link === undefined || link === null))
    .filter(({ extern }) => !extern)
    .map(
      ({
        link,
        component: Page,
        props,
        exact,
        subRoutes = false,
        label,
        provider: Provider,
      }) => {
        exact = exact === undefined ? true : exact;
        const pageWrapper = SubWrapper ? (
          <SubWrapper label={label}>
            <Page subRoutes={subRoutes} route={{ label }} {...props} />
          </SubWrapper>
        ) : (
          <Page subRoutes={subRoutes} route={{ label }} {...props} />
        );
        const routeChild = Provider ? (
          <Provider>{pageWrapper}</Provider>
        ) : (
          pageWrapper
        );
        const routeElement = isPrivate ? (
          <PrivateRoute>{routeChild}</PrivateRoute>
        ) : (
          routeChild
        );

        return (
          <Route key={link} path={link} exact={exact} element={routeElement} />
        );
      }
    );

  return routes;

  /* return allurls
    .filter(({ link }) => !(link === undefined || link === null))
    .filter(({ extern }) => !extern)
    .map(
      ({
        link,
        component: Component,
        props,
        exact,
        subRoutes = false,
        label,
        provider: Provider,
      }) => {
        exact = exact === undefined ? true : exact;
        const pageWrapper = SubWrapper ? (
          <SubWrapper label={label}>
            <Component subRoutes={subRoutes} route={{ label }} {...props} />
          </SubWrapper>
        ) : (
          <Component subRoutes={subRoutes} route={{ label }} {...props} />
        );
        const routeChild = Provider ? (
          <Provider>{pageWrapper}</Provider>
        ) : (
          pageWrapper
        );
        return privatRoute ? (
          <Route
            key={link}
            path={link}
            exact={exact}
            render={({ location }) => (
              <PrivateRoute location={location}>{routeChild}</PrivateRoute>
            )}
          />
        ) : (
          <Route key={link} path={link} exact={exact}>
            {routeChild}
          </Route>
        );
      }
    ); */
};

const filterPermissions = (urls, userAccess) => {
  if (!Array.isArray(urls)) {
    return [];
  }

  const filteredUrls = [
    ...urls.filter(({ permission }) => {
      if (permission[0] === -1) return true;
      for (const per of permission) {
        if (
          userAccess.map(({ id_permission }) => id_permission).includes(per)
        ) {
          return true;
        }
      }
      return false;
    }),
  ];

  for (const key in filteredUrls) {
    const subRoutes = filteredUrls?.[key]?.subRoutes;
    if (subRoutes) {
      filteredUrls[key].subRoutes = filterPermissions(subRoutes, userAccess);
    }
  }

  return filteredUrls;
};

export const UrlsContext = createContext({
  urlsPrivate: [],
  urlsPublic: [],
  urlsPrivateApps: [],
  allRoutes: [],
});

export const useUrls = () => {
  return useContext(UrlsContext);
};

export const useProvideUrls = () => {
  const { userPermissions } = useAuth();

  const urlsPrivateApps = useMemo(() => {
    if (Array.isArray(userPermissions) && userPermissions.length > 0) {
      return [...filterPermissions(allUrlsPrivateApps, userPermissions)];
    } else {
      return [];
    }
  }, [userPermissions]);

  const allRoutes = useMemo(() => {
    return [
      ...toRoute(privateUrls),
      ...toRoute(urlsPrivateApps, true, SubPage),
      ...toRoute(publicUrls, false),
    ];
  }, [urlsPrivateApps]);

  return {
    urlsPrivate: privateUrls,
    urlsPublic: publicUrls,
    urlsPrivateApps,
    allRoutes,
  };
};
