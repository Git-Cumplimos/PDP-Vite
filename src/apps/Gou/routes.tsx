import { lazy } from "react";

import AppIcons from "../../components/Base/AppIcons";
import { ListPermissionsPasarela } from "./ListPermissionsPasarela";
const GouCheckPayCross = lazy(
  () => import("./views/GouCheckPay/GouCheckPayCross")
);

const routesPasarelaCheckPay = {
  link: "/check_gou_pay/:id_hash",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="check pay" />,
  component: GouCheckPayCross,
  permission: ListPermissionsPasarela,
  subRoutes: [],
  // show: false,
};

export default routesPasarelaCheckPay;
