import { lazy } from "react";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/** Rutas */
const colpatriaTrx = lazy(() => import("./ColpatriaTrx"));
const Deposito = lazy(() => import("./Views/Deposito"));


const PinesConsulta = lazy(() => import("./Views/Pines/ConsultaPines"));
const PinesVenta = lazy(() => import("./Views/Pines/VentaPines"));


const ConsultaManual = lazy(() => import("./Views/Recaudo/ConsultaManual"));
const ConsultaBarras = lazy(() => import("./Views/Recaudo/ConsultaBarras"));
const TrxRecaudo = lazy(() => import("./Views/Recaudo/TrxRecaudo"));


const AdminColpatria = lazy(() => import("./Views/Admin"));
const ListaErrores = lazy(() => import("./Views/Admin/ListaErrores"));
const ConveniosPines = lazy(() => import("./Views/Admin/ConveniosPines"));
const ConveniosRecaudo = lazy(() => import("./Views/Admin/ConveniosRecaudo"));

const rutasColpatria = {
  link: "/corresponsalia/colpatria",
  label: <AppIcons Logo={"MARKETPLACE"} name={"Corresponsalía Colpatria"} />,
  component: colpatriaTrx,
  permission: [67, 68],
  subRoutes: [
    {
      link: "/corresponsalia/colpatria/deposito",
      label: <AppIcons Logo={"RECAUDO"} name={"Deposito"} />,
      component: Deposito,
      permission: [67],
    },
    {
      link: "/corresponsalia/colpatria/pines",
      label: <AppIcons Logo={"RECAUDO"} name={"Venta de Pines de Recaudo"} />,
      component: PinesConsulta,
      permission: [67],
      subRoutes: [
        {
          link: "/corresponsalia/colpatria/pines/:id_convenio_pin",
          label: <AppIcons Logo={"RECAUDO"} name={"Venta de Pines de Recaudo"} />,
          component: PinesVenta,
          permission: [67],
          show: false,
        },
      ],
    },
    {
      link: "/corresponsalia/colpatria/recaudo-manual",
      label: <AppIcons Logo={"RECAUDO"} name={"Recaudo PSP Manual en Efectivo"} />,
      component: ConsultaManual,
      permission: [67],
    },
    {
      link: "/corresponsalia/colpatria/recaudo-barras",
      label: <AppIcons Logo={"RECAUDO"} name={"Recaudo PSP Código de Barras en Efectivo"} />,
      component: ConsultaBarras,
      permission: [67],
    },
    {
      link: "/corresponsalia/colpatria/recaudo/:id_convenio_pin",
      label: <AppIcons Logo={"RECAUDO"} name={"Recaudo PSP en Efectivo"} />,
      component: TrxRecaudo,
      permission: [67],
      show: false,
    },
    {
      link: "/corresponsalia/colpatria/gestion",
      label: <AppIcons Logo={"RECAUDO"} name={"Gestión"} />,
      component: AdminColpatria,
      permission: [68],
      subRoutes: [
        {
          link: "/corresponsalia/colpatria/gestion/lista-errores",
          label: <AppIcons Logo={"RECAUDO"} name={"Lista de errores"} />,
          component: ListaErrores,
          permission: [68],
        },
        {
          link: "/corresponsalia/colpatria/gestion/lista-convenios-pines",
          label: (
            <AppIcons Logo={"RECAUDO"} name={"Convenios de pines de recaudo"} />
          ),
          component: ConveniosPines,
          permission: [68],
        },
        {
          link: "/corresponsalia/colpatria/gestion/lista-convenios-recaudo",
          label: (
            <AppIcons Logo={"RECAUDO"} name={"Convenios de recaudo"} />
          ),
          component: ConveniosRecaudo,
          permission: [68],
        },
      ],
    },
  ],
};

export default rutasColpatria;
