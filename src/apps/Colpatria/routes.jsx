import { lazy } from "react";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/** Rutas */
const colpatriaTrx = lazy(() => import("./ColpatriaTrx"));
const Deposito = lazy(() => import("./Views/Deposito"));
const VentaPines = lazy(() => import("./Views/VentaPines"));
const AdminColpatria = lazy(() => import("./Views/Admin"));
const ListaErrores = lazy(() => import("./Views/Admin/ListaErrores"));
const ConveniosPines = lazy(() => import("./Views/Admin/ConveniosPines"));

const rutasColpatria = {
  link: "/corresponsalia/colpatria",
  label: <AppIcons Logo={"RECAUDO"} name={"Colpatria"} />,
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
      link: "/corresponsalia/colpatria/venta-pines",
      label: <AppIcons Logo={"RECAUDO"} name={"Venta de Pines"} />,
      component: VentaPines,
      permission: [67],
    },
    {
      link: "/corresponsalia/colpatria/gestion",
      label: <AppIcons Logo={"RECAUDO"} name={"Gestion"} />,
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
          label: <AppIcons Logo={"RECAUDO"} name={"Convenios de pines de recaudo"} />,
          component: ConveniosPines,
          permission: [68],
        },
      ]
    },
  ],
};

export default rutasColpatria;
