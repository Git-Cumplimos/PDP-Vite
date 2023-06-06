import { lazy } from "react";
import { PermissionsColpatria } from "./permissions";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/** Rutas */
const PinesCrcTrx = lazy(() => import("./PinesCrcTrx"));


const PinesConsulta = lazy(() => import("./Views/Pines/ConsultaPines"));
const PinesVenta = lazy(() => import("./Views/Pines/VentaPines"));




const listPermissions = Object.values(PermissionsColpatria);

export const listPermissionsPinesCrc = listPermissions.splice(
  listPermissions.length / 2
);

const rutasPinesCrc = {
  link: "/Pines/PinesCrc",
  label: (
    <AppIcons
      Logo={"CrearPines"}
      name={"Pines CRC"}
    />
  ),
  component: PinesCrcTrx,
  permission: listPermissionsPinesCrc,
  subRoutes: [


    {
      link: "/Pines/PinesCrc/pines",
      label: (
        <AppIcons
          Logo={"VentaPinRecaudoColpatria"}
          name={"Venta de Pines CRC"}
        />
      ),
      component: PinesConsulta,
      permission: [PermissionsColpatria.venta_pines],
      subRoutes: [
        {
          link: "/Pines/PinesCrc/pines/:id_convenio_pin",
          label: (
            <AppIcons Logo={"CrearPines"} name={"Venta de Pines CRC"} />
          ),
          component: PinesVenta,
          permission: [PermissionsColpatria.venta_pines],
          show: false,
        },
      ],
    },



  ],
};

export default rutasPinesCrc;
