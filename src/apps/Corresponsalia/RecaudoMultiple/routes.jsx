import { lazy } from "react";
import { enumPermisosRecaudoMultiple } from "./enumPermisosRecaudoMultiple";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../../components/Base/AppIcons"));

/**
 * Corresponsalia Grupo Aval
 */
const RecaudoMultiple = lazy(() => import("./Views/RecaudoMultiple"));
const ConsultaRecaudoMultiple = lazy(() =>
  import("./Views/ConsultaRecaudoMultiple")
);
const SearchRecaudosMultiples = lazy(() =>
  import("./Views/SearchRecaudosMultiples")
);
const RecaudoMultipleNav = lazy(() => import("./RecaudoMultipleNav"));

const listPermissions = Object.values(enumPermisosRecaudoMultiple);
export const listPermissionsRecaudoMultiple = listPermissions;

const rutasRecaudoMultiple = {
  link: "/corresponsalia/recaudo-multiple",
  label: <AppIcons Logo={"MARKETPLACE"} name='Recaudo Múltiple' />,
  component: RecaudoMultipleNav,
  permission: listPermissionsRecaudoMultiple,
  subRoutes: [
    {
      link: "/corresponsalia/recaudo-multiple/transaccion",
      label: <AppIcons Logo={"MARKETPLACE"} name='Cargar recaudo Múltiple' />,
      component: RecaudoMultiple,
      permission: [enumPermisosRecaudoMultiple.pago_recaudo_multiple],
    },
    {
      link: "/corresponsalia/recaudo-multiple/consulta",
      label: (
        <AppIcons Logo={"MARKETPLACE"} name='Consultar recaudo Múltiple' />
      ),
      component: ConsultaRecaudoMultiple,
      permission: [enumPermisosRecaudoMultiple.consulta_recaudo_multiple],
    },
    {
      link: "/corresponsalia/recaudo-multiple/consulta-paginada",
      label: (
        <AppIcons
          Logo={"MARKETPLACE"}
          name='Consultar recaudo Múltiple paginado'
        />
      ),
      component: SearchRecaudosMultiples,
      permission: [
        enumPermisosRecaudoMultiple.consulta_paginada_recaudo_multiple,
      ],
    },
  ],
};
export default rutasRecaudoMultiple;
