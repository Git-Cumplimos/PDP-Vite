import { lazy } from "react";
import { PermissionsPinesCrc } from "./permissions";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/** Rutas */
const PinesCrcTrx = lazy(() => import("./PinesCrcTrx"));


const PinesConsulta = lazy(() => import("./Views/Pines/ConsultaPines"));
const PinesVenta = lazy(() => import("./Views/Pines/VentaPines"));
const PeticionesPines = lazy(() => import("./Views/Peticiones"));
const Anulaciones = lazy(() => import("./Views/AnulacionesPines"));
const CargueAnulaciones = lazy(() => import("./Views/Anulaciones/CargueAnulaciones"))
const DescargaPeticiones = lazy(() => import("./Views/Anulaciones/DescargarArchivoPeticiones"))
const HistoricoAnulaciones = lazy(() => import("./Views/Anulaciones/HistoricoAnulaciones"))



const listPermissions = Object.values(PermissionsPinesCrc);

export const listPermissionsPinesCrc = listPermissions.splice(
  listPermissions.length / 2
);

const rutasPinesCrc = {
  link: "/Pines/PinesCrc",
  label: (
    <AppIcons
      Logo={"PINES_GENERACION_LICENCIA"}
      name={"Pines CRC"}
    />
  ),
  component: PinesCrcTrx,
  permission: listPermissionsPinesCrc,
  subRoutes: [


    {
      link: "/Pines/PinesCrc/Ventapines",
      label: (
        <AppIcons
          Logo={"PINES_CREAR"}
          name={"Crear Pin CRC"}
        />
      ),
      component: PinesVenta,
      permission:listPermissionsPinesCrc,
      subRoutes: [
        {
          link: "/Pines/PinesCrc/pines/:id_convenio_pin",
          label: (
            <AppIcons Logo={"PINES_CREAR"} name={"Venta de Pines CRC"} />
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
    {
      link: "/Pines/PinesCrc/PeticionesPines",
      label: (
        <AppIcons
          Logo={"PINES_TRAMITAR"}
          name={"Peticiones"}
        />
      ),
      component: PeticionesPines,
      permission: [63,53]
    },
    // {
    //   link: "/Pines/PinesCrc/Anulaciones",
    //   label: (
    //     <AppIcons
    //       Logo={"PINES_ADMINISTRAR"}
    //       name={"Anulaciones"}
    //     />
    //   ),
    //   component: Anulaciones,
    //   permission: [63],
    //   subRoutes: [
    //     {
    //       link: "/Pines/PinesCrc/Anulaciones/CargueArchivo",
    //       label: (
    //         <AppIcons Logo={"CARGAR"} name={"Cargue Archivo Anulaciones"} />
    //       ),
    //       component: CargueAnulaciones,
    //       permission: [63]
    //     },
    //     {
    //       link: "/Pines/PinesCrc/Anulaciones/DescargarPeticiones",
    //       label: (
    //         <AppIcons Logo={"DESCARGAR"} name={"Descarga Archivo Peticiones"} />
    //       ),
    //       component: DescargaPeticiones,
    //       permission: [63]
    //     },
    //     {
    //       link: "/Pines/PinesCrc/Anulaciones/Historico",
    //       label: (
    //         <AppIcons Logo={"DESCARGAR"} name={"Historico anulaciones"} />
    //       ),
    //       component: HistoricoAnulaciones,
    //       permission: [63]
    //     }
    //   ],
    // },
    
  ],
};

export default rutasPinesCrc;
