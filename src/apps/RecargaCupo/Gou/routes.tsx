import AppIcons from "../../../components/Base/AppIcons";

import { ListPermissionsRecargaCupoConGou } from "./ListPermissionsRecargaCupoConGou";
import RecargaCupoConGou from "./views/RecargaCupoConGou";
import WithGouPay from "../../Gou/viewsHigherOrder/WithGouPay";
import useHookRecargaCupoConGou from "./hook/useHookRecargaCupoConGou";
import TicketsGou from "../../Gou/components/TicketsGou";

const routesRecargaCupoConGou = {
  link: "/recarga-cupo/con-gou",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="GOU" />,
  component: () =>
    WithGouPay(
      RecargaCupoConGou,
      TicketsGou,
      useHookRecargaCupoConGou,
      235,
      "../recarga-cupo"
    ),
  permission: [ListPermissionsRecargaCupoConGou.RECARGA_CUPO_CON_GOU],
  subRoutes: [],
};
export default routesRecargaCupoConGou;
