import AppIcons from "../../components/Base/AppIcons";
import { lazy } from "react";

const Koncilia = lazy(() => import("./views/Koncilia"));
const ReporteComercios = lazy(() => import("./views/ReporteComercios"));
const ReporteUsuarios = lazy(() => import("./views/ReporteUsuarios"));
const ReporteComisiones = lazy(() => import("./views/ReporteComisiones"));
const ReporteConteoComisiones = lazy(() =>
  import("./views/ReporteConteoComisiones")
);
const ReporteComisionesComercios = lazy(() =>
  import("./views/ReporteComisionesComercios")
);
const ReporteConsignacionesTransportadora = lazy(() =>
  import("./views/ReporteConsignacionesTransportadora")
);
const ReportesComisionesPadres = lazy(() =>
  import("./views/ReportesComisionesPadres")
);
const ReporteDeComercios = lazy(() =>
  import("./views/ReporteDeComercios")
);
export const rutasReportes = [
  {
    link: "/reportes/koncilia",
    label: <AppIcons Logo={"RECAUDO"} name="Reportes koncilia" />,
    component: Koncilia,
    permission: [40],
  },
  {
    link: "/reportes/comercios",
    label: <AppIcons Logo={"RECAUDO"} name="Reportes comercio" />,
    component: ReporteComercios,
    permission: [40],
  },
  {
    link: "/reportes/comisiones",
    label: <AppIcons Logo={"RECAUDO"} name="Reportes comisiones" />,
    component: ReporteComisiones,
    permission: [42],
  },
  {
    link: "/reportes/conteo-comisiones",
    label: <AppIcons Logo={"RECAUDO"} name="Reportes conteo comisiones" />,
    component: ReporteConteoComisiones,
    permission: [42],
  },
  {
    link: "/reportes/comisiones-comercio",
    label: <AppIcons Logo={"RECAUDO"} name="Reportes comisiones comercio" />,
    component: ReporteComisionesComercios,
    permission: [25001],
  },
  {
    link: "/reportes/consignaciones_transportadora",
    label: (
      <AppIcons
        Logo={"RECAUDO"}
        name="Reporte Consignaciones y Transportadora"
      />
    ),
    component: ReporteConsignacionesTransportadora,
    permission: [25001],
  },
  {
    link: "/reportes/comisiones-usuario-padre",
    label: (
      <AppIcons
        Logo={"RECAUDO"}
        name="Reporte comisiones hijos"
      />
    ),
    component: ReportesComisionesPadres,
    permission: [25001],
  },
  {
    link: "/reportes/comercios_general",
    label: (
      <AppIcons
        Logo={"RECAUDO"}
        name="Reporte de comercios"
      />
    ),
    component: ReporteDeComercios,
    permission: [25001],
  },
  {
    link: "/reportes/usuarios",
    label: (
      <AppIcons
        Logo={"RECAUDO"}
        name="Reporte usuarios"
      />
    ),
    component: ReporteUsuarios,
    permission: [25002],
  },
];
