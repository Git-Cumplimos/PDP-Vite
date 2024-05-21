import AppIcons from "../../../components/Base/AppIcons";

import { ListPermissionsRecargaCupoWithPasarela } from "./ListPermissionsRecargaCupoWithPasarela";
import WithPasarelaPay from "../../Pasarelas/viewsHigherOrder/WithPasarelaPay";
import useHookRecargaCupoWithPasarela from "./hook/useHookRecargaCupoWithPasarela";
import DestinoLogoGou from "../../Pasarelas/Base/Gou/DestinoLogoGou";
import { URL_RECARGARCUPO_WITH_PASARELA } from "./routes_backend";
import DestinoLogoEvertec from "../../Pasarelas/Base/Evertec/DestinoLogoEvertec";
import {
  constComunication as constComunicationGou,
  constQuestion as constQuestionGou,
  consTerminosCondiciones as consTerminosCondicionesGou,
} from "../../Pasarelas/Base/Gou/InfoClient";
import {
  constComunication as constComunicationEvertec,
  constQuestion as constQuestionEvertec,
  consTerminosCondiciones as consTerminosCondicionesEvertec,
} from "../../Pasarelas/Base/Evertec/InfoClient";

const routesRecargaCupoWithPasarela = [
  {
    link: "/recarga-cupo/with-gou",
    label: <AppIcons Logo={"RECARGA_CELULAR"} name="GOU" />,
    component: () =>
      WithPasarelaPay(
        "GOU",
        `${URL_RECARGARCUPO_WITH_PASARELA}/gou`,
        235,
        undefined,
        useHookRecargaCupoWithPasarela,
        <DestinoLogoGou></DestinoLogoGou>,
        {
          question: { const: constQuestionGou },
          comunication: { const: constComunicationGou },
          aceptarTerminos: { const: consTerminosCondicionesGou },
        },
        "../recarga-cupo",
        undefined
      ),
    permission: [ListPermissionsRecargaCupoWithPasarela.RECARGA_CUPO_CON_GOU],
    subRoutes: [],
  },
  {
    link: "/recarga-cupo/with-evertec",
    label: <AppIcons Logo={"RECARGA_CELULAR"} name="Evertec" />,
    component: () =>
      WithPasarelaPay(
        "EVERTEC",
        `${URL_RECARGARCUPO_WITH_PASARELA}/evertec`,
        268,
        undefined,
        useHookRecargaCupoWithPasarela,
        <DestinoLogoEvertec></DestinoLogoEvertec>,
        {
          question: { const: constQuestionEvertec },
          comunication: { const: constComunicationEvertec },
          aceptarTerminos: { const: consTerminosCondicionesEvertec },
        },
        "../recarga-cupo",
        undefined
      ),
    permission: [ListPermissionsRecargaCupoWithPasarela.RECARGA_CUPO_CON_GOU],
    subRoutes: [],
  },
];
export default routesRecargaCupoWithPasarela;
