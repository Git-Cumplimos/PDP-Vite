import { lazy } from "react";
import { enumPermisosItau } from "./enumPermisosItau";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../../components/Base/AppIcons"));

/**
 * Corresponsalia Itau
 */
const CorresponsaliaItau = lazy(() =>
  import("./CorresponsaliaItau")
);

const RecaudoServiciosPublicosPrivadosMenuItau = lazy(() =>
  import("./Views/RecaudoServiciosPublicosPrivadosMenuItau")
);
const RecaudoManualServiciosItau = lazy(() =>
  import(
    "./Views/RecaudoServiciosPublicosPrivados/RecaudoManualServiciosItau"
  )
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
      permission: [
        enumPermisosItau.RECAUDO_SERVICIOS_PUBLICOS_CAJA_SOCIAL,
      ],
      subRoutes: [
        {
          link: "/corresponsalia/corresponsalia-itau/recaudo-servicios-publicos-privadosseleccion-convenio",
          label: <AppIcons Logo={"MARKETPLACE"} name="Recaudo manual" />,
          component: SeleccionConvenioRecaudoServiciosItau,
          permission: [
            enumPermisosItau.RECAUDO_SERVICIOS_PUBLICOS_CAJA_SOCIAL,
          ],
        },
        {
          link: "/corresponsalia/corresponsalia-itau/recaudo-servicios-publicos-privadoscodigo-barras",
          label: (
            <AppIcons Logo={"MARKETPLACE"} name="Recaudo código de barras" />
          ),
          component: RecaudoCodBarrasServiciosCodigoBarrasItau,
          permission: [
            enumPermisosItau.RECAUDO_SERVICIOS_PUBLICOS_CAJA_SOCIAL,
          ],
        },
        {
          link: "/corresponsalia/corresponsalia-itau/recaudo-servicios-publicos-privadosrecaudo-manual",
          label: <AppIcons Logo={"MARKETPLACE"} name="Recaudo manual" />,
          component: RecaudoManualServiciosItau,
          permission: [
            enumPermisosItau.RECAUDO_SERVICIOS_PUBLICOS_CAJA_SOCIAL,
          ],
          show: false,
        },
      ],
    },
  ],
};

export default rutasItauCB;
