import { lazy } from "react";
import { enumPermisosNequi } from "./enumPermisosNequi";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../../components/Base/AppIcons"));
/**
 * Corresponsalia Nequi
 */

const Nequi = lazy(() =>
  import("././Views/PagoNotificacionPush")
);

const listPermissions = Object.values(enumPermisosNequi);
export const listPermissionsNequi = listPermissions;

const rutasNequi = {
  //corresponsaliaNequi
  link: "/Nequi",
  label: <AppIcons Logo={"NEQUI"} name="Nequi" />,
  component: Nequi,
  permission: listPermissionsNequi,
  subRoutes: [
  
  ],
};

export default rutasNequi;
