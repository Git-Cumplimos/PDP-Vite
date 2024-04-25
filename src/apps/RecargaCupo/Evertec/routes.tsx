import AppIcons from "../../../components/Base/AppIcons";

import { ListPermissionsRecargaCupoConGou } from "./ListPermissionsRecargaCupoConGou";
import RecargaCupoConGou from "./views/RecargaCupoConGou";
import WithGouPay from "../../Evertec/viewsHigherOrder/WithGouPay";
import useHookRecargaCupoConGou from "./hook/useHookRecargaCupoConGou";

const routesRecargaCupoWithEvertec = {
  link: "/recarga-cupo/con-evertec",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="Evertec" />,
  component: () => WithGouPay(RecargaCupoConGou, useHookRecargaCupoConGou, 268),
  permission: [ListPermissionsRecargaCupoConGou.RECARGA_CUPO_CON_GOU],
  subRoutes: [],
};
export default routesRecargaCupoWithEvertec;
