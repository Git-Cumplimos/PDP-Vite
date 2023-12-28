import { lazy } from "react";
import { enumPermisosCreditoPdp } from "./enumPermisosCreditoPdp";
/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/**
 * Credito Facil PDP
 */
const RealizarCreditoFacil = lazy(() =>
  import("./Views/CreditoFacil/RealizarCreditoFacil")
);

const CreditosPDP = lazy(() => import("./CreditosPDP"));

export const listPermissionsCreditoPdp = Object.values(enumPermisosCreditoPdp);

const rutasCreditosPdp = {
  link: "/creditos-pdp",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="Créditos PDP" />,
  component: CreditosPDP,
  permission: listPermissionsCreditoPdp,
  subRoutes: [
    {
      link: "/creditos-pdp/credito-facil",
      label: <AppIcons Logo={"RECARGA_CELULAR"} name="Crédito Fácil" />,
      component: RealizarCreditoFacil,
      permission: [enumPermisosCreditoPdp.REALIZAR_CREDITO_FACIL],
    },
  ],
};

export default rutasCreditosPdp;
