import { lazy } from "react";
import {
  enumPermisosNequi,
  enumPermisosNequiRecargaCupo,
} from "./enumPermisosNequi";
/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/**
 * Corresponsalia Nequi
 */
const TransaccionRetiroNequiNotificacion = lazy(() =>
  import("./Views/RetiroNequiPush/TransaccionRetiroNequiNotificacion")
);
const RecargaCupoNequiNoficacion = lazy(() =>
  import("./Views/RecargaCupoPush/RecargaCupoNequiNoficacion")
);

const CorresponsaliaNequi = lazy(() => import("./CorresponsaliaNequi"));

const listPermissions = Object.values(enumPermisosNequi);
export const listPermissionsRecargaCupoNequi = Object.values(
  enumPermisosNequiRecargaCupo
);
const rutasCorresponsaliaNequi = {
  link: "/nequi",
  label: <AppIcons Logo={"NEQUI"} name="NEQUI" />,
  component: CorresponsaliaNequi,
  permission: listPermissions,
  subRoutes: [
    {
      link: "/nequi/retiro-nequi-notificacion",
      label: <AppIcons Logo={"NEQUI"} name="Retiro Nequi" />,
      component: TransaccionRetiroNequiNotificacion,
      permission: [enumPermisosNequi.RETIRO_NEQUI],
      subRoutes: [],
    },
  ],
};
export const rutasRecargaNequi = {
  link: "/recarga-cupo/nequi",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="Nequi" />,
  component: RecargaCupoNequiNoficacion,
  permission: listPermissionsRecargaCupoNequi,
  subRoutes: [],
};

export default rutasCorresponsaliaNequi;
