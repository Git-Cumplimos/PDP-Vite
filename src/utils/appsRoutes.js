/**
 * * Logos
 */
import AppIcons from "../components/Base/AppIcons/AppIcons";

/**
 * * Paginas
 */

/**
 * Base
 */
import Login from "../pages/Login";
import Home from "../pages/Home";
import Transacciones from "../pages/Transacciones";
import AuthButton from "../components/Compound/Signout/Signout";

/**
 * Loteria
 */
import LoteriaBog from "../apps/LoteriaBog/LoteriaBog";
import Loteria from "../apps/LoteriaBog/Views/Loteria";
import DescargarArchivosS3 from "../apps/LoteriaBog/Views/DescargarArchivosS3";
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
import Error404 from "../pages/Error404";
import ProvideLoteria from "../apps/LoteriaBog/components/ProvideLoteria";

const emptyComp = () => {
  return <h1 className="text-3xl text-center my-4">En mantenimiento</h1>;
};

const CARGAR =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_1-P9wrhr8RWkx5zt3f64Ogy-Yr5DoQ_5ww&usqp=CAU";
const DESCARGAR =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5Ra0nfafOoCnsF9kD-Q1BH_J-kkz4CsP4Yw&usqp=CAU";

const publicUrls = [
  {
    link: "/login",
    label: "Login",
    component: Login,
    props: {},
  },
  {
    link: "*",
    exact: false,
    component: Error404,
    props: {},
  }
];

const allUrlsPrivateApps = [
  {
    link: "https://portal.solucionesenred.co/",
    label: <AppIcons Logo={"SUSER"} name="SUSER" />,
    extern: true,
    permission: [1],
  },
  {
    link: "/loteria-de-bogota",
    label: <AppIcons Logo={"LOTERIA"} name="Loteria de bogota" />,
    component: LoteriaBog,
    provider: ProvideLoteria,
    extern: false,
    permission: [3, 4, 5, 6],
    subRoutes: [
      {
        link: "/loteria-de-bogota/ventas",
        label: <AppIcons Logo={"SORTEOS"} name="Ventas" />,
        component: Loteria,
        extern: false,
        permission: [3],
      },
      {
        link: "/loteria-de-bogota/cargar",
        label: <AppIcons Logo={CARGAR} name="Carga de archivos" />,
        component: CargaArchivos,
        extern: false,
        permission: [4],
      },
      {
        link: "/loteria-de-bogota/descargar",
        label: <AppIcons Logo={DESCARGAR} name="Descarga de archivos" />,
        component: DescargarArchivosS3,
        extern: false,
        permission: [6],
      },
      {
        link: "/loteria-de-bogota/sorteos",
        label: <AppIcons Logo={"REPORTE"} name="Sorteos" />,
        component: CrearSorteos,
        extern: false,
        permission: [5],
      },
    ],
  },
  {
    link: "/transacciones",
    label: <AppIcons Logo={"MARKETPLACE"} name="Transacciones" />,
    component: Transacciones,
    extern: false,
    permission: [8],
  },
  {
    link: "/update-commerce",
    label: <AppIcons Logo={"ACTUALIZACION"} name="Actualizacion de datos" />,
    component: FormCommerce,
    extern: false,
    permission: [7],
  },
  {
    link: "/review-commerce-forms",
    label: (
      <AppIcons Logo={"ACTUALIZACION"} name="Revisar actualizacion de datos" />
    ),
    component: CommerceInfo,
    extern: false,
    permission: [9],
  },
  {
    link: "/marketplace",
    label: <AppIcons Logo={"MARKETPLACE"} name="Marketplace" />,
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
    label: <AppIcons Logo={"MARKETPLACE"} name="IAM" />,
    component: IAMIndex,
    extern: false,
    permission: [12, 13, 14, 15, 16],
    subRoutes: [
      {
        link: "/iam/users",
        label: <AppIcons Logo={"MARKETPLACE"} name="Usuarios" />,
        component: IAMUsers,
        extern: false,
        permission: [13],
      },
      {
        link: "/iam/groups",
        label: <AppIcons Logo={"MARKETPLACE"} name="Grupos" />,
        component: IAMGroups,
        extern: false,
        permission: [12],
      },
      {
        link: "/iam/policies",
        label: <AppIcons Logo={"MARKETPLACE"} name="Politicas" />,
        component: IAMPolicies,
        extern: false,
        permission: [16],
      },
      {
        link: "/iam/roles",
        label: <AppIcons Logo={"MARKETPLACE"} name="Roles" />,
        component: IAMRoles,
        extern: false,
        permission: [14],
      },
      {
        link: "/iam/permissions",
        label: <AppIcons Logo={"MARKETPLACE"} name="Permisos" />,
        component: IAMPermissions,
        extern: false,
        permission: [15],
      },
    ],
  },
];

const privateUrls = [
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
];

export { allUrlsPrivateApps, privateUrls, publicUrls };
