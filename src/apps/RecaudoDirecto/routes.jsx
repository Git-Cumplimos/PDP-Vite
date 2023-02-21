import { lazy } from "react";
import PermissionsRecaudoDirecto from "./permissions";
// import RecaudoDirecto from "./Views/RecaudoDirecto";
const RecaudoDirecto = lazy(() => import("./Views/RecaudoDirecto"));
const RetiroDirecto = lazy(() => import("./Views/RetiroDirecto"));

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/** Rutas */
const RecaudoEntryPoint = lazy(() => import("./RecaudoEntryPoint"));

const listPermissions = Object.values(PermissionsRecaudoDirecto);

export const listPermissionsRecaudoDirecto = listPermissions.splice(listPermissions.length / 2)

const rutasRecaudoDirecto = {
  link: "/recaudo-directo",
  label: <AppIcons Logo={"CorresponsalBancario"} name={"Recaudo/Retiro Directos"} />,
  component: RecaudoEntryPoint,
  permission: listPermissionsRecaudoDirecto,
  subRoutes: [
    {
      link: "/recaudo-directo/recaudo",
      label: <AppIcons Logo={"Reporte"} name={"Convenios de Recaudos"} />,
      component: RecaudoDirecto,
      permission: [PermissionsRecaudoDirecto.recaudo],
    },{
      link: "/recaudo-directo/retiro",
      label: <AppIcons Logo={"Reporte"} name={"Convenios de Retiros"} />,
      component: RetiroDirecto,
      permission: [PermissionsRecaudoDirecto.recaudo],
    },
  ],
};

export default rutasRecaudoDirecto;