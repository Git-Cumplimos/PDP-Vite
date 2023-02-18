import { lazy } from "react";
import { enumPermisosRecaudoMultiple } from "./enumPermisosAval";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../../components/Base/AppIcons"));

/**
 * Corresponsalia Grupo Aval
 */
const RecaudoMultiple = lazy(() => import("./Views/RecaudoMultiple"));
const ConsultaRecaudoMultiple = lazy(() =>
  import("./Views/ConsultaRecaudoMultiple")
);
const RecaudoMultipleNav = lazy(() => import("./RecaudoMultipleNav"));

const listPermissions = Object.values(enumPermisosRecaudoMultiple);
export const listPermissionsRecaudoMultiple = listPermissions.splice(
  listPermissions.length / 2
);

const rutasRecaudoMultiple = {
  link: "/corresponsalia/recaudo-multiple",
  label: <AppIcons Logo={"MARKETPLACE"} name='Recaudo multiple' />,
  component: RecaudoMultipleNav,
  permission: listPermissionsRecaudoMultiple,
  subRoutes: [
    {
      link: "/corresponsalia/recaudo-multiple/transaccion",
      label: <AppIcons Logo={"MARKETPLACE"} name='Cargar recaudo multiple' />,
      component: RecaudoMultiple,
      permission: [enumPermisosRecaudoMultiple.recaudo_multiple],
    },
    {
      link: "/corresponsalia/recaudo-multiple/consulta",
      label: (
        <AppIcons Logo={"MARKETPLACE"} name='Consultar recaudo multiple' />
      ),
      component: ConsultaRecaudoMultiple,
      permission: [enumPermisosRecaudoMultiple.recaudo_multiple],
    },
  ],
};
export default rutasRecaudoMultiple;
