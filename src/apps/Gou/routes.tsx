import { lazy } from "react";

import { ListPermissionsGou } from "./ListPermissionsGou";
import AppIcons from "../../components/Base/AppIcons";

const GouMenu = lazy(() => import("./GouMenu"));
const GouCheckPay = lazy(() => import("./views/GouCheckPay"));

const routesGouCheckPay = {
  link: "/check_gou",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="CHECK GOU" />,
  component: GouMenu,
  permission: [1],
  // show: false,
  subRoutes: [
    {
      link: "/check_gou/check_pay/:type_setting_time/:id_hash",
      label: <AppIcons Logo={"RECARGA_CELULAR"} name="check pay" />,
      component: GouCheckPay,
      permission: ListPermissionsGou,
      subRoutes: [],
      // show: false,
    },
    {
      link: "/check_gou/check_url_process",
      label: <AppIcons Logo={"RECARGA_CELULAR"} name="check url process" />,
      component: GouCheckPay,
      permission: ListPermissionsGou,
      subRoutes: [],
      // show: false,
    },
  ],
};

export default routesGouCheckPay;
