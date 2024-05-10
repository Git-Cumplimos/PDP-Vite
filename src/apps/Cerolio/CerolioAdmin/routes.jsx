import { lazy } from "react";
import { enumPermisosCerolioAdmin } from "./enumPermisosCerolioAdmin";
/** Componente de iconos */
const AppIcons = lazy(() => import("../../../components/Base/AppIcons"));
/**
 * Cerolio Admin
 */
const CerolioAdmin = lazy(() => import("./Views/CerolioAdmin"));
const CerolioAdminPines = lazy(() => import("./Views/Pines/Pines"));
const CerolioAdminPinesHistorico = lazy(() =>
  import("./Views/Pines/HistoricoPines/HistoricoPines")
);
const CerolioAdminPinesReporte = lazy(() =>
  import("./Views/Pines/ReportesPines/ReportesPines")
);
const CerolioAdminTarifas = lazy(() => import("./Views/Tarifas/Tarifas"));
const CerolioAdminClientes = lazy(() => import("./Views/Clientes/Clientes"));
const listPermissions = Object.values(enumPermisosCerolioAdmin);
export const listPermissionsCerolioAdmin = listPermissions;

const rutasCerolioAdmin = {
  link: "/cerolio-admin",
  label: <AppIcons Logo={"MARKETPLACE"} name="Cerolio Admin" />,
  component: CerolioAdmin,
  permission: listPermissionsCerolioAdmin,
  subRoutes: [
    {
      link: "/cerolio-admin/pines",
      label: <AppIcons Logo={"MARKETPLACE"} name="Pines" />,
      component: CerolioAdminPines,
      permission: [enumPermisosCerolioAdmin.cerolioAdmin],
      subRoutes: [
        {
          link: "/cerolio-admin/pines/historico",
          label: <AppIcons Logo={"MARKETPLACE"} name="Historico Pines" />,
          component: CerolioAdminPinesHistorico,
          permission: [enumPermisosCerolioAdmin.cerolioAdmin],
        },
        {
          link: "/cerolio-admin/pines/reporte",
          label: <AppIcons Logo={"MARKETPLACE"} name="Reporte Pines" />,
          component: CerolioAdminPinesReporte,
          permission: [enumPermisosCerolioAdmin.cerolioAdmin],
        },
      ],
    },
    {
      link: "/cerolio-admin/tarifas",
      label: <AppIcons Logo={"MARKETPLACE"} name="Tarifas" />,
      component: CerolioAdminTarifas,
      permission: [enumPermisosCerolioAdmin.cerolioAdmin],
    },
    {
      link: "/cerolio-admin/clientes",
      label: <AppIcons Logo={"MARKETPLACE"} name="Clientes/CRM" />,
      component: CerolioAdminClientes,
      permission: [enumPermisosCerolioAdmin.cerolioAdmin],
    },
  ],
};

export default rutasCerolioAdmin;
