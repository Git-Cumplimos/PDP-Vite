import { lazy } from "react";

import AppIcons from "../../components/Base/AppIcons/AppIcons";
import HNavbar from "../../components/Base/HNavbar/HNavbar";
import { TypingRoutes } from "../../utils/TypingUtils";

const ConsultaGeneracionPin = lazy(
  () => import("./views/ConsultaGeneracionPin")
);

const routesAlmaseg = {
  link: "/almaseg",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="Almaseg" />,
  component: ({ subRoutes }: { subRoutes: TypingRoutes[] }) => (
    <HNavbar links={subRoutes} />
  ),
  permission: [100],
  subRoutes: [
    {
      link: "/almaseg/consulta-generacion-pin",
      label: (
        <AppIcons Logo={"RECARGA_CELULAR"} name="Consulta Generación de PIN" />
      ),
      component: ConsultaGeneracionPin,
      permission: [100],
      subRoutes: [],
    },
  ],
};

export default routesAlmaseg;
