import { lazy } from "react";
const AppIcons = lazy(() => import("../../../../components/Base/AppIcons"));

/**
 * COMPONENTES ROL CAJERO
 */
const Panel = lazy(() => import("./Panel"));
const CargaComprobante = lazy(() => import("./CargaComprobante"));
const NotasCD = lazy(() => import("./Notas"));
const NotasDebito = lazy(() => import("./Notas/NotasDebito"));
const NotasCredito = lazy(() => import("./Notas/NotasCredito"));

/**
 * COMPONENTES ROL ANALISTA
 */
const PanelHistorico = lazy(() => import("./PanelHistorico"));
const PanelConsignaciones = lazy(() => import("./PanelConsignaciones"));
const ParametrizacionRecaudo = lazy(() => import("./ParametrizacionRecaudo"));
const NotasCDHistorico = lazy(() => import("./Notas/NotasHistorico"));

export const rutasArqueo = [
  {
    link: "/gestion/arqueo/panel-transacciones",
    label: <AppIcons Logo={"RECAUDO"} name="Panel de transacciones" />,
    component: Panel,
    permission: [74],
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
    label: <AppIcons Logo={"RECAUDO"} name="Notas debito y credito" />,
    component: NotasCD,
    permission: [78, 80],
    subRoutes: [
      {
        link: "/gestion/arqueo/notas/debito",
        label: <AppIcons Logo={"RECAUDO"} name="Notas debito" />,
        component: NotasDebito,
        permission: [78],
      },
      {
        link: "/gestion/arqueo/notas/credito",
        label: <AppIcons Logo={"RECAUDO"} name="Notas credito" />,
        component: NotasCredito,
        permission: [80],
      },
    ]
  },
  {
    link: "/gestion/arqueo/notas-historico",
    label: <AppIcons Logo={"RECAUDO"} name="Historico notas debito y credito" />,
    component: NotasCDHistorico,
    permission: [81],
  },
];
