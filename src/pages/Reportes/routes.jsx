import AppIcons from "../../components/Base/AppIcons";
import { lazy } from "react";

const Koncilia = lazy(() => import("./views/Koncilia"));
const ReporteComisiones = lazy(() => import("./views/ReporteComisiones"));
const ReporteConteoComisiones = lazy(() =>
  import("./views/ReporteConteoComisiones")
);

export const rutasReportes = [
  {
    link: "/reportes/koncilia",
    label: <AppIcons Logo={"RECAUDO"} name='Reportes koncilia' />,
    component: Koncilia,
    permission: [40],
  },
  {
    link: "/reportes/comisiones",
    label: <AppIcons Logo={"RECAUDO"} name='Reportes comisiones' />,
    component: ReporteComisiones,
    permission: [42],
  },
  {
    link: "/reportes/conteo-comisiones",
    label: <AppIcons Logo={"RECAUDO"} name='Reportes conteo comisiones' />,
    component: ReporteConteoComisiones,
    permission: [42],
  },
];
