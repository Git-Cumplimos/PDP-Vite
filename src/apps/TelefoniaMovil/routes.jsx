import { lazy } from "react";
import { getRoutes } from "./utils/utils";
import { EstSubRutasTelefoniaMovil } from "./views/routes";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

// Telefonia Movil
const OperadorTelefoniaMovil = lazy(() =>
  import("../TelefoniaMovil/views/OperadorTelefoniaMovil")
);

const DefRutasTelefoniaMovil = [
  {
    link: "/telefonia-movil/claro",
    label: <AppIcons Logo={"MARKETPLACE"} name="Claro" />,
    component: () => (
      <OperadorTelefoniaMovil
        linkModule={"/telefonia-movil/claro"}
        BackendRecargas={async () => {}}
        BackendPaquetes={async () => {}}
        BackendCargaPaquetes={async () => {}}
        BackendCargaConciliacion={async () => {}}
      />
    ),
    permissionUso: [1],
    permissionOperario: [1],
  },
  {
    link: "/telefonia-movil/movistar",
    label: <AppIcons Logo={"MARKETPLACE"} name="movistar" />,
    component: () => (
      <OperadorTelefoniaMovil
        linkModule={"/telefonia-movil/movistar"}
        BackendRecargas={async () => {}}
      />
    ),

    permissionUso: [1],
    permissionOperario: [1],
  },
];

const RoutesTelefoniaMovil = getRoutes(
  DefRutasTelefoniaMovil,
  EstSubRutasTelefoniaMovil
);

export default RoutesTelefoniaMovil;
