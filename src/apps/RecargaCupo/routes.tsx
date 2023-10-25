import AppIcons from "../../components/Base/AppIcons/AppIcons";
import HNavbar from "../../components/Base/HNavbar/HNavbar";
import { TypingRoutes } from "../../utils/TypingUtils";
import rutasNequi from "../RecargaCupo/Nequi/routes";

const routesRecargaCupo = {
  link: "/RecargaCupo",
  label: <AppIcons Logo={"RECARGA_CUPO"} name="Recargar Cupo" />,
  component: ({ subRoutes }: { subRoutes: TypingRoutes[] }) => (
    <HNavbar links={subRoutes} />
  ),
  permission: [33000],
  subRoutes: [
    rutasNequi,
  ],
};

export default routesRecargaCupo;
