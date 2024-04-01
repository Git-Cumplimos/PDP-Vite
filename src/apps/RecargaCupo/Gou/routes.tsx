import { lazy } from "react";
import AppIcons from "../../../components/Base/AppIcons";

import { ListPermissionsRecargaCupoConGou } from "./ListPermissionsRecargaCupoConGou";

const RecargaCupoConGou = lazy(() => import("./views/RecargaCupoConGou"));

const routesRecargaCupoConGou = {
  link: "/recarga-cupo/con-gou",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="GOU" />,
  component: RecargaCupoConGou,
  permission: [ListPermissionsRecargaCupoConGou.RECARGA_CUPO_CON_GOU],
  subRoutes: [],
};

export default routesRecargaCupoConGou;
