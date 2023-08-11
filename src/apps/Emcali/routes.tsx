import { lazy } from "react";

import AppIcons from "../../components/Base/AppIcons/AppIcons";
import HNavbar from "../../components/Base/HNavbar/HNavbar";
import { TypingRoutes } from "../../utils/TypingUtils";

const Recaudo = lazy(() => import("./views/Recaudo"));
const ReporteCaja = lazy(() => import("./views/ReporteCaja"));

const routesEmcali = {
  link: "/emcali",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="Emcali" />,
  component: ({ subRoutes }: { subRoutes: TypingRoutes[] }) => (
    <HNavbar links={subRoutes} />
  ),
  permission: [1],
  subRoutes: [
    {
      link: "/emcali/recaudo",
      label: <AppIcons Logo={"RECARGA_CELULAR"} name="Recaudo" />,
      component: Recaudo,
      permission: [1],
      subRoutes: [],
    },
    {
      link: "/emcali/reporte-caja",
      label: <AppIcons Logo={"REPORTE"} name="Reporte de caja" />,
      component: ReporteCaja,
      permission: [1],
      subRoutes: [],
    },
  ],
};

export default routesEmcali;
