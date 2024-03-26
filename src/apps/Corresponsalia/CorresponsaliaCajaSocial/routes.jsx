import { lazy } from "react";
import { enumPermisosCajaSocial } from "./enumPermisosCajaSocial";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../../components/Base/AppIcons"));

/**
 * Corresponsalia CajaSocial
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

export const listPermissionsCajaSocial = Object.values(enumPermisosCajaSocial);

const rutasCajaSocialCB = {
  //corresponsaliaCajaSocial
  link: "/corresponsalia/corresponsalia-caja-social",
  label: <AppIcons Logo={"CAJA_SOCIAL"} name="Corresponsalía BCSC" />,
  component: CorresponsaliaCajaSocial,
  permission: listPermissionsCajaSocial,
  subRoutes: [
    {
      link: "/corresponsalia/corresponsalia-caja-social/deposito",
      label: <AppIcons Logo={"CAJA_SOCIAL_DEPOSITO"} name="Depósitos" />,
      component: DepositoCajaSocial,
      permission: [enumPermisosCajaSocial.DEPOSITO_CAJA_SOCIAL],
    },
    {
      link: "/corresponsalia/corresponsalia-caja-social/pago-produtos-propios",
      label: (
        <AppIcons
          Logo={"CAJA_SOCIAL_DEPOSITO"}
          name="Pago de Productos Propios"
        />
      ),
      component: PagoProductosPropiosCajaSocial,
      permission: [enumPermisosCajaSocial.PAGO_PRODUTOS_PROPIOS_CAJA_SOCIAL],
    },
    {
      link: "/corresponsalia/corresponsalia-caja-social/recaudo-servicios-publicos-privados",
      label: (
        <AppIcons
          Logo={"MARKETPLACE"}
          name="Recaudo servicios públicos y privados"
        />
      ),
      component: RecaudoServiciosPublicosPrivadosMenuCajaSocial,
      permission: [
        enumPermisosCajaSocial.RECAUDO_SERVICIOS_PUBLICOS_CAJA_SOCIAL,
      ],
      subRoutes: [
        {
          link: "/corresponsalia/corresponsalia-caja-social/recaudo-servicios-publicos-privados/seleccion-convenio",
          label: <AppIcons Logo={"MARKETPLACE"} name="Recaudo manual" />,
          component: SeleccionConvenioRecaudoServiciosCajaSocial,
          permission: [
            enumPermisosCajaSocial.RECAUDO_SERVICIOS_PUBLICOS_CAJA_SOCIAL,
          ],
        },
        {
          link: "/corresponsalia/corresponsalia-caja-social/recaudo-servicios-publicos-privados/codigo-barras",
          label: (
            <AppIcons Logo={"MARKETPLACE"} name="Recaudo código de barras" />
          ),
          component: RecaudoCodBarrasServiciosCodigoBarrasCajaSocial,
          permission: [
            enumPermisosCajaSocial.RECAUDO_SERVICIOS_PUBLICOS_CAJA_SOCIAL,
          ],
        },
        {
          link: "/corresponsalia/corresponsalia-caja-social/recaudo-servicios-publicos-privados/recaudo-manual",
          label: <AppIcons Logo={"MARKETPLACE"} name="Recaudo manual" />,
          component: RecaudoManualServiciosCajaSocial,
          permission: [
            enumPermisosCajaSocial.RECAUDO_SERVICIOS_PUBLICOS_CAJA_SOCIAL,
          ],
          show: false,
        },
      ],
    },
  ],
};

export default rutasCajaSocialCB;
