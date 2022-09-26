import { lazy } from "react";
import { rutasArqueo } from "./Views/ArqueoCierre/routes";

const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/**
 * COMPONENTES ROL CAJERO
 */
const ArqueoCierre = lazy(() => import("./Views/ArqueoCierre"));

export const rutasGestion = [
  {
    link: "/gestion/arqueo",
    label: <AppIcons Logo={"RECAUDO"} name="Arqueo y cierre" />,
    component: ArqueoCierre,
    permission: [74, 75, 76, 77, 78, 80, 81, 82],
    subRoutes: rutasArqueo,
  },
];
