import { lazy } from "react";
import { enumPermisosItau } from "./enumPermisosItau";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../../components/Base/AppIcons"));

/**
 * Corresponsalia Itau
 */
const CorresponsaliaCajaSocial = lazy(() =>
  import("./CorresponsaliaCajaSocial")
);
const DepositoCajaSocial = lazy(() => import("./Views/DepositoCajaSocial"));
const RecaudoServiciosPublicosPrivadosMenuCajaSocial = lazy(() =>
  import("./Views/RecaudoServiciosPublicosPrivadosMenuCajaSocial")
);
const RecaudoManualServiciosCajaSocial = lazy(() =>
  import(
    "./Views/RecaudoServiciosPublicosPrivados/RecaudoManualServiciosCajaSocial"
  )
);
const RecaudoCodBarrasServiciosCodigoBarrasCajaSocial = lazy(() =>
  import(
    "./Views/RecaudoServiciosPublicosPrivados/RecaudoCodBarrasServiciosCodigoBarrasCajaSocial"
  )
);

const PagoProductosPropiosCajaSocial = lazy(() =>
  import("./Views/PagoProductosPropiosCajaSocial")
);
const SeleccionConvenioRecaudoServiciosCajaSocial = lazy(() =>
  import(
    "./Views/RecaudoServiciosPublicosPrivados/SeleccionConvenioRecaudoServiciosCajaSocial"
  )
);

export const listPermissionsCajaSocial = Object.values(enumPermisosItau);

const rutasItauCB = {
  //corresponsaliaItau
  link: "/corresponsalia/corresponsalia-itau",
  label: <AppIcons Logo={"CAJA_SOCIAL"} name="Corresponsalía Itaú" />,
  component: CorresponsaliaCajaSocial,
  permission: listPermissionsCajaSocial,
  subRoutes: [
    {
      link: "/corresponsalia/corresponsalia-itau/recaudo-servicios-publicos-privados",
      label: (
        <AppIcons
          Logo={"MARKETPLACE"}
          name="Recaudo servicios públicos y privados"
        />
      ),
      component: RecaudoServiciosPublicosPrivadosMenuCajaSocial,
      permission: [
        enumPermisosItau.RECAUDO_SERVICIOS_PUBLICOS_CAJA_SOCIAL,
      ],
      subRoutes: [
        {
          link: "/corresponsalia/corresponsalia-caja-social/recaudo-servicios-publicos-privados/seleccion-convenio",
          label: <AppIcons Logo={"MARKETPLACE"} name="Recaudo manual" />,
          component: SeleccionConvenioRecaudoServiciosCajaSocial,
          permission: [
            enumPermisosItau.RECAUDO_SERVICIOS_PUBLICOS_CAJA_SOCIAL,
          ],
        },
        {
          link: "/corresponsalia/corresponsalia-caja-social/recaudo-servicios-publicos-privados/codigo-barras",
          label: (
            <AppIcons Logo={"MARKETPLACE"} name="Recaudo código de barras" />
          ),
          component: RecaudoCodBarrasServiciosCodigoBarrasCajaSocial,
          permission: [
            enumPermisosItau.RECAUDO_SERVICIOS_PUBLICOS_CAJA_SOCIAL,
          ],
        },
        {
          link: "/corresponsalia/corresponsalia-caja-social/recaudo-servicios-publicos-privados/recaudo-manual",
          label: <AppIcons Logo={"MARKETPLACE"} name="Recaudo manual" />,
          component: RecaudoManualServiciosCajaSocial,
          permission: [
            enumPermisosItau.RECAUDO_SERVICIOS_PUBLICOS_CAJA_SOCIAL,
          ],
          show: false,
        },
      ],
    },
  ],
};

export default rutasCajaSocialCB;
