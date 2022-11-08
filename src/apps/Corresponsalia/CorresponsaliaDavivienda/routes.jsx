import { lazy } from "react";
import { enumPermisosDavivienda } from "./enumPermisosDavivienda";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../../components/Base/AppIcons"));

/**
 * Corresponsalia Davivienda
 */
const CorresponsaliaDavivienda = lazy(() =>
  import("./CorresponsaliaDavivienda")
);
const DaviplataCB = lazy(() => import("./Views/Daviplata"));
const CashIn = lazy(() => import("./Views/Daviplata/Deposito"));
const CashOut = lazy(() => import("./Views/Daviplata/Retiro"));
const PagoGiro = lazy(() => import("./Views/Daviplata/PagoGiro"));

const AhorrosCorrienteCB = lazy(() => import("./Views/AhorrosCorriente"));
const DepositoCB = lazy(() => import("./Views/AhorrosCorriente/Deposito"));
const RetiroCB = lazy(() => import("./Views/AhorrosCorriente/Retiro"));
const PagoDeProductosPropios = lazy(() =>
  import("./Views/PagoDeProductosPropios")
);
const SeleccionServicioPagar = lazy(() =>
  import("./Views/RecaudoServiciosPublicosPrivados/SeleccionServicioPagar")
);
const RecaudoServiciosPublicosPrivados = lazy(() =>
  import(
    "./Views/RecaudoServiciosPublicosPrivados/RecaudoServiciosPublicosPrivados"
  )
);
const RecaudoServiciosPublicosPrivadosMenu = lazy(() =>
  import("./Views/RecaudoServiciosPublicosPrivadosMenu")
);

const RecaudoServiciosPublicosPrivadosLecturaCodigoBarras = lazy(() =>
  import(
    "./Views/RecaudoServiciosPublicosPrivados/RecaudoServiciosPublicosPrivadosLecturaCodigoBarras"
  )
);
const listPermissions = Object.values(enumPermisosDavivienda);
export const listPermissionsDavivienda = listPermissions.splice(
  listPermissions.length / 2
);

const rutasDaviviendaCB = {
  //corresponsaliaDavivienda
  link: "/corresponsalia/corresponsaliaDavivienda",
  label: <AppIcons Logo={"Corresponsalia"} name='Corresponsalía Davivienda' />,
  component: CorresponsaliaDavivienda,
  permission: listPermissionsDavivienda,
  subRoutes: [
    {
      link: "/corresponsalia/corresponsaliaDavivienda/Daviplata",
      label: <AppIcons Logo={"Daviplata"} name='DaviPlata' />,
      component: DaviplataCB,
      permission: [
        enumPermisosDavivienda.davivienda_cb_cash_in,
        enumPermisosDavivienda.davivienda_cb_cash_out,
      ],
      subRoutes: [
        {
          link: "/corresponsalia/corresponsaliaDavivienda/DaviplatacashIn",
          label: (
            <AppIcons Logo={"DepositoDaviplata"} name='Depósito DaviPlata' />
          ),
          component: CashIn,
          permission: [enumPermisosDavivienda.davivienda_cb_cash_in],
        },
        {
          link: "/corresponsalia/corresponsaliaDavivienda/DaviplatacashOut",
          label: <AppIcons Logo={"RetiroDaviplata"} name='Retiro DaviPlata' />,
          component: CashOut,
          permission: [enumPermisosDavivienda.davivienda_cb_cash_out],
        },
      ],
    },

    {
      link: "/corresponsalia/corresponsaliaDavivienda/ahorrosCorriente",
      label: (
        <AppIcons
          Logo={"RetirosYDepositos"}
          name='Retiros y Depósitos Davivienda'
        />
      ),
      component: AhorrosCorrienteCB,
      permission: [
        enumPermisosDavivienda.davivienda_cb_depositos,
        enumPermisosDavivienda.davivienda_cb_retiros,
      ],
      subRoutes: [
        {
          link: "/corresponsalia/corresponsaliaDavivienda/ahorrosCorriente/deposito",
          label: <AppIcons Logo={"Depositos"} name='Depósitos' />,
          component: DepositoCB,
          permission: [enumPermisosDavivienda.davivienda_cb_depositos],
        },
        {
          link: "/corresponsalia/corresponsaliaDavivienda/ahorrosCorriente/retiro",
          label: <AppIcons Logo={"Retiro"} name='Retiros' />,
          component: RetiroCB,
          permission: [enumPermisosDavivienda.davivienda_cb_retiros],
        },
      ],
    },
    {
      link: "/corresponsalia/corresponsaliaDavivienda/Daviplatapagos_giros",
      label: <AppIcons Logo={"PagoPorGiro"} name='Pago por giro' />,
      component: PagoGiro,
      permission: [enumPermisosDavivienda.davivienda_cb_pago_por_giro],
    },

    {
      link: "/corresponsalia/corresponsaliaDavivienda/pagoDeProductosPropios",
      label: (
        <AppIcons
          Logo={"PagoProductosPropios"}
          name='Pago de productos propios'
        />
      ),
      component: PagoDeProductosPropios,
      permission: [enumPermisosDavivienda.davivienda_cb_pago_productos_propios],
    },
    {
      link: "/corresponsalia/corresponsaliaDavivienda/recaudoServiciosPublicosPrivados",
      label: (
        <AppIcons
          Logo={"Recaudo"}
          name='Recaudo servicios públicos y privados'
        />
      ),
      component: RecaudoServiciosPublicosPrivadosMenu,
      permission: [enumPermisosDavivienda.davivienda_cb_recaudo],
      subRoutes: [
        {
          link: "/corresponsalia/corresponsaliaDavivienda/recaudoServiciosPublicosPrivados/seleccion",
          label: <AppIcons Logo={"RecaudoManual"} name='Recaudo manual' />,
          component: SeleccionServicioPagar,
          permission: [enumPermisosDavivienda.davivienda_cb_recaudo],
        },
        {
          link: "/corresponsalia/corresponsaliaDavivienda/recaudoServiciosPublicosPrivados/codbarras",
          label: (
            <AppIcons
              Logo={"RecaudoCodigoDeBarras"}
              name='Recaudo código de barras'
            />
          ),
          component: RecaudoServiciosPublicosPrivadosLecturaCodigoBarras,
          permission: [enumPermisosDavivienda.davivienda_cb_recaudo],
        },
        {
          link: "/corresponsalia/corresponsaliaDavivienda/recaudoServiciosPublicosPrivados/manual",
          label: <AppIcons Logo={"RecaudoManual"} name='Recaudo manual' />,
          component: RecaudoServiciosPublicosPrivados,
          permission: [enumPermisosDavivienda.davivienda_cb_recaudo],
          show: false,
        },
      ],
    },
  ],
};

export default rutasDaviviendaCB;
