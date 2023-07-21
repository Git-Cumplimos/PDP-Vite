import { lazy } from "react";
import { enumPermisosFdlm } from "./enumFdlm";
import ProvideFundamujer from "./components/Providefundamujer";
/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/**
 * Corresponsalia fundacion de la mujer
 */
const FunMujer = lazy(() => import("./FunMujer"));
const recMujer = lazy(() => import("./Views/Recaudos"));
const revMujer = lazy(() => import("./Views/Reversos"));
const reportFDLM = lazy(() => import("./Views/Reporte"));

const listPermissions = Object.values(enumPermisosFdlm);

const rutasFundacionMujer = {
  link: "/funmujer",
  label: <AppIcons Logo={"FUNDACION_MUJER"} name='Fundación de la mujer' />,
  component: FunMujer,
  permission: listPermissions,
  provider: ProvideFundamujer,
  subRoutes: [
    {
      link: "/funmujer/recaudo",
      label: <AppIcons Logo={"FUNDACION_MUJER_RECAUDO"} name={"Recaudo"} />,
      component: recMujer,
      permission: [enumPermisosFdlm.RECAUDO_FUNDACION_DE_LA_MUJER],
    },
    {
      link: "/funmujer/reversorecaudo",
      label: (
        <AppIcons Logo={"FUNDACION_MUJER_REVERSO"} name={"Reverso Manual"} />
      ),
      component: revMujer,
      permission: [enumPermisosFdlm.REVERSO_RECAUDO_FUNDACION_DE_LA_MUJER],
    },
    {
      link: "/funmujer/reporte",
      label: <AppIcons Logo={"FUNDACION_MUJER_REPORTE"} name={"Reporte"} />,
      component: reportFDLM,
      permission: [
        enumPermisosFdlm.DESEMBOLSO_FUNDACION_DE_LA_MUJER,
        enumPermisosFdlm.RECAUDO_FUNDACION_DE_LA_MUJER,
      ],
    },
  ],
};

export default rutasFundacionMujer;
