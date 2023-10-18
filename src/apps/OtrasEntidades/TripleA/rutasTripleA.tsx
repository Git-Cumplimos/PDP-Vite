import { lazy } from "react";
import AppIcons from "../../../components/Base/AppIcons/AppIcons";
import HNavbar from "../../../components/Base/HNavbar/HNavbar";
import { TypingRoutes } from "../../../utils/TypingUtils";

const RecaudoTripleA = lazy(() => import("./views/RecaudoTripleA"));

const rutasTripleA = {
  link: "/TripleA",
  label: <AppIcons Logo={"RECAUDO"} name="Recaudo Triple A" />,
  component: RecaudoTripleA,
  // component: ({ subRoutes }: { subRoutes: TypingRoutes[] }) => (
  //   <HNavbar links={subRoutes} />
  // ),
  permission: [158],
  subRoutes: [
    // {
    //   link: "/TripleA/recaudos",
    //   label: <AppIcons Logo={"RECAUDO"} name="Recaudo Triple A" />,
    //   component: RecaudoTripleA,
    //   permission: [158],
    //   subRoutes: [],
    // },
  ],
};

export default rutasTripleA;
