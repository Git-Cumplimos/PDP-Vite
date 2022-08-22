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
    link: "/gestion/arqueo/panel_transacciones",
    label: <AppIcons Logo={"RECAUDO"} name="Panel de transacciones" />,
    component: Panel,
    permission: [3],
  },
  {
    link: "/gestion/arqueo/carga_comprobante",
    label: <AppIcons Logo={"RECAUDO"} name="Transportadora y Consignaciones" />,
    component: CargaComprobante,
    permission: [3],
  },
  {
    link: "/gestion/arqueo/validar_comprobante",
    label: <AppIcons Logo={"RECAUDO"} name="Análisis de comprobante" />,
    component: PanelConsignaciones,
    permission: [3],
  },
  {
    link: "/gestion/arqueo/parametrizar_cuenta",
    label: <AppIcons Logo={"RECAUDO"} name="Parametrizar cuenta(s) recaudo" />,
    component: ParametrizacionRecaudo,
    permission: [3],
  },
  {
    link: "/gestion/arqueo/historial_cierre",
    label: <AppIcons Logo={"RECAUDO"} name="Históricos de cierre de caja" />,
    component: PanelHistorico,
    permission: [3],
  },
];
