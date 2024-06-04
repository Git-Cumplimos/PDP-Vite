import { lazy } from "react";
import { enumPermisosItau } from "./enumPermisosItau";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../../components/Base/AppIcons"));

/**
 * Corresponsalia Itau
 */
const CorresponsaliaItau = lazy(() => import("./CorresponsaliaItau"));

const RecaudoServiciosPublicosPrivadosMenuItau = lazy(() =>
  import("./Views/RecaudoServiciosPublicosPrivadosMenuItau")
);
const RecaudoManualServiciosItau = lazy(() =>
  import("./Views/RecaudoServiciosPublicosPrivados/RecaudoManualServiciosItau")
);
const RecaudoCodBarrasServiciosCodigoBarrasItau = lazy(() =>
  import(
    "./Views/RecaudoServiciosPublicosPrivados/RecaudoCodBarrasServiciosCodigoBarrasItau"
  )
);

const SeleccionConvenioRecaudoServiciosItau = lazy(() =>
  import(
    "./Views/RecaudoServiciosPublicosPrivados/SeleccionConvenioRecaudoServiciosItau"
  )
);

const RetiroItau = lazy(() => import("./Views/TrxCuentas/Retiro"));

const PagoProductosPropiosItau = lazy(() => import("./Views/TrxCuentas/PagoProductosPropiosItau"));

export const listPermissionsItau = Object.values(enumPermisosItau);

const rutasItauCB = {
  //corresponsaliaItau
  link: "/corresponsalia/corresponsalia-itau",
  label: <AppIcons Logo={"ITAU"} name="Corresponsalía Itaú" />,
  component: CorresponsaliaItau,
  permission: listPermissionsItau,
  subRoutes: [
    {
      link: "/corresponsalia/corresponsalia-itau/recaudo-servicios-publicos-privados",
      label: (
        <AppIcons
          Logo={"MARKETPLACE"}
          name="Recaudo servicios públicos y privados"
        />
      ),
      component: RecaudoServiciosPublicosPrivadosMenuItau,
      permission: [enumPermisosItau.RECAUDO_SERVICIOS_PUBLICOS_ITAU],
      subRoutes: [
        {
          link: "/corresponsalia/corresponsalia-itau/recaudo-servicios-publicos-privados/seleccion-convenio",
          label: <AppIcons Logo={"MARKETPLACE"} name="Recaudo manual" />,
          component: SeleccionConvenioRecaudoServiciosItau,
          permission: [enumPermisosItau.RECAUDO_SERVICIOS_PUBLICOS_ITAU],
        },
        {
          link: "/corresponsalia/corresponsalia-itau/recaudo-servicios-publicos-privados/codigo-barras",
          label: (
            <AppIcons Logo={"MARKETPLACE"} name="Recaudo código de barras" />
          ),
          component: RecaudoCodBarrasServiciosCodigoBarrasItau,
          permission: [enumPermisosItau.RECAUDO_SERVICIOS_PUBLICOS_ITAU],
        },
        {
          link: "/corresponsalia/corresponsalia-itau/recaudo-servicios-publicos-privados/recaudo-manual",
          label: <AppIcons Logo={"MARKETPLACE"} name="Recaudo manual" />,
          component: RecaudoManualServiciosItau,
          permission: [enumPermisosItau.RECAUDO_SERVICIOS_PUBLICOS_ITAU],
          show: false,
        },
      ],
    },
    {
      link: "/corresponsalia/corresponsalia-itau/retiro",
      label: <AppIcons Logo={"MARKETPLACE"} name="Retiro" />,
      component: RetiroItau,
      permission: [enumPermisosItau.RETIRO_ITAU],
    },
    {
      link: "/corresponsalia/corresponsalia-itau/pago-productos-propios",
      label: <AppIcons Logo={"MARKETPLACE"} name="Pago Productos Propios" />,
      component: PagoProductosPropiosItau,
      permission: [enumPermisosItau.PAGO_PRODUCTOS_PROPIOS_ITAU],
    },
  ],
};

export default rutasItauCB;