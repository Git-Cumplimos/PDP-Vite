import { lazy } from "react";
import AppIcons from "../../components/Base/AppIcons/AppIcons";
import {
  listPermissionsRecargaCupoNequi,
  rutasRecargaNequi,
} from "../Nequi/routes";
import routesRecargaCupoWithPasarela from "./Pasarelas/routes";
import { ListPermissionsRecargaCupoWithPasarela } from "./Pasarelas/ListPermissionsRecargaCupoWithPasarela";

const RecargaCupoMenu = lazy(() => import("./RecargaCupoMenu"));

const routesRecargaCupo = {
  link: "/recarga-cupo",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="Recargar Cupo" />,
  component: RecargaCupoMenu,
  permission: [
    ...listPermissionsRecargaCupoNequi,
    ListPermissionsRecargaCupoWithPasarela,
  ],
  subRoutes: [rutasRecargaNequi, ...routesRecargaCupoWithPasarela],
};

export default routesRecargaCupo;
