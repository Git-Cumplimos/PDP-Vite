import { createContext, useContext, useEffect, useState } from "react";

/**
 * * Logos
 */
import AppIcons from "../components/Base/AppIcons/AppIcons";
import SUSER from "../assets/svg/SUSER-01.svg";
import MARKETPLACE from "../assets/svg/MARKETPLACE-01.svg";
import ACTUALIZACION from "../assets/svg/ActualizacionDeDatos.svg";
import LOTERIA from "../assets/svg/LOTERIA-DE-BOGOTA-01.svg";


/**
 * * Paginas
 */

/**
 * Base
 */
import Home from "../pages/Home";
import Login from "../pages/Login";
import AuthButton from "../components/Compound/Signout/Signout";
import Transacciones from "../pages/Transacciones";
import { useAuth } from "./AuthHooks";

/**
 * Loteria
 */
import LoteriaBog from "../apps/LoteriaBog/LoteriaBog";
import Loteria from "../apps/LoteriaBog/Views/Loteria";
import DescargarArchivos from "../apps/LoteriaBog/Views/DescargarArchivos";
import CrearSorteos from "../apps/LoteriaBog/Views/CrearSorteos";
import CargaArchivos from "../apps/LoteriaBog/Views/CargaArchivos";

/**
 * Marketplace
 */
import MarketPlace from "../apps/MarketPlace/MarketPlace";

/**
 * Fundacion de la mujer
 */
import FunMujer from "../apps/FundacionMujer/componentsmujer/Pages/FunMujer";

/**
 * IAM
 */
import IAMUsers from "../apps/IAM/Views/IAMUsers";
import IAMGroups from "../apps/IAM/Views/IAMGroups";
import IAMRoles from "../apps/IAM/Views/IAMRoles";
import IAMPermissions from "../apps/IAM/Views/IAMPermissions";
import IAMIndex from "../apps/IAM/IAMIndex";
import IAMPolicies from "../apps/IAM/Views/IAMPolicies";

/**
 * Formulario de actualizacion
 */
import FormCommerce from "../apps/UpdateCommerce/FormCommerce";
import CommerceInfo from "../apps/UpdateCommerce/CommerceInfo";

export const UrlsContext = createContext({
  urlsPrivate: [],
  urlsPublic: [],
  urlsPrivateApps: [],
});

export const useUrls = () => {
  return useContext(UrlsContext);
};

