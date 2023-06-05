import { lazy } from "react";
import { enumPermisosAval } from "./enumPermisosAval";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../../components/Base/AppIcons"));

/**
 * Corresponsalia Grupo Aval
 */
const CorresponsaliaGrupoAval = lazy(() => import("./CorresponsaliaGrupoAval"));
// const AhorrosCorrienteGrupoAval = lazy(() =>
//  import(
//    "../apps/Corresponsalia/CorresponsaliaDavivienda/Views/AhorrosCorriente"
//  )
// );
const DepositoGrupoAval = lazy(() =>
  import("./Views/AhorrosCorriente/Deposito")
);
const RetiroGrupoAval = lazy(() => import("./Views/AhorrosCorriente/Retiro"));
const RecaudoServiciosPublicosPrivadosMenuAval = lazy(() =>
  import("./Views/RecaudoServiciosPublicosPrivadosMenuAval")
);
const RecaudoServiciosPublicosPrivadosLecturaCodigoBarrasAval = lazy(() =>
  import(
    "./Views/RecaudoServiciosPublicosPrivados/RecaudoServiciosPublicosPrivadosLecturaCodigoBarrasAval"
  )
);
const SeleccionServicioPagarAval = lazy(() =>
  import("./Views/RecaudoServiciosPublicosPrivados/SeleccionServicioPagarAval")
);
const RecaudoServiciosPublicosPrivadosAval = lazy(() =>
  import(
    "./Views/RecaudoServiciosPublicosPrivados/RecaudoServiciosPublicosPrivadosAval"
  )
);
const ConveniosRecaudoAval = lazy(() =>
  import("./Views/RecaudoServiciosPublicosPrivados/ConveniosRecaudoAval")
);
const PagoTerceros = lazy(() => import("./Views/PagoTerceros/PagoTerceros"));
const PagoSubsidios = lazy(() => import("./Views/PagoSubsidios/PagoSubsidios"));
const AhorrosCorriente = lazy(() => import("./Views/AhorrosCorriente"));

const listPermissions = Object.values(enumPermisosAval);
export const listPermissionsAval 

const rutasAvalCB = {
  link: "/corresponsalia/CorresponsaliaGrupoAval",
  label: <AppIcons Logo={"MARKETPLACE"} name='Corresponsalía Grupo Aval' />,
  component: CorresponsaliaGrupoAval,
  permission: listPermissionsAval,
  subRoutes: [
    {
      link: "/corresponsalia/CorresponsaliaGrupoAval/ahorrosCorriente",
      label: (
        <AppIcons
          Logo={"MARKETPLACE"}
          name='Transacciones cuentas Grupo Aval'
        />
      ),
      component: AhorrosCorriente,
      permission: [
        enumPermisosAval.aval_cb_depositos,
        enumPermisosAval.aval_cb_retiros,
      ],
      subRoutes: [
        {
          link: "/corresponsalia/CorresponsaliaGrupoAval/ahorrosCorriente/deposito",
          label: <AppIcons Logo={"MARKETPLACE"} name='Depósitos' />,
          component: DepositoGrupoAval,
          permission: [enumPermisosAval.aval_cb_depositos],
        },
        {
          link: "/corresponsalia/CorresponsaliaGrupoAval/ahorrosCorriente/retiro",
          label: <AppIcons Logo={"MARKETPLACE"} name='Retiros' />,
          component: RetiroGrupoAval,
          permission: [enumPermisosAval.aval_cb_retiros],
        },
      ],
    },
    {
      link: "/corresponsalia/CorresponsaliaGrupoAval/recaudoServiciosPublicosPrivados",
      label: (
        <AppIcons
          Logo={"MARKETPLACE"}
          name='Recaudo servicios públicos y privados'
        />
      ),
      component: RecaudoServiciosPublicosPrivadosMenuAval,
      permission: [
        enumPermisosAval.aval_cb_recaudo,
        enumPermisosAval.aval_cb_convenios_recaudo,
      ],
      subRoutes: [
        {
          link: "/corresponsalia/CorresponsaliaGrupoAval/recaudoServiciosPublicosPrivados/seleccion",
          label: <AppIcons Logo={"MARKETPLACE"} name='Recaudo manual' />,
          component: SeleccionServicioPagarAval,
          permission: [enumPermisosAval.aval_cb_recaudo],
        },
        {
          link: "/corresponsalia/CorresponsaliaGrupoAval/recaudoServiciosPublicosPrivados/codbarras",
          label: (
            <AppIcons Logo={"MARKETPLACE"} name='Recaudo código de barras' />
          ),
          component: RecaudoServiciosPublicosPrivadosLecturaCodigoBarrasAval,
          permission: [enumPermisosAval.aval_cb_recaudo],
        },
        {
          link: "/corresponsalia/CorresponsaliaGrupoAval/recaudoServiciosPublicosPrivados/manual",
          label: <AppIcons Logo={"MARKETPLACE"} name='Recaudo manual' />,
          component: RecaudoServiciosPublicosPrivadosAval,
          permission: [enumPermisosAval.aval_cb_recaudo],
          show: false,
        },
        {
          link: "/corresponsalia/CorresponsaliaGrupoAval/recaudoServiciosPublicosPrivados/convenios",
          label: (
            <AppIcons Logo={"MARKETPLACE"} name='Convenios recaudo AVAL' />
          ),
          component: ConveniosRecaudoAval,
          permission: [enumPermisosAval.aval_cb_convenios_recaudo],
        },
      ],
    },
    {
      link: "/corresponsalia/CorresponsaliaGrupoAval/pagoterceros",
      label: <AppIcons Logo={"MARKETPLACE"} name='Pago de terceros' />,
      component: PagoTerceros,
      permission: [enumPermisosAval.aval_cb_pago_terceros],
    },
    {
      link: "/corresponsalia/CorresponsaliaGrupoAval/pagosubsidios",
      label: <AppIcons Logo={"MARKETPLACE"} name='Pago de subsidios' />,
      component: PagoSubsidios,
      permission: [enumPermisosAval.aval_cb_pago_subsidios],
    },
  ],
};
export default rutasAvalCB;
