import AppIcons from "../../components/Base/AppIcons/AppIcons";
import HNavbar from "../../components/Base/HNavbar/HNavbar";
import { TypingRoutes } from "../../utils/TypingUtils";
import rutasTripleA from "../OtrasEntidades/TripleA/rutasTripleA"

const routesOtrasEntidades = {
  link: "/OtrasEntidades",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="Otras Entidades" />,
  component: ({ subRoutes }: { subRoutes: TypingRoutes[] }) => (
    <HNavbar links={subRoutes} />
  ),
  permission: [1],
  subRoutes: [
    rutasTripleA,
  ],
};

export default routesOtrasEntidades;
