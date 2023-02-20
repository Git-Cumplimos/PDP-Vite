import { lazy } from "react";
import PermissionsRecaudoDirecto from "./permissions";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/** Rutas */
const RecaudoEntryPoint = lazy(() => import("./RecaudoEntryPoint"));

const listPermissions = Object.values(PermissionsRecaudoDirecto);

export const listPermissionsRecaudoDirecto = listPermissions.splice(listPermissions.length / 2)

const rutasRecaudoDirecto = {
  link: "/recaudo-diecto",
  label: <AppIcons Logo={"CorresponsalBancario"} name={"Recaudo/Retiro Directo"} />,
  component: RecaudoEntryPoint,
  permission: listPermissionsRecaudoDirecto,
  subRoutes: [],
};

export default rutasRecaudoDirecto;