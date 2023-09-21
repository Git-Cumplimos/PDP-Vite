import { lazy } from "react";
import { enumPermisosCrezcamos } from "./enumPermisosCrezcamos";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../../components/Base/AppIcons"));
/**
 * Corresponsalia Crezcamos
 */
const PagoCreditosCrezcamos = lazy(() =>
  import("./Views/PagoCreditos")
);

const listPermissions = Object.values(enumPermisosCrezcamos);
export const listPermissionsCrezcamos = listPermissions;

const rutasCrezcamos = {
  //corresponsaliaCrezcamos
  link: "/Crezcamos",
  label: <AppIcons Logo={"CREZCAMOS"} name="Pago Créditos Crezcamos" />,
  component: PagoCreditosCrezcamos,
  permission: listPermissionsCrezcamos,
  subRoutes: [
  
  ],
};

export default rutasCrezcamos;
