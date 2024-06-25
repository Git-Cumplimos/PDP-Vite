import { lazy } from "react";
import { enumPermisosDavivienda } from "./enumPermisosDavivienda";
import Davivienda from "./Davivienda";
/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

const Convenios = lazy(() => import("./views/Convenios/Convenios"));

const listPermissions = Object.values(enumPermisosDavivienda);

export const listPermissionsDavivienda = listPermissions;

const routesDavivienda = {
  link: "/GestionTransaccional/gestion-davivienda",
  label: <AppIcons Logo={"DAVIVIENDA"} name="Gestión Davivienda" />,
  component: Davivienda,
  permission: [enumPermisosDavivienda.DAVIVIENDA_CONVENIOS],
  subRoutes: [
    {
      link: "/GestionTransaccional/gestion-davivienda/convenios",
      label: (
        <AppIcons Logo={"DAVIVIENDA_RECAUDO_MANUAL"} name={"Convenios recaudo Davivienda"} />
      ),
      component: Convenios,
      permission: [enumPermisosDavivienda.DAVIVIENDA_CONVENIOS],
    },
  ],
};

export default routesDavivienda;

