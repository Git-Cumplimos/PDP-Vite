import { lazy } from "react";
import { enumBilleteraComisiones } from "./enumBilleteraComisiones";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/**
 * comisiones params
 */

const MovimientoComisionesCupo = lazy(() =>
  import("./Views/MovimientoComisionesCupo/MovimientoComisionesCupo")
);
const DispersionUsuarioPadre = lazy(() =>
  import("./Views/DispersionUsuarioPadre")
);
const BilleteraComisiones = lazy(() => import("./BilleteraComisiones"));

const listPermissions = Object.values(enumBilleteraComisiones);
export const listPermissionsBilleteraComisiones = listPermissions.splice(
  listPermissions.length / 2
);

const rutasBilleteraComisiones = [
  {
    link: "/billetera-comisiones",
    label: <AppIcons Logo={"RECAUDO"} name={"Billetera comisiones"} />,
    component: BilleteraComisiones,
    permission: listPermissionsBilleteraComisiones,
    subRoutes: [
      {
        link: "/billetera-comisiones/movimiento-comisiones-cupo",
        label: <AppIcons Logo={"RETIRO"} name={"Movimiento comisiones cupo"} />,
        component: MovimientoComisionesCupo,
        permission: [enumBilleteraComisiones.movimiento_comisiones_cupo],
        subRoutes: [],
      },
      {
        link: "/billetera-comisiones/movimiento-comisiones-cupo-usuario-padre",
        label: <AppIcons Logo={"RETIRO"} name={"Movimiento comisiones cupo"} />,
        component: DispersionUsuarioPadre,
        permission: [enumBilleteraComisiones.movimiento_comisiones_cupo],
        show: false,
      },
    ],
  },
];

export default rutasBilleteraComisiones;
