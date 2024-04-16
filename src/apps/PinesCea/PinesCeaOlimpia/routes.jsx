import { lazy } from "react";
import { PermissionsPinesCeaOlimpia } from "./permissions";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../../components/Base/AppIcons"));

/** Rutas */
const PinesCeaTrx = lazy(() => import("./PinesCeaTrx"));

const PinesVentaOlimpia = lazy(() => import("./Views/Pines/VentaPinesOlimpia"));
const PinesAnulacionOlimpia = lazy(() => import("./Views/Anulaciones/AnulacionPinesOlimpia"));

const listPermissions = Object.values(PermissionsPinesCeaOlimpia);

export const listPermissionsPinesCeaOlimpia = listPermissions.splice(
  listPermissions.length / 2
);

const rutasPinesCeaOlimpia = {
  link: "/Pines/PinesCeaOlimpia",
  label: (
    <AppIcons
      Logo={"PINES_GENERACION_LICENCIA"}
      name={"Pines CEA Olimpia"}
    />
  ),
  component: PinesCeaTrx,
  permission: listPermissionsPinesCeaOlimpia,
  subRoutes: [


    {
      link: "/Pines/PinesCeaOlimpia/Ventapines",
      label: (
        <AppIcons
          Logo={"PINES_CREAR"}
          name={"Pines CEA Olimpia"}
        />
      ),
      component: PinesVentaOlimpia,
      permission:listPermissionsPinesCeaOlimpia,
      subRoutes: [
        {
          link: "/Pines/PinesCeaOlimpia/pines/:id_convenio_pin",
          label: (
            <AppIcons Logo={"PINES_CREAR"} name={"Pines CEA Olimpia"} />
          ),
          component: PinesVentaOlimpia,
          permission: [PermissionsPinesCeaOlimpia.venta_pines,
             PermissionsPinesCeaOlimpia.operarPinesVus,
             PermissionsPinesCeaOlimpia.administrarPinesVus
          ],
          show: false,
        },
      ],
    },  
    {
      link: "/Pines/PinesCeaOlimpia/Anulacionpines",
      label: (
        <AppIcons
          Logo={"PINES_TRAMITAR"}
          name={"Anulación Pines CEA Olimpia"}
        />
      ),
      component: PinesAnulacionOlimpia,
      permission:listPermissionsPinesCeaOlimpia,
      subRoutes: [
        {
          link: "/Pines/PinesCeaOlimpia/pines/:id_convenio_pin",
          label: (
            <AppIcons Logo={"PINES_TRAMITAR"} name={"Anulación Pines CEA Olimpia"} />
          ),
          component: PinesAnulacionOlimpia,
          permission: [PermissionsPinesCeaOlimpia.venta_pines,
             PermissionsPinesCeaOlimpia.operarPinesVus,
             PermissionsPinesCeaOlimpia.administrarPinesVus
          ],
          show: false,
        },
      ],
    }, 
  ],
};

export default rutasPinesCeaOlimpia;
