import { lazy } from "react";
import { enumPermisosMovii } from "./enumPermisosMovii";
/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));
/**
 * Movii
 */
const MoviiPDP = lazy(() => import("./MoviiPDP"));
const MoviiPDPCashOut = lazy(() => import("./Views/MoviiPDPCashOut"));
const MoviiPDPCashIn = lazy(() => import("./Views/MoviiPDPCashIn"));
const listPermissions = Object.values(enumPermisosMovii);
export const listPermissionsMovii = listPermissions;

const rutasMovii = {
  link: "/movii-pdp",
  label: <AppIcons Logo={"MOVII"} name='MOVII PDP' />,
  component: MoviiPDP,
  permission: listPermissionsMovii,
  subRoutes: [
    {
      link: "/movii-pdp/retiro",
      label: <AppIcons Logo={"MOVII_RETIRO"} name='Retiro' />,
      component: MoviiPDPCashOut,
      permission: [enumPermisosMovii.MOVII_RETIROS],
    },
    {
      link: "/movii-pdp/deposito",
      label: <AppIcons Logo={"MOVII_RETIRO"} name='Depósito' />,
      component: MoviiPDPCashIn,
      permission: [enumPermisosMovii.MOVII_DEPOSITOS],
    },
  ],
};

export default rutasMovii;
