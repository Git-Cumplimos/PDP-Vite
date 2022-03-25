import AppIcons from "../../components/Base/AppIcons";
import { lazy } from "react";

const Koncilia = lazy(() => import("./views/Koncilia"));

export const rutasReportes = [
  {
    link: "/reportes/koncilia",
    label: <AppIcons Logo={"RECAUDO"} name="Reportes koncilia" />,
    component: Koncilia,
    permission: [40],
  },
];
