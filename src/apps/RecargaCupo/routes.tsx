import { lazy } from "react";
import AppIcons from "../../components/Base/AppIcons/AppIcons";
import {
  listPermissionsRecargaCupoNequi,
  rutasRecargaNequi,
} from "../Nequi/routes";
import routesRecargaCupoConGou from "./Gou/routes";
import { ListPermissionsRecargaCupoConGou } from "./Gou/ListPermissionsRecargaCupoConGou";
import routesRecargaCupoWithEvertec from "./Evertec/routes";

const RecargaCupoMenu = lazy(() => import("./RecargaCupoMenu"));

const routesRecargaCupo = {
  link: "/recarga-cupo",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="Recargar Cupo" />,
  component: RecargaCupoMenu,
  permission: [
    ...listPermissionsRecargaCupoNequi,
    ListPermissionsRecargaCupoConGou,
  ],
  subRoutes: [
    rutasRecargaNequi,
    routesRecargaCupoConGou,
    routesRecargaCupoWithEvertec,
  ],
};

export default routesRecargaCupo;
