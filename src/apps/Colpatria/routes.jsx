import { lazy } from "react";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/** Rutas */
const colpatriaTrx = lazy(() => import("./ColpatriaTrx"));
const Deposito = lazy(() => import("./Views/Deposito"));
const AdminColpatria = lazy(() => import("./Views/Admin"));
const ListaErrores = lazy(() => import("./Views/Admin/ListaErrores"));

const rutasColpatria = {
  link: "/colpatria",
  label: <AppIcons Logo={"RECAUDO"} name={"Colpatria"} />,
  component: colpatriaTrx,
  permission: [1],
  subRoutes: [
    {
      link: "/colpatria/deposito",
      label: <AppIcons Logo={"RECAUDO"} name={"Deposito"} />,
      component: Deposito,
      permission: [1],
    },
    {
      link: "/colpatria/gestion",
      label: <AppIcons Logo={"RECAUDO"} name={"Gestion"} />,
      component: AdminColpatria,
      permission: [1],
      subRoutes: [
        {
          link: "/colpatria/gestion/lista-errores",
          label: <AppIcons Logo={"RECAUDO"} name={"Lista de errores"} />,
          component: ListaErrores,
          permission: [1],
        },
      ]
    },
  ],
};

export default rutasColpatria;
