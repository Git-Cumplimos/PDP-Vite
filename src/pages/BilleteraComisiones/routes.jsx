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
const HistorialDispersionesUsuarioPadre = lazy(() =>
  import("./Views/HistorialDispersionesUsuarioPadre")
);
const HistorialDispersionesUsuarioPadreDetalle = lazy(() =>
  import("./Views/HistorialDispersionesUsuarioPadre/Detalles")
);
const BilleteraComisiones = lazy(() => import("./BilleteraComisiones"));

export const listPermissionsBilleteraComisiones = Object.values(
  enumBilleteraComisiones
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
      },
      {
        link: "/billetera-comisiones/movimiento-comisiones-cupo-usuario-padre",
        label: (
          <AppIcons
            Logo={"RETIRO"}
            name={"Movimiento comisiones cupo usuario padre"}
          />
        ),
        component: DispersionUsuarioPadre,
        permission: [
          enumBilleteraComisiones.tranferencia_billetera_usuario_padre,
        ],
      },
      {
        link: "/billetera-comisiones/historico-tranferencias-usuario-padre",
        label: (
          <AppIcons
            Logo={"RETIRO"}
            name={"Historico movimiento comisiones cupo usuario padre"}
          />
        ),
        component: HistorialDispersionesUsuarioPadre,
        permission: [
          enumBilleteraComisiones.tranferencia_billetera_usuario_padre,
          enumBilleteraComisiones.ver_historial_transferencia_billetera_up_soporte,
        ],
        subRoutes: [
          {
            link: "/billetera-comisiones/historico-tranferencias-usuario-padre/:pk_id_dispersion",
            label: (
              <AppIcons
                Logo={"RETIRO"}
                name={
                  "Historico movimiento comisiones cupo usuario padre detalle"
                }
              />
            ),
            component: HistorialDispersionesUsuarioPadreDetalle,
            permission: [
              enumBilleteraComisiones.tranferencia_billetera_usuario_padre,
              enumBilleteraComisiones.ver_historial_transferencia_billetera_up_soporte,
            ],
            show: false,
          },
        ],
      },
    ],
  },
];

export default rutasBilleteraComisiones;
