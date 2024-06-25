import { lazy } from "react";
import { enumPermisosConveniosItau } from "./enumPermisosItau";
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

const ConveniosListaItau = lazy(() => import("./Views/Convenios/Convenios"));

const ConveniosItau = lazy(() => import("./ConveniosItau"));

const listPermissions = Object.values(enumPermisosConveniosItau);

export const listPermissionsItau = listPermissions;

const routesItau = {
  link: "/GestionTransaccional/convenios-itau",
  label: <AppIcons Logo={"ITAU"} name="Gestión Itaú" />,
  component: ConveniosItau,
  permission: [enumPermisosConveniosItau.BLOQUEOS_CONVENIOS_ITAU],
  subRoutes: [
    {
      link: "/GestionTransaccional/convenios-itau/bloqueo-convenios-itau",
      label: (
        <AppIcons
          Logo={"BLOQUEO_CONVENIOS_ITAU"}
          name="Bloqueo Convenios Itaú"
        />
      ),
      component: BloqueoConveniosItau,
      permission: [enumPermisosConveniosItau.BLOQUEOS_CONVENIOS_ITAU],
      subRoutes: [
        {
          link: "/GestionTransaccional/convenios-itau/bloqueo-convenios-itau/crear",
          label: (
            <AppIcons
              Logo={"BLOQUEO_CONVENIOS_ITAU"}
              name={"Bloqueo Convenios Itaú"}
            />
          ),
          component: CrearBloqueoConveniosItau,
          permission: [enumPermisosConveniosItau.BLOQUEOS_CONVENIOS_ITAU],
        },
        {
          link: "/GestionTransaccional/convenios-itau/bloqueo-convenios-itau/:id",
          label: (
            <AppIcons
              Logo={"BLOQUEO_CONVENIOS_ITAU"}
              name={"Bloqueo Convenios Itaú"}
            />
          ),
          component: CrearBloqueoConveniosItau,
          permission: [enumPermisosConveniosItau.BLOQUEOS_CONVENIOS_ITAU],
        },
      ],
    },
    {
      link: "/GestionTransaccional/convenios-itau/convenios",
      label: (
        <AppIcons
          Logo={"BLOQUEO_CONVENIOS_ITAU"}
          name={"Convenios Recaudo Itaú"}
        />
      ),
      component: ConveniosListaItau,
      permission: [enumPermisosConveniosItau.CONVENIOS_ITAU],
    },
  ],
};

export default routesItau;