export const useProvideUrls = () => {
  const [urlsPrivate, setUrlsPrivate] = useState([]);
  const [urlsPublic, setUrlsPublic] = useState([]);
  const [urlsPrivateApps, setUrlsPrivateApps] = useState([]);

  const emptyComp = () => {
    return <h1 className="text-3xl text-center my-4">En mantenimiento</h1>;
  };

  const { roleInfo, userPermissions } = useAuth();

  useEffect(() => {
    const allUrlsPrivateApps = [
      {
        link: "https://portal.solucionesenred.co/",
        label: <AppIcons Logo={SUSER} name="SUSER" />,
        extern: true,
        permission: [1],
      },
      {
        link: "/loteria-de-bogota",
        label: <AppIcons Logo={LOTERIA} name="Loteria de bogota" />,
        component: LoteriaBog,
        extern: false,
        permission: [2, 3, 4, 5, 6],
        subRoutes: [
          {
            link: "/loteria-de-bogota/sorteos",
            label: <AppIcons Logo={LOTERIA} name="Sorteos" />,
            component: Loteria,
            extern: false,
            permission: [3],
          },
          {
            link: "/loteria-de-bogota/cargar",
            label: <AppIcons Logo={LOTERIA} name="Carga de archivos" />,
            component: CargaArchivos,
            extern: false,
            permission: [4],
          },
          {
            link: "/loteria-de-bogota/descargar",
            label: <AppIcons Logo={LOTERIA} name="Descarga de archivos" />,
            component: DescargarArchivos,
            extern: false,
            permission: [6],
          },
          {
            link: "/loteria-de-bogota/crear-sorteos",
            label: <AppIcons Logo={LOTERIA} name="Crear sorteos" />,
            component: CrearSorteos,
            extern: false,
            permission: [5],
          },
        ],
      },
      {
        link: "/transacciones",
        label: <AppIcons Logo={MARKETPLACE} name="Transacciones" />,
        component: Transacciones,
        extern: false,
        permission: [17],
      },
      {
        link: "/update-commerce",
        label: <AppIcons Logo={ACTUALIZACION} name="Actualizacion de datos" />,
        component: FormCommerce,
        extern: false,
        permission: [7],
      },
      {
        link: "/review-commerce-forms",
        label: (
          <AppIcons
            Logo={ACTUALIZACION}
            name="Revisar actualizacion de datos"
          />
        ),
        component: CommerceInfo,
        extern: false,
        permission: [9],
      },
      {
        link: "/marketplace",
        label: <AppIcons Logo={MARKETPLACE} name="Marketplace" />,
        component: MarketPlace,
        extern: true,
        permission: [0],
      },
      {
        link: "/marketplace/payorder/:orden",
        label: null,
        component: MarketPlace,
        extern: false,
        permission: [10],
      },
      {
        link: "/fundacion-mujer",
        label: <AppIcons name="Fundacion de la mujer" />,
        component: FunMujer,
        extern: false,
        permission: [],
      },
      {
        link: "/iam",
        label: <AppIcons Logo={MARKETPLACE} name="IAM" />,
        component: IAMIndex,
        extern: false,
        permission: [11, 12, 13, 14, 15, 16],
        subRoutes: [
          {
            link: "/iam/users",
            label: <AppIcons Logo={LOTERIA} name="Usuarios" />,
            component: IAMUsers,
            extern: false,
            permission: [13],
          },
          {
            link: "/iam/groups",
            label: <AppIcons Logo={LOTERIA} name="Grupos" />,
            component: IAMGroups,
            extern: false,
            permission: [12],
          },
          {
            link: "/iam/policies",
            label: <AppIcons Logo={LOTERIA} name="Politicas" />,
            component: IAMPolicies,
            extern: false,
            permission: [16],
          },
          {
            link: "/iam/roles",
            label: <AppIcons Logo={LOTERIA} name="Roles" />,
            component: IAMRoles,
            extern: false,
            permission: [14],
          },
          {
            link: "/iam/permissions",
            label: <AppIcons Logo={LOTERIA} name="Permisos" />,
            component: IAMPermissions,
            extern: false,
            permission: [15],
          },
        ],
      },
    ];

    setUrlsPrivate([
      { link: "/", label: "Inicio", component: Home, props: {} },
      {
        link: "/info",
        label: "Informacion general",
        component: emptyComp,
        props: {},
      },
      { link: "/gestion", label: "Gestion", component: emptyComp, props: {} },
      { link: "/reportes", label: "Reportes", component: emptyComp, props: {} },
      {
        link: "/seguridad",
        label: "Seguridad",
        component: emptyComp,
        props: {},
      },
      {
        link: "/solicitudes",
        label: "Tus solicitudes",
        component: emptyComp,
        props: {},
      },
      {
        label: <AuthButton />,
      },
    ]);

    if (Array.isArray(userPermissions) && userPermissions.length > 0) {
      const rootUrls = [
        ...allUrlsPrivateApps
          .filter(({ permission }) => {
            if (permission[0] === -1) return true;
            for (const per of permission) {
              return userPermissions
                .map(({ id_permission }) => id_permission)
                .includes(per);
            }
            return false;
          })
          .map((el) => {
            const { subRoutes } = el;
            if (subRoutes) {
              el.subRoutes = subRoutes.filter(({ permission }) => {
                for (const per of permission) {
                  if (
                    userPermissions
                      .map(({ id_permission }) => id_permission)
                      .includes(per)
                  ) {
                    return true;
                  }
                }
                return false;
              });
            }
            return el;
          }),
      ];
      setUrlsPrivateApps([...rootUrls]);
    } else {
      setUrlsPrivateApps([]);
    }

    setUrlsPublic([
      {
        link: "/login",
        label: "Login",
        component: Login,
        props: {},
      },
    ]);
  }, [roleInfo, userPermissions]);

  return {
    urlsPrivate,
    urlsPublic,
    urlsPrivateApps,
  };
};
