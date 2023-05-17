import { lazy } from "react";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../../components/Base/AppIcons"));

//*** */
const Recargas = lazy(() => import("./Recargas"));
const Paquetes = lazy(() => import("./Paquetes"));
const OperarioPDP = lazy(() => import("./OperarioPDP"));
const OperarioPDPCargarPaquetes = lazy(() =>
  import("./OperarioPDP/CargarPaquetes")
);
const OperarioPDPCargarConciliacion = lazy(() =>
  import("./OperarioPDP/CargarConciliacion")
);
const OperarioPDPDescargarConciliacion = lazy(() =>
  import("./OperarioPDP/DescargarConciliacion")
);

const RoutesOperarioPDPCargarPaquetes = {
  link: "/operario-pdp/cargar-paquetes",
  label: <AppIcons Logo={"MARKETPLACE"} name="Cargar paquetes" />,
  component: OperarioPDPCargarPaquetes,
  permissionOperario: [],
  // subRoutes: [],
};

const RoutesOperarioPDPCargaConciliacion = {
  link: "/operario-pdp/cargar-conciliacion",
  label: <AppIcons Logo={"MARKETPLACE"} name="Cargar conciliacion" />,
  component: OperarioPDPCargarConciliacion,
  permissionOperario: [],
  // subRoutes: [],
};

const RoutesOperarioPDPDescargarConciliacion = {
  link: "/operario-pdp/descargar-conciliacion",
  label: <AppIcons Logo={"MARKETPLACE"} name="Descargar conciliacion" />,
  component: OperarioPDPDescargarConciliacion,
  permissionOperario: [],
  // subRoutes: [],
};

export const RoutesRecargas = {
  link: "/recargas",
  label: <AppIcons Logo={"MARKETPLACE"} name="Recargas" />,
  component: Recargas,
  permissionUso: [],
  // subRoutes: [],
};

export const RoutesPaquetes = {
  link: "/paquetes",
  label: <AppIcons Logo={"MARKETPLACE"} name="Paquetes" />,
  component: Paquetes,
  permissionUso: [],
  // subRoutes: [],
};

export const RoutesOperarioPDP = {
  link: "/operario-pdp",
  label: <AppIcons Logo={"MARKETPLACE"} name="Operario PDP" />,
  component: OperarioPDP,
  permissionOperario: [],
  subRoutes: [
    RoutesOperarioPDPCargarPaquetes,
    RoutesOperarioPDPCargaConciliacion,
    RoutesOperarioPDPDescargarConciliacion,
  ],
};

export const EstSubRutasTelefoniaMovil = [
  RoutesRecargas,
  RoutesPaquetes,
  RoutesOperarioPDP,
];
