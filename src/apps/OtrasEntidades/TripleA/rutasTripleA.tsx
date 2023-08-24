import { lazy } from "react";
import AppIcons from "../../../components/Base/AppIcons/AppIcons";
import HNavbar from "../../../components/Base/HNavbar/HNavbar";
import { TypingRoutes } from "../../../utils/TypingUtils";

// const Recaudo = lazy(() => import("./views/Recaudo"));
// const ReporteCaja = lazy(() => import("./views/ReporteCaja"));

const rutasTripleA = {
  link: "/AAA",
  label: <AppIcons Logo={"RECAUDO"} name="Recuado Triple A" />,
  component: ({ subRoutes }: { subRoutes: TypingRoutes[] }) => (
    <HNavbar links={subRoutes} />
  ),
  permission: [1],
  subRoutes: [
    {
      link: "/AAA/recaudos",
      label: <AppIcons Logo={"RECAUDO"} name="Recuado Triple A" />,
      // component: ReporteCaja,
      permission: [1],
      subRoutes: [],
    },
  ],
};

export default rutasTripleA;
