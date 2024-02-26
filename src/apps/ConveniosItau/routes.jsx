import { lazy } from "react";
import {
  enumPermisosConveniosItau,
} from "./enumPermisosItau";
/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/**
 * Corresponsalia tu llave
 */
const BloqueoConveniosItau = lazy(() =>
  import("./Views/BloqueosConvenios/BloqueoItau")
);

const CrearBloqueoConveniosItau = lazy(() =>
  import("./Views/BloqueosConvenios/CrearBloqueoItau")
);


const listPermissions = Object.values(enumPermisosConveniosItau);

export const listPermissionsItau = listPermissions;

const routesItau = {
  link: "/GestionTransaccional/bloqueo-convenios-itau",
  label: <AppIcons Logo={"BLOQUEO_CONVENIOS_ITAU"} name='Bloqueo Convenios Itaú' />,
  component: BloqueoConveniosItau,
  permission: [enumPermisosConveniosItau.BLOQUEOS_CONVENIOS_ITAU],
  subRoutes: [
    {
      link: "/GestionTransaccional/bloqueo-convenios-itau/crear",
      label: <AppIcons Logo={"BLOQUEO_CONVENIOS_ITAU"} name={"Bloqueo Convenios Itaú"} />,
      component: CrearBloqueoConveniosItau,
      permission: [enumPermisosConveniosItau.BLOQUEOS_CONVENIOS_ITAU],
    },
    {
      link: "/GestionTransaccional/bloqueo-convenios-itau/editar/:id",
      label: <AppIcons Logo={"BLOQUEO_CONVENIOS_ITAU"} name={"Bloqueo Convenios Itaú"} />,
      component: CrearBloqueoConveniosItau,
      permission: [enumPermisosConveniosItau.BLOQUEOS_CONVENIOS_ITAU],
    },
  ],
};

export default routesItau;
