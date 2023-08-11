import { lazy } from "react";
import { enumPermisosColpatria } from "./enumPermisosColpatria";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

const Moviliza = lazy(() =>
  import("./Moviliza")
);

const pagarMoviliza = lazy(() => import("./Views/Moviliza/pagarMoviliza"));

const listPermissions = Object.values(enumPermisosColpatria);
export const listPermissionsColpatria = listPermissions;

const rutasMoviliza = {

  link: "/moviliza",
  label: <AppIcons Logo={"DAVIVIENDA_PAGO_POR_GIRO"} name={"Moviliza"} />,
  component: pagarMoviliza,
  permission: [...listPermissionsColpatria],
  subRoutes: [ 

]

};
export default rutasMoviliza;
