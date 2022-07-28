import AppIcons from "../../components/Base/AppIcons";
import { lazy } from "react";

const CodigoBarrasComercio = lazy(() => import("./views/CodigoBarrasComercio"));

export const rutasInformacionGeneral = [
  {
    link: "/info/codigo_barras_comercio",
    label: (
      <AppIcons
        Logo={"RECAUDO"}
        name='Descargar código de barras del comercio'
      />
    ),
    component: CodigoBarrasComercio,
    permission: [69],
  },
];
