import { lazy } from "react";

import AppIcons from "../../components/Base/AppIcons";
import { ListPermissionsGou } from "./ListPermissionsGou";
const GouCheckPay = lazy(() => import("./views/GouCheckPay/GouCheckPay"));

const routesGouCheckPay = {
  link: "/check_gou_pay/:id_hash",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="check pay" />,
  component: GouCheckPay,
  permission: ListPermissionsGou,
  subRoutes: [],
  // show: false,
};

export default routesGouCheckPay;
