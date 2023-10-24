import { lazy } from "react";
import { enumPermisosMoviliza } from "./enumPermisosMoviliza";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

const Moviliza = lazy(() => import("./Moviliza"));

const pagarMoviliza = lazy(() => import("./Views/Moviliza/pagarMoviliza"));

const listPermissions = Object.values(enumPermisosMoviliza);
export const listPermissionsMoviliza = listPermissions;

const rutasMoviliza = {
  link: "/moviliza",
  label: <AppIcons Logo={"MOVILIZA"} name={"Moviliza"} />,
  component: pagarMoviliza,
  permission: [...listPermissionsMoviliza],
  subRoutes: [],
};
export default rutasMoviliza;
