import { lazy } from "react";
import { PermissionsPinesCrc } from "./permissions";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../../components/Base/AppIcons"));

/** Rutas */
const PinesCrcTrx = lazy(() => import("./PinesCrcTrx"));

const PinesVentaOlimpia = lazy(() => import("./Views/Pines/VentaPinesOlimpia"));
const PinesDevolucionOlimpia = lazy(() => import("./Views/Devoluciones/DevolucionPinesOlimpia"));

const listPermissions = Object.values(PermissionsPinesCrc);

export const listPermissionsPinesCrcOlimpia = listPermissions.splice(
  listPermissions.length / 2
);

const rutasPinesCrcOlimpia = {
  link: "/Pines/PinesCrcOlimpia",
  label: (
    <AppIcons
      Logo={"PINES_GENERACION_LICENCIA"}
      name={"Pines CRC Olimpia"}
    />
  ),
  component: PinesCrcTrx,
  permission: listPermissionsPinesCrcOlimpia,
  subRoutes: [


    {
      link: "/Pines/PinesCrcOlimpia/Ventapines",
      label: (
        <AppIcons
          Logo={"PINES_CREAR"}
          name={"Venta Pines CRC Olimpia"}
        />
      ),
      component: PinesVentaOlimpia,
      permission:listPermissionsPinesCrcOlimpia,
      subRoutes: [
        {
          link: "/Pines/PinesCrcOlimpia/pines/:id_convenio_pin",
          label: (
            <AppIcons Logo={"PINES_CREAR"} name={"Venta Pines CRC Olimpia"} />
          ),
          component: PinesVentaOlimpia,
          permission: [PermissionsPinesCrc.venta_pines,
             PermissionsPinesCrc.operarPinesVus,
             PermissionsPinesCrc.administrarPinesVus
          ],
          show: false,
        },
      ],
    },  
    {
      link: "/Pines/PinesCrcOlimpia/Devolucionpines",
      label: (
        <AppIcons
          Logo={"PINES_TRAMITAR"}
          name={"Devolución Pines CRC Olimpia"}
        />
      ),
      component: PinesDevolucionOlimpia,
      permission:listPermissionsPinesCrcOlimpia,
      subRoutes: [
        {
          link: "/Pines/PinesCrcOlimpia/pines/:id_convenio_pin",
          label: (
            <AppIcons Logo={"PINES_TRAMITAR"} name={"Devolución Pines CRC Olimpia"} />
          ),
          component: PinesDevolucionOlimpia,
          permission: [PermissionsPinesCrc.venta_pines,
             PermissionsPinesCrc.operarPinesVus,
             PermissionsPinesCrc.administrarPinesVus
          ],
          show: false,
        },
      ],
    }, 
  ],
};

export default rutasPinesCrcOlimpia;
