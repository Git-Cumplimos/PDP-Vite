import { lazy } from "react";

import AppIcons from "../../components/Base/AppIcons";
import { ListPermissionsGou } from "./ListPermissionsGou";
const GouCheckPayCross = lazy(
  () => import("./views/GouCheckPay/GouCheckPayCross")
);

const routesGouCheckPay = {
  link: "/check_gou_pay/:id_hash",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="check pay" />,
  component: GouCheckPayCross,
  permission: ListPermissionsGou,
  subRoutes: [],
  // show: false,
};

export default routesGouCheckPay;
