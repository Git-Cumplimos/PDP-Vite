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
const TransaccionRetiroDale = lazy(() =>
  import("./Views/Dale/TransaccionRetiroDale")
);
const MenuTransaccionesDaleAval = lazy(() =>
  import("./Views/Dale/MenuTransaccionesDaleAval")
);
const TransaccionRecaudoPila = lazy(() =>
  import("./Views/RecaudoPila/TransaccionRecaudoPila")
);

const listPermissions = Object.values(enumPermisosAval);
export const listPermissionsAval = listPermissions;

const rutasAvalCB = {
  link: "/corresponsalia/CorresponsaliaGrupoAval",
  label: <AppIcons Logo={"AVAL"} name='Corresponsalía Grupo Aval' />,
  component: CorresponsaliaGrupoAval,
  permission: listPermissionsAval,
  subRoutes: [
    {
      link: "/corresponsalia/CorresponsaliaGrupoAval/ahorrosCorriente",
      label: (
        <AppIcons
          Logo={"AVAL_TRANSACCIONES_CUENTAS"}
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
          label: <AppIcons Logo={"AVAL_DEPOSITO"} name='Depósitos' />,
          component: DepositoGrupoAval,
          permission: [enumPermisosAval.aval_cb_depositos],
        },
        {
          link: "/corresponsalia/CorresponsaliaGrupoAval/ahorrosCorriente/retiro",
          label: <AppIcons Logo={"AVAL_RETIROS"} name='Retiros' />,
          component: RetiroGrupoAval,
          permission: [enumPermisosAval.aval_cb_retiros],
        },
      ],
    },
    {
      link: "/corresponsalia/CorresponsaliaGrupoAval/recaudoServiciosPublicosPrivados",
      label: (
        <AppIcons
          Logo={"AVAL_RECAUDO_SERVICIOS_PUBLICOS_PRIVADOS"}
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
          label: (
            <AppIcons Logo={"AVAL_RECAUDO_MANUAL"} name='Recaudo manual' />
          ),
          component: SeleccionServicioPagarAval,
          permission: [enumPermisosAval.aval_cb_recaudo],
        },
        {
          link: "/corresponsalia/CorresponsaliaGrupoAval/recaudoServiciosPublicosPrivados/codbarras",
          label: (
            <AppIcons
              Logo={"AVAL_RECAUDO_CODIGO_DE_BARRAS"}
              name='Recaudo código de barras'
            />
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
            <AppIcons
              Logo={"AVAL_CONVENIO_RECAUDO"}
              name='Convenios recaudo AVAL'
            />
          ),
          component: ConveniosRecaudoAval,
          permission: [enumPermisosAval.aval_cb_convenios_recaudo],
        },
      ],
    },
    {
      link: "/corresponsalia/CorresponsaliaGrupoAval/pagoterceros",
      label: (
        <AppIcons Logo={"AVAL_PAGO_DE_TERCEROS"} name='Pago de terceros' />
      ),
      component: PagoTerceros,
      permission: [enumPermisosAval.aval_cb_pago_terceros],
    },
    {
      link: "/corresponsalia/CorresponsaliaGrupoAval/pagosubsidios",
      label: (
        <AppIcons Logo={"AVAL_PAGO_DE_SUBSIDIOS"} name='Pago de subsidios' />
      ),
      component: PagoSubsidios,
      permission: [enumPermisosAval.aval_cb_pago_subsidios],
    },
    {
      link: "/corresponsalia/CorresponsaliaGrupoAval/dale",
      label: (
        <AppIcons
          Logo={"AVAL_RECAUDO_SERVICIOS_PUBLICOS_PRIVADOS"}
          name='Dale'
        />
      ),
      component: MenuTransaccionesDaleAval,
      permission: [enumPermisosAval.RETIRO_OTP_DALE],
      subRoutes: [
        {
          link: "/corresponsalia/CorresponsaliaGrupoAval/dale/retiro",
          label: <AppIcons Logo={"AVAL_RECAUDO_MANUAL"} name='Retiro OTP' />,
          component: TransaccionRetiroDale,
          permission: [enumPermisosAval.RETIRO_OTP_DALE],
        },
      ],
    },
    {
      link: "/corresponsalia/CorresponsaliaGrupoAval/recaudoPila",
      label: (
        <AppIcons Logo={"RECAUDO_PILA"} name='Recaudo Pila' />
      ),
      component: TransaccionRecaudoPila,
      permission: [enumPermisosAval.RECAUDO_PILA],
    },
  ],
};
export default rutasAvalCB;
