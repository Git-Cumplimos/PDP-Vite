import { lazy } from "react";
const AppIcons = lazy(() => import("../../../../components/Base/AppIcons"));

/**
 * COMPONENTES ROL CAJERO
 */
const Panel = lazy(() => import("./Panel"));
const ReporteTrx = lazy(() => import("./ReporteTrx"));
const CargaComprobante = lazy(() => import("./CargaComprobante"));
const NotasCD = lazy(() => import("./Notas"));
const Notas = lazy(() => import("./Notas/Notas"));

/**
 * COMPONENTES ROL ANALISTA
 */
const PanelHistorico = lazy(() => import("./PanelHistorico"));
const PanelConsignaciones = lazy(() => import("./PanelConsignaciones"));
const ParametrizacionRecaudo = lazy(() => import("./ParametrizacionRecaudo"));
const NotasCDHistorico = lazy(() => import("./Notas/NotasHistorico"));

const ReportesCierre = lazy(() => import("./ReportesCierre"));

export const rutasArqueo = [
  {
    link: "/gestion/arqueo/arqueo-cierre",
    label: <AppIcons Logo={"RECAUDO"} name="Arqueo y cierre" />,
    component: Panel,
    permission: [74],
  },
  {
    link: "/gestion/arqueo/arqueo-cierre/reporte",
    label: <AppIcons Logo={"RECAUDO"} name="Reporte de transacciones" />,
    component: ReporteTrx,
    permission: [74],
    show: false,
  },
  {
    link: "/gestion/arqueo/carga-comprobante",
    label: <AppIcons Logo={"RECAUDO"} name="Transportadora y Consignaciones" />,
    component: CargaComprobante,
    permission: [75],
  },
  {
    link: "/gestion/arqueo/validar-comprobante",
    label: <AppIcons Logo={"RECAUDO"} name="Análisis de comprobante" />,
    component: PanelConsignaciones,
    permission: [76],
  },
  {
    link: "/gestion/arqueo/parametrizar-cuenta",
    label: <AppIcons Logo={"RECAUDO"} name="Parametrizar cuenta(s) recaudo" />,
    component: ParametrizacionRecaudo,
    permission: [77],
  },
  {
    link: "/gestion/arqueo/historial-cierre",
    label: <AppIcons Logo={"RECAUDO"} name="Históricos de cierre de caja" />,
    component: PanelHistorico,
    permission: [82],
  },
  {
    link: "/gestion/arqueo/notas",
    label: <AppIcons Logo={"RECAUDO"} name="Notas débito y crédito" />,
    component: NotasCD,
    permission: [78, 80],
    subRoutes: [
      {
        link: "/gestion/arqueo/notas/debito",
        label: <AppIcons Logo={"RECAUDO"} name="Notas débito" />,
        component: () => <Notas type={true} />,
        permission: [78],
      },
      {
        link: "/gestion/arqueo/notas/credito",
        label: <AppIcons Logo={"RECAUDO"} name="Notas crédito" />,
        component: () => <Notas type={false} />,
        permission: [80],
      },
    ]
  },
  {
    link: "/gestion/arqueo/notas-historico",
    label: <AppIcons Logo={"RECAUDO"} name="Históricos notas débito y crédito" />,
    component: NotasCDHistorico,
    permission: [81],
  },
  {
    link: "/gestion/arqueo/reporte-arqueo",
    label: <AppIcons Logo={"RECAUDO"} name="Reportes arqueo y cierre de caja" />,
    component: ReportesCierre,
    permission: [82],
  },
];
