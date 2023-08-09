import { lazy } from "react";

import AppIcons from "../../components/Base/AppIcons/AppIcons";
import HNavbar from "../../components/Base/HNavbar/HNavbar";
import { TypingRoutes } from "../../utils/TypingUtils";

const NotificacionPago = lazy(() => import("./views/NotificacionPago"));

const routesEmcali = {
  link: "/Emcali",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="Emcali" />,
  component: ({ subRoutes }: { subRoutes: TypingRoutes[] }) => (
    <HNavbar links={subRoutes} />
  ),
  permission: [1],
  subRoutes: [
    {
      link: "/emcali/notificacion-pago",
      label: <AppIcons Logo={"RECARGA_CELULAR"} name="Pago cupón" />,
      component: NotificacionPago,
      permission: [1],
      subRoutes: [],
    },
  ],
};

export default routesEmcali;
