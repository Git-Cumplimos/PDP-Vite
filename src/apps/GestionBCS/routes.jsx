import { lazy } from "react";
import {
  enumPermisosGestionBCS,
} from "./enumPermisosGestionBCS";
/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/**
 * Corresponsalia tu llave
 */
const ComerciosRechazadosBCS = lazy(() =>
  import("./Views/ComerciosBCS/ComerciosRechazados")
);

const GestionBCS = lazy(() =>
  import("./GestionBCS")
);

const listPermissions = Object.values(enumPermisosGestionBCS);

export const listPermissionsGestionBCS = listPermissions;

const routesItau = {
  link: "/GestionTransaccional/gestion-banco-caja-social",
  label: <AppIcons Logo={"BLOQUEO_CONVENIOS_ITAU"} name='Gestión BCS' />,
  component: GestionBCS,
  permission: [enumPermisosGestionBCS.GESTION_BCS],
  subRoutes: [
    {
      link: "/GestionTransaccional/gestion-banco-caja-social/comercios-rechazados",
      label: <AppIcons Logo={"BLOQUEO_CONVENIOS_ITAU"} name={"Comercios Rechazados"} />,
      component: ComerciosRechazadosBCS,
      permission: [enumPermisosGestionBCS.COMERCIOS_RECHAZADOS_BCS],
    },
  ],
};

export default routesItau;
