import { lazy } from "react";
import { enumPermisosTuLlave } from "./enumPermisosTuLlave";
/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/**
 * Corresponsalia tu llave
 */
const MainGestionDatafonos = lazy(() =>
  import("./Views/GestionDatafonos/MainGestionDatafonos")
);
const CreateDatafono = lazy(() =>
  import("./Views/GestionDatafonos/CreateDatafono")
);
const MainRecargaDatafonos = lazy(() =>
  import("./Views/RecargaTullave/MainRecargaDatafonos")
);
const TransaccionRecargaDatafono = lazy(() =>
  import("./Views/RecargaTullave/TransaccionRecargaDatafono")
);
const TransaccionRecargaTarjeta = lazy(() =>
  import("./Views/RecargaTullave/TransaccionRecargaTarjeta")
);

const CorresponsaliaTuLlave = lazy(() => import("./CorresponsaliaTuLlave"));

const listPermissions = Object.values(enumPermisosTuLlave);
export const listPermissionsTuLlave = listPermissions;

const rutasRecargasTullave = {
  link: "/recargas-tu-llave",
  label: <AppIcons Logo={"RECARGASTULLAVE"} name='Recargas Tu Llave' />,
  component: CorresponsaliaTuLlave,
  permission: listPermissionsTuLlave,
  subRoutes: [
    {
      link: "/recargas-tu-llave/gestion-datafonos",
      label: <AppIcons Logo={"DAVIPLATA"} name='Gestión datáfonos' />,
      component: MainGestionDatafonos,
      permission: [enumPermisosTuLlave.GESTION_DATAFONOS_TULLAVE],
      subRoutes: [
        {
          link: "/recargas-tu-llave/gestion-datafonos/crear",
          label: <AppIcons Logo={"IMPUESTO"} name={"Crear datáfono"} />,
          component: CreateDatafono,
          permission: [enumPermisosTuLlave.GESTION_DATAFONOS_TULLAVE],
          show: false,
        },
        {
          link: "/recargas-tu-llave/gestion-datafonos/editar/:id",
          label: <AppIcons Logo={"RECAUDO"} name={"Editar datáfono"} />,
          component: CreateDatafono,
          permission: [enumPermisosTuLlave.GESTION_DATAFONOS_TULLAVE],
          show: false,
        },
      ],
    },

    {
      link: "/recargas-tu-llave/recarga-datafonos",
      label: (
        <AppIcons Logo={"DAVIVIENDA_PAGO_POR_GIRO"} name='Recarga datáfonos' />
      ),
      component: MainRecargaDatafonos,
      permission: [enumPermisosTuLlave.RECARGA_DATAFONOS_TULLAVE],
      subRoutes: [
        {
          link: "/recargas-tu-llave/recarga-datafonos/transaccion/:id",
          label: (
            <AppIcons
              Logo={"DAVIVIENDA_PAGO_POR_GIRO"}
              name={"Recarga datáfonos"}
            />
          ),
          component: TransaccionRecargaDatafono,
          permission: [enumPermisosTuLlave.RECARGA_DATAFONOS_TULLAVE],
          show: false,
        },
      ],
    },
    {
      link: "/recargas-tu-llave/recarga-tarjetas",
      label: (
        <AppIcons Logo={"DAVIVIENDA_PAGO_POR_GIRO"} name='Recarga tarjetas' />
      ),
      component: TransaccionRecargaTarjeta,
      permission: [enumPermisosTuLlave.RECARGA_TARJETAS_TULLAVE],
    },
  ],
};

export default rutasRecargasTullave;
