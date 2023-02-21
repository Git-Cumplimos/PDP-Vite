import { lazy } from "react";
import PermissionsRecaudoDirecto from "./permissions";
// import RecaudoDirecto from "./Views/RecaudoDirecto";
const ConvenioRecaudo = lazy(() => import("./Views/Admin/ConvenioRecaudo"));
const ConvenioRetiro = lazy(() => import("./Views/Admin/ConvenioRetiro"));

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/** Rutas */
const RecaudoEntryPoint = lazy(() => import("./RecaudoEntryPoint"));
const AdminRecaudoDirecto = lazy(() => import("./Views/Admin"));

const listPermissions = Object.values(PermissionsRecaudoDirecto);

export const listPermissionsRecaudoDirecto = listPermissions.splice(listPermissions.length / 2)

export const rutasGestionRecaudoDirecto = {
  link: "/recaudo-directo/gestion",
  label: <AppIcons Logo={"Reporte"} name={"Gestión"} />,
  component: AdminRecaudoDirecto,
  permission: [PermissionsRecaudoDirecto.recaudo],
  subRoutes: [
    {
    link: "/recaudo-directo/gestion/recaudo",
    label: <AppIcons Logo={"Reporte"} name={"Convenios de Recaudos"} />,
    component: ConvenioRecaudo,
    permission: [PermissionsRecaudoDirecto.recaudo],
  },{
    link: "/recaudo-directo/gestion/retiro",
    label: <AppIcons Logo={"Reporte"} name={"Convenios de Retiros"} />,
    component: ConvenioRetiro,
    permission: [PermissionsRecaudoDirecto.recaudo],
  },]
}

const rutasRecaudoDirecto = {
  link: "/recaudo-directo",
  label: <AppIcons Logo={"CorresponsalBancario"} name={"Recaudo/Retiro Directos"} />,
  component: RecaudoEntryPoint,
  permission: listPermissionsRecaudoDirecto,
  subRoutes: [
    rutasGestionRecaudoDirecto,
  ],
};

export default rutasRecaudoDirecto;