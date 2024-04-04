import { lazy } from "react";

import { ListPermissionsGou } from "./ListPermissionsGou";
import AppIcons from "../../components/Base/AppIcons";

const GouCheckPay = lazy(() => import("./views/GouCheckPay"));

const routesGouCheckPay = {
  link: "/gou/check_pay/:id_unique",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="CHECK GOU" />,
  component: GouCheckPay,
  permission: [ListPermissionsGou.RECARGA_CUPO_CON_GOU, 1],
  subRoutes: [],
};

export default routesGouCheckPay;
