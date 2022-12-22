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

const ContenedorRunt = lazy(() => import("./ContenedorRunt"));
const PagarRunt = lazy(() => import("./Views/PagarRunt"));

const TrxCuentasBancoAgrario = lazy(() =>
  import("./CorresponsaliaBancoAgrario")
);
const RetiroBancoAgrario = lazy(() =>
  import("./Views/Retiro/RetiroBancoAgrario")
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
export const listPermissionsAgrario = listPermissions.splice(
  listPermissions.length / 2
);

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
        {
          link: "/runt",
          label: <AppIcons Logo={"IMPUESTO"} name={"Runt"} />,
          component: ContenedorRunt,
          permission: [enumPermisosAgrario.agrario_cb_convenios_recaudo],
          // permission: [55, 56, 57],
          subRoutes: [
            {
              link: "/runt/pagar-runt",
              label: <AppIcons Logo={"RETIRO"} name={"Pagar Runt"} />,
              component: PagarRunt,
              permission: [enumPermisosAgrario.agrario_cb_convenios_recaudo],
              // permission: [56, 57],
            },
          ],
        },
      ],
    },
    // {
    //   link: "/corresponsalia/corresponsalia-banco-agrario/retiro",
    //   label: <AppIcons Logo={"MARKETPLACE"} name="Retiro" />,
    //   component: RetiroBancoAgrario,
    //   permission: [72],
    //   subRoutes: [
    //     {
    //       link: "/corresponsalia/corresponsalia-banco-agrario/retiro/retiro-efectivo",
    //       label: (
    //         <AppIcons Logo={"MARKETPLACE"} name="Retiro en efectivo" />
    //       ),
    //       component: RetiroEfectivoBancoAgrario,
    //       permission: [73],
    //     },
    //   ],
    // },
  ],
};
export default rutasAgrarioCB;
