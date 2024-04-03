import { lazy } from "react";

import { ListPermissionsGou } from "./ListPermissionsGou";
import AppIcons from "../../components/Base/AppIcons";

const CheckGouOrigin = lazy(() => import("./views/CheckGouOrigin"));

const routesRecargaCupoConGou = {
  link: "/recarga-cupo/con-gou",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="GOU" />,
  component: CheckGouOrigin,
  permission: [ListPermissionsGou.RECARGA_CUPO_CON_GOU, 1],
  subRoutes: [],
};

export default routesRecargaCupoConGou;
