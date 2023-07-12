import { lazy } from "react";

import AppIcons from "../../components/Base/AppIcons/AppIcons";

const ConsultaGeneracionPin = lazy(
  () => import("./views/ConsultaGeneracionPin")
);

const routesAlmaseg = {
  link: "/almaseg/consulta-generacion-pin",
  label: (
    <AppIcons Logo={"RECARGA_CELULAR"} name="Consulta Generación de PIN" />
  ),
  component: ConsultaGeneracionPin,
  permission: [100],
  subRoutes: [],
};

export default routesAlmaseg;
