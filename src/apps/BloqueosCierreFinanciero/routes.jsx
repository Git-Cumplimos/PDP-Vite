import { lazy } from "react";
import {
  enumPermisosBloqueosCierreFinanciero,
} from "./enumPermisos";
/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/**
 * Corresponsalia tu llave
 */
const BloqueosComerciosCierreFinanciero = lazy(() =>
  import("./Views/BloqueosComerciosCierreFinanciero/BloqueosComercios")
);

const CrearBloqueosComerciosCierreFinanciero = lazy(() =>
  import("./Views/BloqueosComerciosCierreFinanciero/CrearBloqueosComercios")
);


const listPermissions = Object.values(enumPermisosBloqueosCierreFinanciero);

export const listPermissionsItau = listPermissions;

const routesBloqueosCierreFinanciero = {
  link: "/GestionTransaccional/bloqueo-comercios-cierre-financiero",
  label: <AppIcons Logo={"BLOQUEO_COMERCIOS_CIERRE_FINANCIERO"} name='Bloqueo Comercios Cierre Financiero' />,
  component: BloqueosComerciosCierreFinanciero,
  permission: [enumPermisosBloqueosCierreFinanciero.BLOQUEOS_COMERCIOS_CIERRE_FINANCIERO],
  subRoutes: [
    {
      link: "/GestionTransaccional/bloqueo-comercios-cierre-financiero/crear",
      label: <AppIcons Logo={"BLOQUEO_COMERCIOS_CIERRE_FINANCIERO"} name={"Bloqueo Comercios Cierre Financiero"} />,
      component: CrearBloqueosComerciosCierreFinanciero,
      permission: [enumPermisosBloqueosCierreFinanciero.BLOQUEOS_COMERCIOS_CIERRE_FINANCIERO],
    },
    {
      link: "/GestionTransaccional/bloqueo-comercios-cierre-financiero/:id",
      label: <AppIcons Logo={"BLOQUEO_COMERCIOS_CIERRE_FINANCIERO"} name={"Bloqueo Comercios Cierre Financiero"} />,
      component: CrearBloqueosComerciosCierreFinanciero,
      permission: [enumPermisosBloqueosCierreFinanciero.BLOQUEOS_COMERCIOS_CIERRE_FINANCIERO],
    },
  ],
};

export default routesBloqueosCierreFinanciero;
