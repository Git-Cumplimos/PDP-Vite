import { lazy } from "react";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/** Rutas */
const colpatriaTrx = lazy(() => import("./ColpatriaTrx"));
const deposito = lazy(() => import("./Views/Deposito"));

const rutasColpatria = {
  link: "/colpatria",
  label: <AppIcons Logo={"RECAUDO"} name={"Colpatria"} />,
  component: colpatriaTrx,
  permission: [1],
  subRoutes: [
    {
      link: "/colpatria/deposito",
      label: <AppIcons Logo={"RECAUDO"} name={"Deposito"} />,
      component: deposito,
      permission: [1],
    }
  ],
};

export default rutasColpatria;
