import { lazy } from "react";
import { enumPermisosCerolioOAT } from "./enumPermisosCerolioOAT";
/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));
/**
 * CerolioOAT
 */
const CerolioOAT = lazy(() => import("./Views/CerolioOAT"));
const CerolioOATAgendar = lazy(() => import("./Views/Agenda/Agenda"));
const CerolioOATTarifas = lazy(() => import("./Views/Tarifas/Tarifas"));
const CerolioOATReportes = lazy(() => import("./Views/Reportes/Reportes"));
const CerolioOATReportesConsulta = lazy(() =>
  import("./Views/Reportes/ReportesConsulta/ReportesConsulta")
);
const CerolioOATReportesHistorico = lazy(() =>
  import("./Views/Reportes/ReportesHistorico/ReportesHistorico")
);
const CerolioOATPin = lazy(() => import("./Views/PIN/Pin"));
const listPermissions = Object.values(enumPermisosCerolioOAT);
export const listPermissionsCerolioOAT = listPermissions;

const rutasCerolioOAT = {
  link: "/cerolio-oat",
  label: <AppIcons Logo={"MARKETPLACE"} name="Cerolio OAT" />,
  component: CerolioOAT,
  permission: listPermissionsCerolioOAT,
  subRoutes: [
    {
      link: "/cerolio-oat/agendar",
      label: <AppIcons Logo={"MARKETPLACE"} name="Agendas" />,
      component: CerolioOATAgendar,
      permission: [enumPermisosCerolioOAT.cerolioOAT],
    },
    {
      link: "/cerolio-oat/tarifas",
      label: <AppIcons Logo={"MARKETPLACE"} name="Configuración Tarifas" />,
      component: CerolioOATTarifas,
      permission: [enumPermisosCerolioOAT.cerolioOAT],
    },
    {
      link: "/cerolio-oat/reportes",
      label: <AppIcons Logo={"MARKETPLACE"} name="Reportes" />,
      component: CerolioOATReportes,
      permission: [enumPermisosCerolioOAT.cerolioOAT],
      subRoutes: [
        {
          link: "/cerolio-oat/reportes/consulta",
          label: <AppIcons Logo={"MARKETPLACE"} name="Reportes Consulta" />,
          component: CerolioOATReportesConsulta,
          permission: [enumPermisosCerolioOAT.cerolioOAT],
        },
        {
          link: "/cerolio-oat/reportes/historico",
          label: <AppIcons Logo={"MARKETPLACE"} name="Reportes Histórico" />,
          component: CerolioOATReportesHistorico,
          permission: [enumPermisosCerolioOAT.cerolioOAT],
        },
      ],
    },
    {
      link: "/cerolio-oat/pin",
      label: <AppIcons Logo={"MARKETPLACE"} name="PIN" />,
      component: CerolioOATPin,
      permission: [enumPermisosCerolioOAT.cerolioOAT],
    },
  ],
};

export default rutasCerolioOAT;
