import AppIcons from "../../../components/Base/AppIcons";

import { ListPermissionsRecargaCupoConGou } from "./ListPermissionsRecargaCupoConGou";
import RecargaCupoConGou from "./views/RecargaCupoConGou";
import WithGouPay from "../../Gou/viewsHigherOrder/WithGouPay";
import useHookRecargaCupoConGou from "./hook/useHookRecargaCupoConGou";

const routesRecargaCupoConGou = {
  link: "/recarga-cupo/con-gou",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="GOU" />,
  component: () => WithGouPay(RecargaCupoConGou, useHookRecargaCupoConGou, 235),
  permission: [ListPermissionsRecargaCupoConGou.RECARGA_CUPO_CON_GOU],
  subRoutes: [],
};
export default routesRecargaCupoConGou;
