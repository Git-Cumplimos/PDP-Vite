import { lazy } from "react";
import { PermissionsColpatria } from "./permissions";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/** Rutas */
const ColpatriaTrx = lazy(() => import("./ColpatriaTrx"));
const Deposito = lazy(() => import("./Views/Deposito"));

const PinesConsulta = lazy(() => import("./Views/Pines/ConsultaPines"));
const PinesVenta = lazy(() => import("./Views/Pines/VentaPines"));
const PinPago = lazy(() => import("./Views/PinPago"));

const ConsultaManual = lazy(() => import("./Views/Recaudo/ConsultaManual"));
const ConsultaBarras = lazy(() => import("./Views/Recaudo/ConsultaBarras"));
const TrxRecaudo = lazy(() => import("./Views/Recaudo/TrxRecaudo"));

const AdminColpatria = lazy(() => import("./Views/Admin"));
const ListaErrores = lazy(() => import("./Views/Admin/ListaErrores"));
const ConveniosPines = lazy(() => import("./Views/Admin/ConveniosPines"));
const ConveniosRecaudo = lazy(() => import("./Views/Admin/ConveniosRecaudo"));

export const rutasGestionColpatria = {
  link: "/corresponsalia/colpatria/gestion",
  label: <AppIcons Logo={"Reporte"} name={"Gestión"} />,
  component: AdminColpatria,
  permission: [PermissionsColpatria.gestion],
  subRoutes: [
    {
      link: "/corresponsalia/colpatria/gestion/lista-errores",
      label: <AppIcons Logo={"Reporte"} name={"Lista de errores"} />,
      component: ListaErrores,
      permission: [PermissionsColpatria.gestion],
    },
    {
      link: "/corresponsalia/colpatria/gestion/lista-convenios-pines",
      label: (
        <AppIcons Logo={"Reporte"} name={"Convenios de pines de recaudo"} />
      ),
      component: ConveniosPines,
      permission: [PermissionsColpatria.gestion],
    },
    {
      link: "/corresponsalia/colpatria/gestion/lista-convenios-recaudo",
      label: <AppIcons Logo={"Reporte"} name={"Convenios de recaudo"} />,
      component: ConveniosRecaudo,
      permission: [PermissionsColpatria.gestion],
    },
  ],
};

const listPermissions = Object.values(PermissionsColpatria);

export const listPermissionsColpatria = listPermissions.splice(listPermissions.length / 2)

const rutasColpatria = {
  link: "/corresponsalia/colpatria",
  label: <AppIcons Logo={"CorresponsalBancario"} name={"Corresponsalía Colpatria"} />,
  component: ColpatriaTrx,
  permission: listPermissionsColpatria,
  subRoutes: [
    {
      link: "/corresponsalia/colpatria/deposito",
      label: <AppIcons Logo={"Depositos"} name={"Depósito"} />,
      component: Deposito,
      permission: [PermissionsColpatria.deposito],
    },
    {
      link: "/corresponsalia/colpatria/pines",
      label: <AppIcons Logo={"CrearPines"} name={"Venta de Pines de Recaudo"} />,
      component: PinesConsulta,
      permission: [PermissionsColpatria.venta_pines],
      subRoutes: [
        {
          link: "/corresponsalia/colpatria/pines/:id_convenio_pin",
          label: (
            <AppIcons Logo={"CrearPines"} name={"Venta de Pines de Recaudo"} />
          ),
          component: PinesVenta,
          permission: [PermissionsColpatria.venta_pines],
          show: false,
        },
      ],
    },
    {
      link: "/corresponsalia/colpatria/recaudo",
      label: (
        <AppIcons
          Logo={"Recaudo"}
          name={"Recaudo Servicios Públicos y Privados"}
        />
      ),
      component: ColpatriaTrx,
      permission: [PermissionsColpatria.recaudo],
      subRoutes: [
        {
          link: "/corresponsalia/colpatria/recaudo/manual",
          label: (
            <AppIcons
              Logo={"RecaudoManual"}
              name={"Recaudo PSP Manual en Efectivo"}
            />
          ),
          component: ConsultaManual,
          permission: [PermissionsColpatria.recaudo],
        },
        {
          link: "/corresponsalia/colpatria/recaudo/barras",
          label: (
            <AppIcons
              Logo={"RecaudoCodigoDeBarras"}
              name={"Recaudo PSP Código de Barras en Efectivo"}
            />
          ),
          component: ConsultaBarras,
          permission: [PermissionsColpatria.recaudo],
        },
        {
          link: "/corresponsalia/colpatria/recaudo/:id_convenio_pin",
          label: <AppIcons Logo={"Recaudo"} name={"Recaudo PSP en Efectivo"} />,
          component: TrxRecaudo,
          permission: [PermissionsColpatria.recaudo],
          show: false,
        },
      ],
    },
    {
      link: "/corresponsalia/colpatria/pago-de-giro",
      label: <AppIcons Logo={"PagoPorGiro"} name={"Pin de Giro"} />,
      component: PinPago,
      permission: [PermissionsColpatria.pago_giro],
    },
    rutasGestionColpatria,
  ],
};

export default rutasColpatria;