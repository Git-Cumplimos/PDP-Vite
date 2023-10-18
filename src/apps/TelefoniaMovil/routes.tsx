import { lazy } from "react";
import { TypingRoutes } from "../../utils/TypingUtils";
import HNavbar from "../../components/Base/HNavbar/HNavbar";
import Recargas from "./DynamicTelefoniaMovil/views/Recargas";
import WithTelefoniaMovil from "./DynamicTelefoniaMovil/components/WithTelefoniaMovil/WithTelefoniaMovil";
import { useBackendPaquetesMovistar } from "./ServiciosOperadores/Movistar/BackendPaquetes";
import { TypeSubModules } from "./DynamicTelefoniaMovil/TypeDinamic";
import Paquetes from "./DynamicTelefoniaMovil/views/Paquetes";
import { useBackendRecargasDefault } from "./DynamicTelefoniaMovil/ServiciosBackendAutotorizadores/BackendRecargasDefault";
import { useBackendPaquetesDefault } from "./DynamicTelefoniaMovil/ServiciosBackendAutotorizadores/BackendPaquetesDefault";

const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

const CargarPaquetesMovistar = lazy(
  () =>
    import("../../apps/RecargasCelular/Movistar/Views/CargaPaquetesMovistar")
);
const ConcilacionMovistarDescarga = lazy(
  () =>
    import(
      "../../apps/RecargasCelular/Movistar/Views/ConcilacionMovistarDescarga"
    )
);
const ConciliacionMovistarCarga = lazy(
  () =>
    import(
      "../../apps/RecargasCelular/Movistar/Views/ConciliacionMovistarCarga"
    )
);

export const serviciosBackendAutorizadoresDefault: TypeSubModules<any> = {
  recargas: useBackendRecargasDefault,
  paquetes: useBackendPaquetesDefault,
  cargarPaquetes: async () => {},
  cargarConciliacion: async () => {},
  descargarConciliacion: async () => {},
};

export const permissionAutorizadoresDefault: TypeSubModules<number[]> = {
  recargas: [300],
  paquetes: [300],
  cargarPaquetes: [301],
  cargarConciliacion: [301],
  descargarConciliacion: [301],
};

const RoutesTelefoniaMovil = {
  link: "/telefonia-movil",
  label: <AppIcons Logo={"RECARGA_CELULAR"} name="Telefonía móvil" />,
  component: ({ subRoutes }: { subRoutes: TypingRoutes[] }) => (
    <HNavbar links={subRoutes} />
  ),
  permission: [
    ...permissionAutorizadoresDefault?.recargas,
    ...permissionAutorizadoresDefault?.paquetes,
    ...permissionAutorizadoresDefault?.cargarPaquetes,
    ...permissionAutorizadoresDefault?.cargarConciliacion,
    ...permissionAutorizadoresDefault?.descargarConciliacion,
  ], //los permisos son la combinacion de todos los modulos
  subRoutes: [
    {
      link: "/telefonia-movil/recargas",
      label: <AppIcons Logo={"RECARGA_CELULAR"} name="Recargas" />,
      component: () => WithTelefoniaMovil(Recargas, "Recargas"),
      permission: [...permissionAutorizadoresDefault?.recargas],
      subRoutes: [],
    },
    {
      link: "/telefonia-movil/paquetes",
      label: <AppIcons Logo={"RECARGA_CELULAR"} name="Paquetes" />,
      component: () => WithTelefoniaMovil(Paquetes, "Paquetes"),
      permission: [...permissionAutorizadoresDefault?.paquetes],
      subRoutes: [],
    },
    {
      //toca automatizar esta parte
      link: "/telefonia-movil/operador-pdp",
      label: <AppIcons Logo={"RECARGA_CELULAR"} name="Operador PDP" />,
      component: ({ subRoutes }: { subRoutes: TypingRoutes[] }) => (
        <HNavbar links={subRoutes} />
      ),
      permission: [
        66,
        ...permissionAutorizadoresDefault?.cargarPaquetes,
        ...permissionAutorizadoresDefault?.cargarConciliacion,
        ...permissionAutorizadoresDefault?.descargarConciliacion,
      ],
      subRoutes: [
        {
          link: "/telefonia-movil/operador-pdp/movistar",
          label: <AppIcons Logo={"MOVISTAR_OPERADOR_PDP"} name="Movistar" />,
          component: ({ subRoutes }: { subRoutes: TypingRoutes[] }) => (
            <HNavbar links={subRoutes} />
          ),
          permission: [
            66,
            ...permissionAutorizadoresDefault?.cargarPaquetes,
            ...permissionAutorizadoresDefault?.cargarConciliacion,
            ...permissionAutorizadoresDefault?.descargarConciliacion,
          ],
          subRoutes: [
            {
              link: "/telefonia-movil/operador-pdp/movistar/cargar-paquetes",
              label: (
                <AppIcons
                  Logo={"MOVISTAR_CARGUE_DE_PAQUETES"}
                  name="Cargue de paquetes de movistar"
                />
              ),
              component: CargarPaquetesMovistar,
              permission: [
                66,
                ...permissionAutorizadoresDefault?.cargarPaquetes,
              ],
            },
            {
              link: "/telefonia-movil/operador-pdp/movistar/concilacion",
              label: (
                <AppIcons Logo={"MOVISTAR_CONCILIACION"} name="Conciliación" />
              ),
              component: ({ subRoutes }: { subRoutes: TypingRoutes[] }) => (
                <HNavbar links={subRoutes} />
              ),
              permission: [
                66,
                ...permissionAutorizadoresDefault?.cargarConciliacion,
                ...permissionAutorizadoresDefault?.descargarConciliacion,
              ],
              subRoutes: [
                {
                  link: "/telefonia-movil/operador-pdp/movistar/descarga",
                  label: (
                    <AppIcons Logo={"DESCARGAR"} name="Decargar archivos" />
                  ),
                  component: ConcilacionMovistarDescarga,
                  permission: [
                    66,
                    ...permissionAutorizadoresDefault?.descargarConciliacion,
                  ],
                },
                {
                  link: "/telefonia-movil/operador-pdp/movistar/carga",
                  label: <AppIcons Logo={"CARGAR"} name="Cargar archivos" />,
                  component: ConciliacionMovistarCarga,
                  permission: [
                    66,
                    ...permissionAutorizadoresDefault?.cargarConciliacion,
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default RoutesTelefoniaMovil;
