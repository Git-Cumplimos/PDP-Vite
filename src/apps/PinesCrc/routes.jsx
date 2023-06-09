import { lazy } from "react";
import { PermissionsPinesCrc } from "./permissions";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/** Rutas */
const PinesCrcTrx = lazy(() => import("./PinesCrcTrx"));


const PinesConsulta = lazy(() => import("./Views/Pines/ConsultaPines"));
const PinesVenta = lazy(() => import("./Views/Pines/VentaPines"));




const listPermissions = Object.values(PermissionsPinesCrc);

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
          name={"Pines CRC"}
        />
      ),
      component: PinesVenta,
      permission:listPermissionsPinesCrc,
      subRoutes: [
        {
          link: "/Pines/PinesCrc/pines/:id_convenio_pin",
          label: (
            <AppIcons Logo={"CrearPines"} name={"Venta de Pines CRC"} />
          ),
          component: PinesVenta,
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

export default rutasPinesCrc;
