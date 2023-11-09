import { lazy } from "react";

import AppIcons from "../../components/Base/AppIcons/AppIcons";
import HNavbar from "../../components/Base/HNavbar/HNavbar";

const RecaudoCodigo = lazy(() => import("./Views/RecaudoCodigo"));
const RecaudoManual = lazy(() => import("./Views/RecaudoManual"));

const routesRecaudoGenerico = {
  link: "/recaudo-generico",
  label: <AppIcons Logo={"RECAUDO"} name="Recaudo Servicio Públicos y Privador Genérico" />,
  component: ({subRoutes}) => (
    <HNavbar links={subRoutes} />
  ),
  permission: [200, 201, 202],
  subRoutes: [
    {
        link: "/recaudo-generico/manual",
        label: <AppIcons Logo={"RECAUDO_MANUAL"} name="Recaudo Manual" />,
          component: RecaudoManual,
        permission: [200],
        subRoutes: [],
    },
    {
        link: "/recaudo-generico/codigo",
        label: <AppIcons Logo={"RECAUDO_CODIGO_DE_BARRAS"} name="Recaudo Código de Barras" />,
        component: RecaudoCodigo,
        permission: [200],
        subRoutes: [],
    },
  ],
};

export default routesRecaudoGenerico;