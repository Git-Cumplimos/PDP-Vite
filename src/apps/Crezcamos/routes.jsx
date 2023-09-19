import { lazy } from "react";
import { enumPermisosCrezcamos } from "./enumPermisosCrezcamos";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));
/**
 * Corresponsalia Crezcamos
 */
const CorresponsaliaCrezcamos = lazy(() => import("./CorresponsaliaCrezcamos"));
const Operacion = lazy(() => import("./Views/Operaciones"));
const PagoCreditosCrezcamos = lazy(() => import("./Views/Operaciones/PagoCreditos"));

const listPermissions = Object.values(enumPermisosCrezcamos);
export const listPermissionsCrezcamos = listPermissions;

const rutasCrezcamos = {
  //corresponsaliaCrezcamos
  link: "/corresponsaliaCrezcamos",
  label: <AppIcons Logo={"CREZCAMOS"} name="Pago créditos Crezcamos" />,
  component: CorresponsaliaCrezcamos,
  permission: listPermissionsCrezcamos,
  subRoutes: [
    {
      link: "/corresponsaliaCrezcamos/Operaciones",
      label: <AppIcons Logo={"OPERACIONES"} name="Otras entidades" />,
      component: Operacion,
      permission: [
        enumPermisosCrezcamos.crezcamos_pago_creditos,
      ],
      subRoutes: [
        {
          link: "/corresponsaliaCrezcamos/Operaciones/PagoCrezcamos",
          label: <AppIcons Logo={"CREZCAMOS_PAGO_CREDITOS"} name="Pago Créditos Crezcamos" />,
          component: PagoCreditosCrezcamos,
          permission: [enumPermisosCrezcamos.crezcamos_pago_creditos],
        },
      ]
    },
  ],
};

export default rutasCrezcamos;
