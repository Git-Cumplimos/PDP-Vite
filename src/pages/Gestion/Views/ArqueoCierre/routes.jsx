import { lazy } from "react";
const AppIcons = lazy(() => import("../../../../components/Base/AppIcons"));

/**
 * COMPONENTES ROL CAJERO
 */
const Panel = lazy(() => import("./Panel"));
const CargaComprobante = lazy(() => import("./CargaComprobante"));

/**
 * COMPONENTES ROL ANALISTA
 */
const PanelHistorico = lazy(() => import("./PanelHistorico"));
const PanelConsignaciones = lazy(() => import("./PanelConsignaciones"));
const ParametrizacionRecaudo = lazy(() => import("./ParametrizacionRecaudo"));

export const rutasArqueo = [
  {
    link: "/gestion/arqueo/panel-transacciones",
    label: <AppIcons Logo={"RECAUDO"} name="Panel de transacciones" />,
    component: Panel,
    permission: [3],
  },
  {
    link: "/gestion/arqueo/carga-comprobante",
    label: <AppIcons Logo={"RECAUDO"} name="Transportadora y Consignaciones" />,
    component: CargaComprobante,
    permission: [3],
  },
  {
    link: "/gestion/arqueo/validar-comprobante",
    label: <AppIcons Logo={"RECAUDO"} name="Análisis de comprobante" />,
    component: PanelConsignaciones,
    permission: [3],
  },
  {
    link: "/gestion/arqueo/parametrizar-cuenta",
    label: <AppIcons Logo={"RECAUDO"} name="Parametrizar cuenta(s) recaudo" />,
    component: ParametrizacionRecaudo,
    permission: [3],
  },
  {
    link: "/gestion/arqueo/historial-cierre",
    label: <AppIcons Logo={"RECAUDO"} name="Históricos de cierre de caja" />,
    component: PanelHistorico,
    permission: [3],
  },
];
