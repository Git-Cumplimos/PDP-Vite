import { lazy } from "react";
import { enumPermisosNequi } from "./enumPermisosNequi";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));
/**
 * Nequi
 */
const RecargarCupo = lazy(() =>
  import("./RecargaCupo")
);
const PagoNotificacionPush = lazy(() => import("./Views/PagoNotificacionPush"));


const listPermissions = Object.values(enumPermisosNequi);
export const listPermissionsCrezcamos = listPermissions;

const rutasNequi = {
  //corresponsaliaCrezcamos
  link: "/recargarCupo",
  label: <AppIcons Logo={"RECARGAR_CUPO"} name="Recargar Cupo" />,
  component: RecargarCupo,
  permission: listPermissionsCrezcamos,
  subRoutes: [
    {
      link: "/recargarCupo/Nequi",
      label: (
        <AppIcons Logo={"NEQUI"} name="Nequi" />
      ),
      component: PagoNotificacionPush,
      permission: [enumPermisosNequi.nequi_pago_notificacion_push],
    }
  
  ],
};

export default rutasNequi;
