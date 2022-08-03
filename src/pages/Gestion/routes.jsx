import { lazy } from "react";
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/**
 * COMPONENTES ROL CAJERO
 */
const CargaComprobante = lazy(() => import("./Views/CargaComprobante"));
const Panel = lazy(() => import("./Views/Panel"));
/**
 * COMPONENTES ROL ANALISTA
 */
const PanelConsignaciones = lazy(() => import("./Views/PanelConsignaciones"));

const PanelHistorico = lazy(() => import("./Views/PanelHistorico"));

const ParametrizacionRecaudo = lazy(() =>
  import("./Views/ParametrizacionRecaudo")
);

export const rutasGestion = [
  {
    link: "/gestion/panel_transacciones",
    label: <AppIcons Logo={"RECAUDO"} name="Panel de transacciones" />,
    component: Panel,
    permission: [3],
  },
  {
    link: "/gestion/carga_comprobante",
    label: <AppIcons Logo={"RECAUDO"} name="Cargar comprobantes" />,
    component: CargaComprobante,
    permission: [3],
  },
  {
    link: "/gestion/validar_comprobante",
    label: <AppIcons Logo={"RECAUDO"} name="Análisis de comprobante" />,
    component: PanelConsignaciones,
    permission: [3],
  },
  {
    link: "/gestion/parametrizar_cuenta",
    label: <AppIcons Logo={"RECAUDO"} name="Parametrizar cuenta(s) recaudo" />,
    component: ParametrizacionRecaudo,
    permission: [3],
  },
  {
    link: "/gestion/historial_cierre",
    label: <AppIcons Logo={"RECAUDO"} name="Históricos de cierre de caja" />,
    component: PanelHistorico,
    permission: [3],
  },
];
