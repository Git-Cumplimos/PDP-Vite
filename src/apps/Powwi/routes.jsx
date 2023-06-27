import { lazy } from "react";
import { enumPermisosPowwi } from "./enumPermisosPowwi";
/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/**
 * Corresponsalia Powwi
 */
const RetiroPowwi = lazy(() => import("./Views/Operaciones/Retiro"));
const DepositoPowwi = lazy(() => import("./Views/Operaciones/Deposito"));

const CorresponsaliaPowwi = lazy(() => import("./CorresponsaliaPowwi"));

const listPermissions = Object.values(enumPermisosPowwi);
export const listPermissionsPowwi = listPermissions;

const rutasPowwi = {
  //corresponsaliaPowwi
  link: "/corresponsaliaPowwi",
  label: <AppIcons Logo={"POWWI"} name="Powwi" />,
  component: CorresponsaliaPowwi,
  permission: listPermissionsPowwi,
  subRoutes: [
    {
      link: "/corresponsaliaPowwi/Retiro",
      label: (
        <AppIcons
          Logo={"RETIRO"}
          name="Retiro"
        />
      ),
      component: RetiroPowwi,
      permission: [enumPermisosPowwi.powwi_retiros],
    },
    {
      link: "/corresponsaliaPowwi/Deposito",
      label: (
        <AppIcons
          Logo={"DEPOSITO"}
          name="Depósito"
        />
      ),
      component: DepositoPowwi,
      permission: [enumPermisosPowwi.powwi_depositos],
    },
  ],
};

export default rutasPowwi;
