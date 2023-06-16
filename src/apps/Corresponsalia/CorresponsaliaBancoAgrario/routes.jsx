import { lazy } from "react";
import { enumPermisosAgrario } from "./enumPermisosAgrario";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../../components/Base/AppIcons"));

/**
 * Corresponsalia Banco Agrario
 */
const CorresponsaliaBancoAgrario = lazy(() =>
  import("./CorresponsaliaBancoAgrario")
);

const PagarRunt = lazy(() => import("./Views/Runt/PagarRunt"));

const TrxCuentasBancoAgrario = lazy(() =>
  import("./CorresponsaliaBancoAgrario")
);
const RetiroEfectivoBancoAgrario = lazy(() =>
  import("./Views/TrxCuentas/RetiroEfectivo")
);
const DepositoBancoAgrario = lazy(() =>
  import("./Views/TrxCuentas/DepositoEfectivo")
);
const ConveniosRecaudoAgrario = lazy(() =>
  import("./Views/RecaudoServiciosPublicosPrivados/ConveniosRecaudoAgrario")
);
const RecaudoServiciosPublicosPrivadosAgrario = lazy(() =>
  import(
    "./Views/RecaudoServiciosPublicosPrivados/RecaudoServiciosPublicosPrivadosAgrario"
  )
);
const RecaudoServiciosPublicosPrivadosLecturaCodigoBarrasAgrario = lazy(() =>
  import(
    "./Views/RecaudoServiciosPublicosPrivados/RecaudoServiciosPublicosPrivadosLecturaCodigoBarrasAgrario"
  )
);
const SeleccionServicioPagarAgrario = lazy(() =>
  import(
    "./Views/RecaudoServiciosPublicosPrivados/SeleccionServicioPagarAgrario"
  )
);
const RecaudoServiciosPublicosPrivadosMenuAgrario = lazy(() =>
  import("./Views/RecaudoServiciosPublicosPrivadosMenuAval")
);

const listPermissions = Object.values(enumPermisosAgrario);
export const listPermissionsAgrario = listPermissions;

const rutasAgrarioCB = {
  link: "/corresponsalia/corresponsalia-banco-agrario",
  label: <AppIcons Logo={"MARKETPLACE"} name="Corresponsalía Banco Agrario" />,
  component: CorresponsaliaBancoAgrario,
  permission: [...listPermissionsAgrario],
  subRoutes: [
    {
      link: "/corresponsalia/corresponsalia-banco-agrario/transacciones-cuentas",
      label: (
        <AppIcons
          Logo={"MARKETPLACE"}
          name="Transacciones cuentas Banco Agrario"
        />
      ),
      component: TrxCuentasBancoAgrario,
      permission: [enumPermisosAgrario.agrario_cb_depositos],
      subRoutes: [
        {
          link: "/corresponsalia/corresponsalia-banco-agrario/transacciones-cuentas/deposito",
          label: <AppIcons Logo={"MARKETPLACE"} name="Depósito" />,
          component: DepositoBancoAgrario,
          permission: [enumPermisosAgrario.agrario_cb_depositos],
        },
        {
          link: "/corresponsalia/corresponsalia-banco-agrario/transacciones-cuentas/retiro",
          label: <AppIcons Logo={"MARKETPLACE"} name="Retiro" />,
          component: RetiroEfectivoBancoAgrario,
          permission: [enumPermisosAgrario.agrario_cb_retiros],
        },
      ],
    },
    {
      link: "/corresponsalia/corresponsalia-banco-agrario/recaudoServiciosPublicosPrivados",
      label: (
        <AppIcons
          Logo={"MARKETPLACE"}
          name="Recaudo servicios públicos y privados"
        />
      ),
      component: RecaudoServiciosPublicosPrivadosMenuAgrario,
      permission: [
        enumPermisosAgrario.agrario_cb_recaudo,
        enumPermisosAgrario.agrario_cb_convenios_recaudo,
      ],
      subRoutes: [
        {
          link: "/corresponsalia/corresponsalia-banco-agrario/recaudoServiciosPublicosPrivados/seleccion",
          label: <AppIcons Logo={"MARKETPLACE"} name="Recaudo manual" />,
          component: SeleccionServicioPagarAgrario,
          permission: [enumPermisosAgrario.agrario_cb_recaudo],
        },
        {
          link: "/corresponsalia/corresponsalia-banco-agrario/recaudoServiciosPublicosPrivados/codbarras",
          label: (
            <AppIcons Logo={"MARKETPLACE"} name="Recaudo código de barras" />
          ),
          component: RecaudoServiciosPublicosPrivadosLecturaCodigoBarrasAgrario,
          permission: [enumPermisosAgrario.agrario_cb_recaudo],
        },
        {
          link: "/corresponsalia/corresponsalia-banco-agrario/recaudoServiciosPublicosPrivados/manual",
          label: <AppIcons Logo={"MARKETPLACE"} name="Recaudo manual" />,
          component: RecaudoServiciosPublicosPrivadosAgrario,
          permission: [enumPermisosAgrario.agrario_cb_recaudo],
          show: false,
        },
        {
          link: "/corresponsalia/corresponsalia-banco-agrario/recaudoServiciosPublicosPrivados/convenios",
          label: (
            <AppIcons Logo={"MARKETPLACE"} name="Convenios recaudo Agrario" />
          ),
          component: ConveniosRecaudoAgrario,
          permission: [enumPermisosAgrario.agrario_cb_convenios_recaudo],
        },
      ],
    },

    {
      link: "/runt/pagar-runt",
      label: <AppIcons Logo={"DAVIVIENDA_PAGO_POR_GIRO"} name={"Pagar RUNT"} />,
      component: PagarRunt,
      permission: [...listPermissionsAgrario],
      subRoutes: [],
    },
  ],
};
export default rutasAgrarioCB;
