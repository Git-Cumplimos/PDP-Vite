import { lazy } from "react";
import { enumPermisosTranscaribe } from "./enumPermisosTranscaribe";
/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/**
 * Corresponsalia tu llave
 */
const TransaccionRecargaTarjeta = lazy(() =>
  import("./Views/TransaccionRecargaTarjeta")
);

const CorresponsaliaTranscaribe = lazy(() =>
  import("./CorresponsaliaTranscaribe")
);

export const listPermissionsTuLlave = Object.values(enumPermisosTranscaribe);

const rutasRecargasTranscaribe = {
  link: "/recargas-transcaribe",
  label: <AppIcons Logo={"TRANSCARIBE"} name="Recargas Transcaribe" />,
  component: CorresponsaliaTranscaribe,
  permission: listPermissionsTuLlave,
  subRoutes: [
    {
      link: "/recargas-transcaribe/recarga-tarjetas",
      label: <AppIcons Logo={"RECARGA_CELULAR"} name="Recarga tarjeta" />,
      component: TransaccionRecargaTarjeta,
      permission: [enumPermisosTranscaribe.RECARGA_TARJETAS_TRANSCARIBE],
    },
  ],
};

export default rutasRecargasTranscaribe;
