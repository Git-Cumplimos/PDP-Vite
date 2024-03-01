import {
  createContext,
  lazy,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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
// Categorias
import { fetchCategoriasByZona } from "../pages/Categorias/utils/fetchHome";
import Subcategorias from "../pages/Categorias/Subcategorias";
import { useImgs } from "./ImgsHooks";

// Categorias
const Categoria = lazy(() => import("../pages/Categorias/Categorias"));

const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const PublicLayout = lazy(() => import("../layouts/PublicLayout"));
const LoginLayout = lazy(() => import("../layouts/LoginLayout"));

const AppIcons = lazy(() => import("../components/Base/AppIcons"));
const Transacciones = lazy(() => import("../pages/Transacciones"));

const getAllRoutes = (urls, link_padre = null) => {
  const allUrls = [];

  for (const url of urls) {
    const { subRoutes, provider } = url;

    url.link_padre = link_padre ? (url?.show === false ? -1 : link_padre) : "/";

    allUrls.push({ ...url });
    if (subRoutes) {
      for (const subUrl of getAllRoutes(subRoutes, url.link)) {
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
    .filter(({ component }) => component !== undefined && component !== null)
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
        const pageWrapper = SubWrapper ? (
          <SubWrapper label={label} upperRoute={link_padre}>
            <Page
              subRoutes={subRoutes}
              route={{ label }}
              upperRoute={link_padre}
              {...props}
            />
          </SubWrapper>
        ) : (
          <Page
            subRoutes={subRoutes}
            route={{ label }}
            upperRoute={link_padre}
            {...props}
          />
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
  const { userPermissions, commerceInfo, pdpUser } = useAuth();

  const urlsPrivateApps = useMemo(() => {
    const isPdpCommerce = !!pdpUser?.fk_id_comercio;
    if (isPdpCommerce && !commerceInfo?.estado) {
      return [
        {
          link: "https://portal.solucionesenred.co/",
          label: <AppIcons Logo={"SUSER"} name="SUSER" />,
          extern: true,
          permission: [1],
        },
        {
          link: "/transacciones",
          // label: <AppIcons Logo={"MARKETPLACE"} name="Transacciones" />,
          label: <AppIcons Logo={"TRANSACCIONES"} name="Transacciones" />,
          component: Transacciones,
          permission: [8],
        },
      ];
    }
    if (Array.isArray(userPermissions) && userPermissions.length > 0) {
      return [...filterPermissions(allUrlsPrivateApps, userPermissions)];
    } else {
      return [];
    }
  }, [userPermissions, commerceInfo?.estado, pdpUser?.fk_id_comercio]);

  const [urlsCategorias, setUrlsCategorias] = useState([]);

  const { imgs } = useImgs();
  useEffect(() => {
    const fetchUrlsCategorias = async (id_zona) => {
      const formData = new FormData();
      if (id_zona) {
        formData.append("id_zona", id_zona);
        const res = await fetchCategoriasByZona(formData);
        // console.log("categorias encontradas por zona", res);
        if (res?.status) {
          const urlsCategoriasFiltrado = res?.obj.map(
            ({ nombre, img_url, id_categoria, subcategorias }) => {
              const link = `/${nombre.replace(/\s+/g, "-")}`;
              const subcategoriasFiltradas = subcategorias.filter(
                (subcategoria) =>
                  subcategoria.status || subcategoria.comercios?.length > 0
              );
              const subcats = subcategoriasFiltradas.map(
                ({ nombre, img_url, id_subcategoria, comercios }) => {
                  return {
                    link: `${link}/${nombre.replace(/\s+/g, "-")}`,
                    label: (
                      <AppIcons
                        Logo={
                          imgs?.[nombre]
                            ? imgs?.[nombre]
                            : imgs["MARKETPLACE"]
                        }
                        name={nombre}
                      />
                    ),
                    component: (props) => (
                      <Subcategorias
                        {...props}
                        comercios={comercios}
                        title={nombre}
                        label={
                          <AppIcons
                            Logo={
                              imgs?.[nombre]
                                ? imgs?.[nombre]
                                : imgs["MARKETPLACE"]
                            }
                            name={nombre}
                          />
                        }
                      />
                    ),
                    props: {
                      nombre,
                      img_url,
                      id_categoria,
                      id_subcategoria,
                    },
                  };
                }
              );
              if (subcategoriasFiltradas.length === 0) {
                // Si no hay subcategorias, no se muestra la categoría
                return {
                  link: null,
                  label: null,
                  component: null,
                  props: null,
                  subRoutes: null,
                };
              }
              return {
                link,
                label: <AppIcons Logo={img_url} name={nombre} />,
                component: (props) => (
                  <Categoria {...props} subcategorias={subcats} />
                ),
                props: { nombre, img_url, id_categoria },
                subRoutes: subcats,
              };
            }
          );
          setUrlsCategorias(urlsCategoriasFiltrado);
        } else {
          setUrlsCategorias([]);
        }
      }
    };

    // Validar que esté autenticado para hacer la petición
    if (urlsCategorias?.length === 0 && userPermissions?.length > 0) {
      fetchUrlsCategorias(commerceInfo?.zona_comercio);
    }
  }, [userPermissions, urlsCategorias?.length, commerceInfo?.zona_comercio]);

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
        <Route path="/" element={<AdminLayout />}>
          {toRoute(privateUrls)}
          {toRoute(urlsPrivateApps, true, SubPage)}
          {toRoute(urlsGestion, true, SubPage)}
          {toRoute(urlsReportes, true, SubPage)}
          {toRoute(urlsInformacionGeneral, true, SubPage)}
          {toRoute(urlsBilleteraComisiones, true, SubPage)}
          {toRoute(urlsCategorias, true, SubPage)}
        </Route>
        <Route path="/login" element={<LoginLayout />}>
          {toRoute(loginUrls, false)}
        </Route>
        <Route path="/public" element={<PublicLayout />}>
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
    urlsCategorias,
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
    urlsCategorias,
  };
};
