import { lazy } from "react";
import { enumPermisosMoviliza } from "./enumPermisosMoviliza";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

const Moviliza = lazy(() => import("./Moviliza"));
const pagarMoviliza = lazy(() => import("./Views/Moviliza/pagarMoviliza"));
const consultarPago = lazy(() => import("./Views/MicroSitio/consultarPago"))

const listPermissions = Object.values(enumPermisosMoviliza);
export const listPermissionsMoviliza = listPermissions;

const rutasMoviliza = {
  link: "/moviliza",
  label: <AppIcons Logo={"MOVILIZA"} name={"Moviliza"} />,
  component: Moviliza,
  permission: [...listPermissionsMoviliza],
  subRoutes: [
    {
      link: "/moviliza/pagar",
      label: <AppIcons Logo={"MOVILIZA"} name={"Moviliza"} />,
      component: pagarMoviliza,
      permission: [...listPermissionsMoviliza],
    },
    {
      link: "/moviliza/consultar_pago",
      label: <AppIcons Logo={"MOVILIZA"} name={"Consultar Pago"} />,
      component: consultarPago,
      permission: [...listPermissionsMoviliza],
    }
  ],
};
export default rutasMoviliza;
