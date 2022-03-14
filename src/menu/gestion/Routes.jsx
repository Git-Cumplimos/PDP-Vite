import AppIcons from "../../components/Base/AppIcons";
import { lazy } from "react";
/**
 * COMPONENTES ROL CAJERO
 */
const CargaComprobante = lazy(() => import("./Views/CargaComprobante"));
const Panel = lazy(() => import("./Views/Panel"));
/**
 * COMPONENTES ROL ANALISTA
 */
const PanelConsignaciones = lazy(() => import("./Views/PanelConsignaciones"));
const ParametrizacionRecaudo = lazy(() =>
  import("./Views/ParametrizacionRecaudo")
);

export const rutasGestion = [
  {
    link: "/gestion/panel_transacciones",
    label: <AppIcons Logo={"RECAUDO"} name="Panel de transacciones"></AppIcons>,
    component: Panel,
    permission: [3],
  },
  {
    link: "/gestion/carga_comprobante",
    label: <AppIcons Logo={"RECAUDO"} name="Cargar comprobantes"></AppIcons>,
    component: CargaComprobante,
    permission: [3],
  },
  {
    link: "/gestion/validar_comprobante",
    label: <AppIcons Logo={"RECAUDO"} name="Validar comprobantes"></AppIcons>,
    component: PanelConsignaciones,
    permission: [3],
  },
  {
    link: "/gestion/parametrizar_cuenta",
    label: (
      <AppIcons
        Logo={"RECAUDO"}
        name="Parametrizar cuenta(s) recaudo"
      ></AppIcons>
    ),
    component: ParametrizacionRecaudo,
    permission: [3],
  },
];
