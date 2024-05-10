import { lazy } from "react";
import AppIcons from "../../components/Base/AppIcons/AppIcons";
import {
  listPermissionsRecargaCupoNequi,
  rutasRecargaNequi,
} from "../Nequi/routes";
import routesRecargaCupoConGou from "./Gou/routes";
import { ListPermissionsRecargaCupoWithPasarela } from "./Gou/ListPermissionsRecargaCupoWithPasarela";

const RecargaCupoMenu = lazy(() => import("./RecargaCupoMenu"));

const routesRecargaCupo = {
  link: "/recarga-cupo",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="Recargar Cupo" />,
  component: RecargaCupoMenu,
  permission: [
    ...listPermissionsRecargaCupoNequi,
    ListPermissionsRecargaCupoWithPasarela,
  ],
  subRoutes: [rutasRecargaNequi, ...routesRecargaCupoConGou],
};

export default routesRecargaCupo;
