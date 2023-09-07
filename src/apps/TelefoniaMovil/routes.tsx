import { lazy } from "react";
import { TypingRoutes } from "../../utils/TypingUtils";
import HNavbar from "../../components/Base/HNavbar/HNavbar";
import Recargas from "./DynamicTelefoniaMovil/views/Recargas";
import WithTelefoniaMovil from "./DynamicTelefoniaMovil/components/WithTelefoniaMovil/WithTelefoniaMovil";
import { useBackendPaquetesMovistar } from "./ServiciosOperadores/Movistar/BackendPaquetes";
import { TypeSubModules } from "./DynamicTelefoniaMovil/TypeDinamic";
import Paquetes from "./DynamicTelefoniaMovil/views/Paquetes";
import { useBackendRecargasDefault } from "./DynamicTelefoniaMovil/ServiciosBackendAutotorizadores/BackendRecargasDefault";

const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

export const serviciosBackendAutorizadoresDefault: TypeSubModules<any> = {
  recargas: useBackendRecargasDefault,
  paquetes: useBackendPaquetesMovistar,
  cargarPaquetes: async () => {},
  cargarConciliacion: async () => {},
  descargarConciliacion: async () => {},
};

export const permissionAutorizadoresDefault: TypeSubModules<number[]> = {
  recargas: [1],
  paquetes: [1],
  cargarPaquetes: [1],
  cargarConciliacion: [1],
  descargarConciliacion: [1],
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
      component: () => WithTelefoniaMovil(Recargas),
      permission: [...permissionAutorizadoresDefault?.recargas],
      subRoutes: [],
    },
    {
      link: "/telefonia-movil/paquetes",
      label: <AppIcons Logo={"RECARGA_CELULAR"} name="Paquetes" />,
      component: () => WithTelefoniaMovil(Paquetes),
      permission: [...permissionAutorizadoresDefault?.paquetes],
      subRoutes: [],
    },
    // {
    //   link: "/telefonia-movil/operador-pdp",
    //   label: <AppIcons Logo={"RecargaCelular"} name="Operador Pdp" />,
    //   component: () =>
    //     WithTelefoniaMovil(operadoresPaquetes, OperarioPDPCargarPaquetes),
    //   permission: [1], //los permisos son la combinacion de todos los modulos
    //   subRoutes: [],
    // },
  ],
};

export default RoutesTelefoniaMovil;
