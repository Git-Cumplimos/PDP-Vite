import { lazy } from "react";

import AppIcons from "../../components/Base/AppIcons/AppIcons";
import { enumPermisosAlmaseg } from "./utils/enumPermisosAlmaseg";

const ConsultaGeneracionPin = lazy(
  () => import("./views/ConsultaPagoFacturasAlamaseg")
);
const MenuAlmaseg = lazy(() => import("./views/MenuAlmaseg"));

const listPermissions = Object.values(enumPermisosAlmaseg);
const routesAlmaseg = {
  link: "/almaseg",
  label: <AppIcons Logo={"ALMASEG"} name="Almaseg" />,
  component: MenuAlmaseg,
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
