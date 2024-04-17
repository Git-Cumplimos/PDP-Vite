import { lazy } from "react";

import { ListPermissionsGou } from "./ListPermissionsGou";
import AppIcons from "../../components/Base/AppIcons";

const GouCheckPay = lazy(() => import("./views/GouCheckPay"));

const routesGouCheckPay = {
  link: "/gou/check_pay/:type_setting_time/:id_hash",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="CHECK GOU" />,
  component: GouCheckPay,
  permission: [ListPermissionsGou.RECARGA_CUPO_CON_GOU],
  subRoutes: [],
  show: false,
};

export default routesGouCheckPay;
