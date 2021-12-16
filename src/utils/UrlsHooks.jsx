import { createContext, useContext, useMemo } from "react";
import { Route } from "react-router-dom";
import { useAuth } from "./AuthHooks";
import { allUrlsPrivateApps, privateUrls, publicUrls } from "./appsRoutes";
import PrivateRoute from "../components/Compound/PrivateRoute/PrivateRoute";

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

const toRoute = (urls, Wrapper) => {
  if (!Array.isArray(urls)) {
    return [];
  }
  if (!Wrapper) {
    return [];
  }

  const allurls = getAllRoutes(urls);

  return allurls
    .filter(({ link }) => !(link === undefined || link === null))
    .filter(({ extern }) => !extern)
    .map(
      ({
        link,
        component: Component,
        props,
        exact,
        subRoutes,
        label,
        provider: Provider,
      }) => {
        exact = exact === undefined ? true : exact;
        return (
          <Wrapper key={link} path={link} exact={exact}>
            {Provider ? (
              <Provider>
                <Component subRoutes={subRoutes} route={{ label }} {...props} />
              </Provider>
            ) : (
              <Component subRoutes={subRoutes} route={{ label }} {...props} />
            )}
          </Wrapper>
        );
      }
    );
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
      ...toRoute(privateUrls, PrivateRoute),
      ...toRoute(urlsPrivateApps, PrivateRoute),
      ...toRoute(publicUrls, Route),
    ];
  }, [urlsPrivateApps]);

  return {
    urlsPrivate: privateUrls,
    urlsPublic: publicUrls,
    urlsPrivateApps,
    allRoutes,
  };
};
