import AppIcons from "../../../components/Base/AppIcons";

import { ListPermissionsRecargaCupoConGou } from "./ListPermissionsRecargaCupoConGou";
import WithPasarelaPay from "../../Gou/viewsHigherOrder/WithPasarelaPay";
import useHookRecargaCupoConGou from "./hook/useHookRecargaCupoConGou";
import TicketsGou from "../../Gou/components/TicketsGou";
import { constComunication, constQuestion } from "./InfoClient";
import DestinoLogoGou from "../../Gou/components/Base/DestinoLogoGou";

const routesRecargaCupoConGou = {
  link: "/recarga-cupo/con-gou",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="GOU" />,
  component: () =>
    WithPasarelaPay(
      "jkkk",
      235,
      useHookRecargaCupoConGou,
      DestinoLogoGou,
      TicketsGou,
      {
        question: { const: constQuestion },
        comunication: { const: constComunication },
        aceptarTerminos: { const: constComunication },
      },
      "../recarga-cupo",
      undefined,
      { destino: "gou" }
    ),
  permission: [ListPermissionsRecargaCupoConGou.RECARGA_CUPO_CON_GOU],
  subRoutes: [],
};
export default routesRecargaCupoConGou;
