import { lazy } from "react";
import { enumPermisosRecaudoMultiple } from "./enumPermisosRecaudoMultiple";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../../components/Base/AppIcons"));

/**
 * Corresponsalia Grupo Aval
 */
const RecaudoMultiple = lazy(() => import("./Views/RecaudoMultiple"));
const RecaudoMultipleComercios = lazy(() =>
  import("./Views/RecaudoMultipleComercios")
);
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
  label: <AppIcons Logo={"RECAUDO_MULTIPLE"} name="Recaudo Múltiple" />,
  component: RecaudoMultipleNav,
  permission: listPermissionsRecaudoMultiple,
  subRoutes: [
    {
      link: "/corresponsalia/recaudo-multiple/transaccion",
      label: (
        <AppIcons
          Logo={"RECAUDO_MULTIPLE_CARGAR"}
          name="Cargar recaudo múltiple"
        />
      ),
      component: RecaudoMultiple,
      permission: [enumPermisosRecaudoMultiple.pago_recaudo_multiple],
    },
    {
      link: "/corresponsalia/recaudo-multiple/transaccion-comercio",
      label: (
        <AppIcons
          Logo={"MARKETPLACE"}
          name="Cargar recaudo múltiple comercio"
        />
      ),
      component: RecaudoMultipleComercios,
      permission: [enumPermisosRecaudoMultiple.pago_recaudo_multiple_comercio],
    },
    {
      link: "/corresponsalia/recaudo-multiple/consulta",
      label: (
        <AppIcons
          Logo={"RECAUDO_MULTIPLE_CONSULTAR"}
          name="Consultar recaudo múltiple"
        />
      ),
      component: ConsultaRecaudoMultiple,
      permission: [enumPermisosRecaudoMultiple.consulta_recaudo_multiple],
    },
    {
      link: "/corresponsalia/recaudo-multiple/consulta-paginada",
      label: (
        <AppIcons
          Logo={"RECAUDO_MULTIPLE_CONSULTAR_PAGINADO"}
          name="Consultar recaudo múltiple paginado"
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
