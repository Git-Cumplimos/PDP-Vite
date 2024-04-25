import { lazy } from "react";

import AppIcons from "../../components/Base/AppIcons";
import { ListPermissionsGou } from "./ListPermissionsGou";

const GouMenu = lazy(() => import("./GouMenu"));
const GouCheckPay = lazy(() => import("./views/GouCheckPay"));

const routesEvertecCheckPay = {
  link: "/check_evertec",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="CHECK EVERTEC" />,
  component: GouMenu,
  permission: ListPermissionsGou,
  show: false,
  subRoutes: [
    {
      link: "/check_evertec/:id_hash",
      label: <AppIcons Logo={"RECARGA_CELULAR"} name="check pay" />,
      component: GouCheckPay,
      permission: ListPermissionsGou,
      subRoutes: [],
      show: false,
    },
  ],
};

export default routesEvertecCheckPay;
