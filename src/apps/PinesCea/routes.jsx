import { lazy } from "react";
import { PermissionsPinesCea } from "./permissions";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/** Rutas */
const PinesCeaTrx = lazy(() => import("./PinesCeaTrx"));


const PinesConsulta = lazy(() => import("./Views/Pines/ConsultaPines"));
const PinesVenta = lazy(() => import("./Views/Pines/VentaPines"));
const PeticionesPines = lazy(() => import("./Views/Peticiones"));
const Anulaciones = lazy(() => import("./Views/AnulacionesPines"));
const CargueAnulaciones = lazy(() => import("./Views/Anulaciones/CargueAnulaciones"))
const DescargaPeticiones = lazy(() => import("./Views/Anulaciones/DescargarArchivoPeticiones"))
const HistoricoAnulaciones = lazy(() => import("./Views/Anulaciones/HistoricoAnulaciones"))



const listPermissions = Object.values(PermissionsPinesCea);

export const listPermissionsPinesCea = listPermissions.splice(
  listPermissions.length / 2
);

const rutasPinesCea = {
  link: "/Pines/PinesCea",
  label: (
    <AppIcons
      Logo={"PINES_GENERACION_LICENCIA"}
      name={"Pines CEA"}
    />
  ),
  component: PinesCeaTrx,
  permission: listPermissionsPinesCea,
  subRoutes: [


    {
      link: "/Pines/PinesCea/Ventapines",
      label: (
        <AppIcons
          Logo={"PINES_CREAR"}
          name={"Crear Pin CEA"}
        />
      ),
      component: PinesVenta,
      permission:listPermissionsPinesCea,
      subRoutes: [
        {
          link: "/Pines/PinesCea/pines/:id_convenio_pin",
          label: (
            <AppIcons Logo={"PINES_CREAR"} name={"Venta de Pines CEA"} />
          ),
          component: PinesVenta,
          permission: [PermissionsPinesCea.venta_pines,
             PermissionsPinesCea.operarPinesVus,
             PermissionsPinesCea.administrarPinesVus
          ],
          show: false,
        },
      ],
    },
    {
      link: "/Pines/PinesCea/PeticionesPines",
      label: (
        <AppIcons
          Logo={"PINES_TRAMITAR"}
          name={"Peticiones"}
        />
      ),
      component: PeticionesPines,
      permission: [PermissionsPinesCea.operarPinesVus,
        PermissionsPinesCea.administrarPinesVus]
    },
    // {
    //   link: "/Pines/PinesCea/Anulaciones",
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
    //       link: "/Pines/PinesCea/Anulaciones/CargueArchivo",
    //       label: (
    //         <AppIcons Logo={"CARGAR"} name={"Cargue Archivo Anulaciones"} />
    //       ),
    //       component: CargueAnulaciones,
    //       permission: [63]
    //     },
    //     {
    //       link: "/Pines/PinesCea/Anulaciones/DescargarPeticiones",
    //       label: (
    //         <AppIcons Logo={"DESCARGAR"} name={"Descarga Archivo Peticiones"} />
    //       ),
    //       component: DescargaPeticiones,
    //       permission: [63]
    //     },
    //     {
    //       link: "/Pines/PinesCea/Anulaciones/Historico",
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

export default rutasPinesCea;
