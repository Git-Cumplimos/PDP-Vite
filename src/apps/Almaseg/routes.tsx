import { lazy } from "react";

import AppIcons from "../../components/Base/AppIcons/AppIcons";
import HNavbar from "../../components/Base/HNavbar/HNavbar";
import { TypingRoutes } from "../../utils/TypingUtils";
import { enumPermisosAlmaseg } from "./utils/enumPermisosAlmaseg";

const ConsultaGeneracionPin = lazy(
  () => import("./views/ConsultaPagoFacturasAlamaseg")
);
const listPermissions = Object.values(enumPermisosAlmaseg);
const routesAlmaseg = {
  link: "/almaseg",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="Almaseg" />,
  component: ({ subRoutes }: { subRoutes: TypingRoutes[] }) => (
    <HNavbar links={subRoutes} />
  ),
  permission: [...listPermissions],
  subRoutes: [
    {
      link: "/almaseg/retiro-almaseg",
      label: <AppIcons Logo={"RECARGA_CELULAR"} name="Retiro Almaseg" />,
      component: ConsultaGeneracionPin,
      permission: [enumPermisosAlmaseg.ALMASEG_RETIROS],
      subRoutes: [],
    },
  ],
};

export default routesAlmaseg;
