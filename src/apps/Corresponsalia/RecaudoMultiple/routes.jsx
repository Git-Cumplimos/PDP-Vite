import { lazy } from "react";
import { enumPermisosRecaudoMultiple } from "./enumPermisosAval";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../../components/Base/AppIcons"));

/**
 * Corresponsalia Grupo Aval
 */
const RecaudoMultiple = lazy(() => import("./Views/RecaudoMultiple"));

const listPermissions = Object.values(enumPermisosRecaudoMultiple);
export const listPermissionsRecaudoMultiple = listPermissions.splice(
  listPermissions.length / 2
);

const rutasRecaudoMultiple = {
  link: "/corresponsalia/recaudo-multiple",
  label: <AppIcons Logo={"MARKETPLACE"} name='Recaudo multiple' />,
  component: RecaudoMultiple,
  permission: listPermissionsRecaudoMultiple,
  subRoutes: [],
};
export default rutasRecaudoMultiple;
