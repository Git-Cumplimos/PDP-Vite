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
const PagoDaviplata = lazy(() => import("./Views//Daviplata/PagoDaviplata"));

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
const RecaudoServiciosPublicosPrivadosOperaciones = lazy(() =>
  import(
    "./Views/RecaudoServiciosPublicosPrivados/RecaudoServiciosPublicosPrivadosOperaciones"
  )
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
  label: <AppIcons Logo={"DAVIVIENDA"} name="Corresponsalía Davivienda" />,
  component: CorresponsaliaDavivienda,
  permission: listPermissionsDavivienda,
  subRoutes: [
    {
      link: "/corresponsalia/corresponsaliaDavivienda/Daviplata",
      label: <AppIcons Logo={"DAVIPLATA"} name="DaviPlata" />,
      component: DaviplataCB,
      permission: [
        enumPermisosDavivienda.davivienda_cb_cash_in,
        enumPermisosDavivienda.davivienda_cb_cash_out,
      ],
      subRoutes: [
        {
          link: "/corresponsalia/corresponsaliaDavivienda/DaviplatacashIn",
          label: (
            <AppIcons Logo={"DAVIPLATA_DEPOSITO"} name="Depósito DaviPlata" />
          ),
          component: CashIn,
          permission: [enumPermisosDavivienda.davivienda_cb_cash_in],
        },
        {
          link: "/corresponsalia/corresponsaliaDavivienda/DaviplatacashOut",
          label: <AppIcons Logo={"DAVIPLATA_RETIRO"} name="Retiro DaviPlata" />,
          component: CashOut,
          permission: [enumPermisosDavivienda.davivienda_cb_cash_out],
        },
      ],
    },

    {
      link: "/corresponsalia/corresponsaliaDavivienda/ahorrosCorriente",
      label: (
        <AppIcons
          Logo={"DAVIVIENDA_RETIROS_Y_DEPOSITOS"}
          name="Retiros y Depósitos Davivienda"
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
          label: <AppIcons Logo={"DAVIVIENDA_DEPOSITOS"} name="Depósitos" />,
          component: DepositoCB,
          permission: [enumPermisosDavivienda.davivienda_cb_depositos],
        },
        {
          link: "/corresponsalia/corresponsaliaDavivienda/ahorrosCorriente/retiro",
          label: <AppIcons Logo={"DAVIVIENDA_RETIROS"} name="Retiros" />,
          component: RetiroCB,
          permission: [enumPermisosDavivienda.davivienda_cb_retiros],
        },
      ],
    },
    {
      link: "/corresponsalia/corresponsaliaDavivienda/Daviplatapagos_giros",
      label: (
        <AppIcons Logo={"DAVIVIENDA_PAGO_POR_GIRO"} name="Pago por giro" />
      ),
      component: PagoGiro,
      permission: [enumPermisosDavivienda.davivienda_cb_pago_por_giro],
    },

    {
      link: "/corresponsalia/corresponsaliaDavivienda/pagoDeProductosPropios",
      label: (
        <AppIcons
          Logo={"DAVIVIENDA_PAGO_PRODUCTOS_PROPIOS"}
          name="Pago de productos propios"
        />
      ),
      component: PagoDeProductosPropios,
      permission: [enumPermisosDavivienda.davivienda_cb_pago_productos_propios],
    },
    {
      link: "/corresponsalia/corresponsaliaDavivienda/recaudoServiciosPublicosPrivados",
      label: (
        <AppIcons
          Logo={"DAVIVIENDA_RECAUDO_SERVICIOS_PUBLICOS_Y_PRIVADOS"}
          name="Recaudo servicios públicos y privados"
        />
      ),
      component: RecaudoServiciosPublicosPrivadosMenu,
      permission: [
        enumPermisosDavivienda.davivienda_cb_recaudo,
        enumPermisosDavivienda.davivienda_cb_recaudo_operaciones,
      ],
      subRoutes: [
        {
          link: "/corresponsalia/corresponsaliaDavivienda/recaudoServiciosPublicosPrivados/seleccion",
          label: (
            <AppIcons
              Logo={"DAVIVIENDA_RECAUDO_MANUAL"}
              name="Recaudo manual"
            />
          ),
          component: SeleccionServicioPagar,
          permission: [enumPermisosDavivienda.davivienda_cb_recaudo],
        },
        {
          link: "/corresponsalia/corresponsaliaDavivienda/recaudoServiciosPublicosPrivados/seleccionOperaciones",
          label: (
            <AppIcons
              Logo={"DAVIVIENDA_RECAUDO_MANUAL_OPERACIONES"}
              name="Recaudo manual operaciones"
            />
          ),
          component: SeleccionServicioPagar,
          permission: [
            enumPermisosDavivienda.davivienda_cb_recaudo_operaciones,
          ],
        },
        {
          link: "/corresponsalia/corresponsaliaDavivienda/recaudoServiciosPublicosPrivados/codbarras",
          label: (
            <AppIcons
              Logo={"DAVIVIENDA_RECAUDO_CODIGO_DE_BARRAS"}
              name="Recaudo código de barras"
            />
          ),
          component: RecaudoServiciosPublicosPrivadosLecturaCodigoBarras,
          permission: [enumPermisosDavivienda.davivienda_cb_recaudo],
        },
        {
          link: "/corresponsalia/corresponsaliaDavivienda/recaudoServiciosPublicosPrivados/manual",
          label: (
            <AppIcons
              Logo={"DAVIVIENDA_RECAUDO_MANUAL"}
              name="Recaudo manual"
            />
          ),
          component: RecaudoServiciosPublicosPrivados,
          permission: [enumPermisosDavivienda.davivienda_cb_recaudo],
          show: false,
        },
        {
          link: "/corresponsalia/corresponsaliaDavivienda/recaudoServiciosPublicosPrivados/manualOperaciones",
          label: (
            <AppIcons
              Logo={"DAVIVIENDA_RECAUDO_MANUAL"}
              name="Recaudo manual"
            />
          ),
          component: RecaudoServiciosPublicosPrivadosOperaciones,
          permission: [
            enumPermisosDavivienda.davivienda_cb_recaudo_operaciones,
          ],
          show: false,
        },
      ],
    },
  ],
};

export const routesDaviplata = {
  link: "/daviplata/pago_daviplata",
  label: <AppIcons Logo={"DAVIPLATA"} name="Pago Con DaviPlata" />,
  component: PagoDaviplata,
  permission: [enumPermisosDavivienda.daviplata_pago],
  subRoutes: [],
};

export default rutasDaviviendaCB;
