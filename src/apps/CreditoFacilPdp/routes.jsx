import { lazy } from "react";
import {
  enumPermisosCreditoPdp,
  enumPermisosCreditoPdpAdmin,
} from "./enumPermisosCreditoPdp";
/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/**
 * Credito Facil PDP
 */
const RealizarCreditoFacil = lazy(() =>
  import("./Views/CreditoFacil/RealizarCreditoFacil")
);
const GestionTercerosCreditoFacil = lazy(() =>
  import("./Views/Admin/GestionTercerosCreditoFacil")
);

const CreditosPDP = lazy(() => import("./CreditosPDP"));

const listPermissionsCreditoPdp = Object.values(enumPermisosCreditoPdp);
const listPermissionsAdminCreditoPdp = Object.values(
  enumPermisosCreditoPdpAdmin
);

const rutasCreditosPdp = {
  link: "/creditos-pdp",
  label: <AppIcons Logo={"CREDITOS_PDP"} name="Créditos PDP" />,
  component: CreditosPDP,
  permission: [...listPermissionsCreditoPdp, ...listPermissionsAdminCreditoPdp],
  subRoutes: [
    {
      link: "/creditos-pdp/credito-facil",
      label: <AppIcons Logo={"CREDITOS_PDP"} name="Crédito Fácil" />,
      component: RealizarCreditoFacil,
      permission: [enumPermisosCreditoPdp.REALIZAR_CREDITO_FACIL],
    },
    {
      link: "/creditos-pdp/gestion-terceros",
      label: <AppIcons Logo={"CREDITOS_PDP"} name="Gestión de Terceros" />,
      component: GestionTercerosCreditoFacil,
      permission: [enumPermisosCreditoPdpAdmin.GESTION_TERCEROS_CREDITO_FACIL],
    },
  ],
};

export default rutasCreditosPdp;
