import { lazy } from "react";

const Home = lazy(() => import("./Home"));
const AuthButton = lazy(() => import("../components/Compound/Signout"));
const Error404 = lazy(() => import("./Error404"));
const Reportes = lazy(() => import("./Reportes"));
const InformacionGeneral = lazy(() => import("./InformacionGeneral"));
const Gestion = lazy(() => import("./Gestion"));

const emptyComp = () => {
  return <h1 className='text-3xl text-center my-4'>En mantenimiento</h1>;
};

export const privateUrls = [
  { link: "*", exact: false, component: Error404 },
  { link: "/", label: "Inicio", component: Home },
  {
    link: "/info",
    label: "Información general",
    component: InformacionGeneral,
  },
  { link: "/gestion", label: "Gestión", component: Gestion },
  { link: "/reportes", label: "Reportes", component: Reportes },
  { link: "/seguridad", label: "Seguridad", component: emptyComp },
  { link: "/solicitudes", label: "Tus solicitudes", component: emptyComp },
  { label: <AuthButton /> },
];
