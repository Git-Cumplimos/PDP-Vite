import { lazy } from "react";
import { enumPermisosCajaSocial } from "./enumPermisosCajaSocial";
/** Componente de iconos */
const AppIcons = lazy(() => import("../../../components/Base/AppIcons"));

/**
 * Corresponsalia CajaSocial
 */
const CorresponsaliaCajaSocial = lazy(() =>
  import("./CorresponsaliaCajaSocial")
);
const DepositoCajaSocial = lazy(() => import("./Views/DepositoCajaSocial"));
export const listPermissionsCajaSocial = Object.values(enumPermisosCajaSocial);

const rutasCajaSocialCB = {
  //corresponsaliaCajaSocial
  link: "/corresponsalia/corresponsalia-caja-social",
  label: <AppIcons Logo={"CAJA_SOCIAL"} name="Corresponsalía BCSC" />,
  component: CorresponsaliaCajaSocial,
  permission: listPermissionsCajaSocial,
  subRoutes: [
    {
      link: "/corresponsalia/corresponsalia-caja-social/deposito",
      label: <AppIcons Logo={"CAJA_SOCIAL_DEPOSITO"} name="Depósitos" />,
      component: DepositoCajaSocial,
      permission: [enumPermisosCajaSocial.DEPOSITO_CAJA_SOCIAL],
    },
  ],
};

export default rutasCajaSocialCB;
