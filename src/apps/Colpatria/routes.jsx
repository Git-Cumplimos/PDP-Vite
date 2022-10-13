import { lazy } from "react";

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
  label: <AppIcons Logo={"RECAUDO"} name={"Gestión"} />,
  component: AdminColpatria,
  permission: [6002],
  subRoutes: [
    {
      link: "/corresponsalia/colpatria/gestion/lista-errores",
      label: <AppIcons Logo={"RECAUDO"} name={"Lista de errores"} />,
      component: ListaErrores,
      permission: [6002],
    },
    {
      link: "/corresponsalia/colpatria/gestion/lista-convenios-pines",
      label: (
        <AppIcons Logo={"RECAUDO"} name={"Convenios de pines de recaudo"} />
      ),
      component: ConveniosPines,
      permission: [6002],
    },
    {
      link: "/corresponsalia/colpatria/gestion/lista-convenios-recaudo",
      label: (
        <AppIcons Logo={"RECAUDO"} name={"Convenios de recaudo"} />
      ),
      component: ConveniosRecaudo,
      permission: [6002],
    },
  ],
}

const rutasColpatria = {
  link: "/corresponsalia/colpatria",
  label: <AppIcons Logo={"MARKETPLACE"} name={"Corresponsalía Colpatria"} />,
  component: ColpatriaTrx,
  permission: [6001, 6002, 6003, 6004, 6005],
  subRoutes: [
    {
      link: "/corresponsalia/colpatria/deposito",
      label: <AppIcons Logo={"RECAUDO"} name={"Depósito"} />,
      component: Deposito,
      permission: [6001],
    },
    {
      link: "/corresponsalia/colpatria/pines",
      label: <AppIcons Logo={"RECAUDO"} name={"Venta de Pines de Recaudo"} />,
      component: PinesConsulta,
      permission: [6003],
      subRoutes: [
        {
          link: "/corresponsalia/colpatria/pines/:id_convenio_pin",
          label: <AppIcons Logo={"RECAUDO"} name={"Venta de Pines de Recaudo"} />,
          component: PinesVenta,
          permission: [6003],
          show: false,
        },
      ],
    },
    {
      link: "/corresponsalia/colpatria/recaudo",
      label: <AppIcons Logo={"RECAUDO"} name={"Recaudo Servicios Públicos y Privados"} />,
      component: ColpatriaTrx,
      permission: [6004],
      subRoutes: [
        {
          link: "/corresponsalia/colpatria/recaudo/manual",
          label: <AppIcons Logo={"RECAUDO"} name={"Recaudo PSP Manual en Efectivo"} />,
          component: ConsultaManual,
          permission: [6004],
        },
        {
          link: "/corresponsalia/colpatria/recaudo/barras",
          label: <AppIcons Logo={"RECAUDO"} name={"Recaudo PSP Código de Barras en Efectivo"} />,
          component: ConsultaBarras,
          permission: [6004],
        },
        {
          link: "/corresponsalia/colpatria/recaudo/:id_convenio_pin",
          label: <AppIcons Logo={"RECAUDO"} name={"Recaudo PSP en Efectivo"} />,
          component: TrxRecaudo,
          permission: [6004],
          show: false,
        },
      ]
    },
    {
      link: "/corresponsalia/colpatria/pin-de-pago",
      label: <AppIcons Logo={"RECAUDO"} name={"Pin de pago"} />,
      component: PinPago,
      permission: [6005],
    },
    rutasGestionColpatria
  ],
};

export default rutasColpatria;
