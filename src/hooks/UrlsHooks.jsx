import { createContext, lazy, useContext, useMemo } from "react";
import { Route, Routes } from "react-router-dom";
import { useAuth } from "./AuthHooks";
import { allUrlsPrivateApps } from "../utils/appsRoutes";
 
import { rutasGestion } from "../pages/Gestion/routes";
import { rutasReportes } from "../pages/Reportes/routes";
import { rutasInformacionGeneral } from "../pages/InformacionGeneral/routes";
import { loginUrls } from "../pages/Login/routes";
import { publicUrls } from "../pages/PublicHome/routes";
import { privateUrls } from "../pages/routes";

import PrivateRoute from "../components/Compound/PrivateRoute";
import SubPage from "../components/Base/SubPage";
import rutasBilleteraComisiones from "../pages/BilleteraComisiones/routes";

const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const PublicLayout = lazy(() => import("../layouts/PublicLayout"));
const LoginLayout = lazy(() => import("../layouts/LoginLayout"));

const getAllRoutes = (urls,link_padre = null) => {
  const allUrls = [];

  for (const url of urls) {
    const { subRoutes, provider } = url;

    if (link_padre && url?.show === false) url['link_padre']= -1
    else if (link_padre) url['link_padre'] = link_padre

    allUrls.push({ ...url });
    if (subRoutes) {
      for (const subUrl of getAllRoutes(subRoutes,url.link)) {
        if (provider) {
          allUrls.push({ ...subUrl, provider });
        } else {
          allUrls.push(subUrl);
        }
      }
    }
  }
  console.log(allUrls)
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
        link_padre,
        link,
        component: Page,
        props,
        exact,
        subRoutes = false,
        label,
        provider: Provider,
      }) => {
        exact = exact === undefined ? true : exact;
        const labels = {...label}
        labels.link_padre = link_padre
        const pageWrapper = SubWrapper ? (
            <SubWrapper label={labels}>
              <Page subRoutes={subRoutes} route={{ labels }} {...props}  />
            </SubWrapper>
        ) : (
          <Page subRoutes={subRoutes} route={{ labels }}  {...props} />
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
};

const filterPermissions = (urls, userAccess) => {
  if (!Array.isArray(urls)) {
    return [];
  }

  const filteredUrls = [
    ...urls.filter(({ permission = [] }) => {
      if (permission?.[0] === -1) return true;
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
  urlsGestion: [],
  urlsReportes: [],
  urlsInformacionGeneral: [],
  urlsBilleteraComisiones: [],
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

  const urlsGestion = useMemo(() => {
    if (Array.isArray(userPermissions) && userPermissions.length > 0) {
      return [...filterPermissions(rutasGestion, userPermissions)];
    } else {
      return [];
    }
  }, [userPermissions]);

  const urlsReportes = useMemo(() => {
    if (Array.isArray(userPermissions) && userPermissions.length > 0) {
      return [...filterPermissions(rutasReportes, userPermissions)];
    } else {
      return [];
    }
  }, [userPermissions]);

  const urlsInformacionGeneral = useMemo(() => {
    if (Array.isArray(userPermissions) && userPermissions.length > 0) {
      return [...filterPermissions(rutasInformacionGeneral, userPermissions)];
    } else {
      return [];
    }
  }, [userPermissions]);

  const urlsBilleteraComisiones = useMemo(() => {
    if (Array.isArray(userPermissions) && userPermissions.length > 0) {
      return [...filterPermissions(rutasBilleteraComisiones, userPermissions)];
    } else {
      return [];
    }
  }, [userPermissions]);

  const allRoutes = useMemo(() => {
    return (
      <Routes>
        <Route path='/' element={<AdminLayout />}>
          {toRoute(privateUrls)}
          {toRoute(urlsPrivateApps, true, SubPage)}
          {toRoute(urlsGestion, true, SubPage)}
          {toRoute(urlsReportes, true, SubPage)}
          {toRoute(urlsInformacionGeneral, true, SubPage)}
          {toRoute(urlsBilleteraComisiones, true, SubPage)}
        </Route>
        <Route path='/login' element={<LoginLayout />}>
          {toRoute(loginUrls, false)}
        </Route>
        <Route path='/public' element={<PublicLayout />}>
          {toRoute(publicUrls, false)}
        </Route>
      </Routes>
    );
  }, [
    urlsPrivateApps,
    urlsGestion,
    urlsReportes,
    urlsInformacionGeneral,
    urlsBilleteraComisiones,
  ]);

  return {
    urlsPrivate: privateUrls,
    urlsPublic: publicUrls,
    urlsPrivateApps,
    allRoutes,
    urlsGestion,
    urlsReportes,
    urlsInformacionGeneral,
    urlsBilleteraComisiones,
  };
};
