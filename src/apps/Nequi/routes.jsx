import { lazy } from "react";
import { enumPermisosNequi } from "./enumPermisosNequi";
/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/**
 * Corresponsalia Nequi
 */
const TransaccionRetiroNequiNotificacion = lazy(() =>
  import("./Views/RetiroNequi/TransaccionRetiroNequiNotificacion")
);

const CorresponsaliaNequi = lazy(() => import("./CorresponsaliaNequi"));

const listPermissions = Object.values(enumPermisosNequi);
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

export default rutasCorresponsaliaNequi;
