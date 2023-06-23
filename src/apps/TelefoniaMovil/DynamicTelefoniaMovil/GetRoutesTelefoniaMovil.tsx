import React, { ReactNode, lazy } from "react";

import HNavbar from "../../../components/Base/HNavbar";
import WithTelefoniaMovil from "./components/WithTelefoniaMovil";
import { TypeBackend, TypeRouteModule, TypeSubModules } from "./TypeDinamic";
import { PropOperadoresComponent } from "./utils/TypesUtils";
import Recargas from "./views/Recargas";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../../components/Base/AppIcons"));

// const Recargas = lazy(() => import("./views/Recargas"));

const Paquetes = lazy(() => import("./views/Paquetes"));
const OperarioPDPCargarPaquetes = lazy(
  () => import("./views/OperarioPDP/CargarPaquetes")
);
const OperarioPDPCargarConciliacion = lazy(
  () => import("./views/OperarioPDP/CargarConciliacion")
);
const OperarioPDPDescargarConciliacion = lazy(
  () => import("./views/OperarioPDP/DescargarConciliacion")
);

// const LayoutTelefoniaMovil = lazy(
//   () => import("./layouts/LayoutTelefoniaMovil")
// );

type paramsSubModulos = {
  backend: TypeBackend;
  permission?: number[];
};

type paramsGetRoutesTelefoniaMovil = {
  name: string;
  logo: string;
  subModules: TypeSubModules<paramsSubModulos>;
};

const GetRoutesTelefoniaMovil = (params: paramsGetRoutesTelefoniaMovil[]) => {
  const defaultPermissionRecargas = [1];
  const defaultPermissionPaquetes = [1];

  let permissionRecargas: number[] = [];
  const permissionPaquetes = [];
  let operadoresRecargas: PropOperadoresComponent[] = [];
  let operadoresPaquetes: PropOperadoresComponent[] = [];

  params.map(({ name, logo, subModules }: paramsGetRoutesTelefoniaMovil) => {
    //------------Props Recargas -----------------------------
    if (subModules?.recargas?.backend) {
      let permissionInd: number[] = [];
      if (subModules?.recargas?.permission) {
        permissionRecargas.push(...subModules?.recargas?.permission);
        permissionInd.push(...subModules?.recargas?.permission);
      } else {
        permissionInd.push(...defaultPermissionRecargas);
      }

      operadoresRecargas.push({
        name: name,
        logo: logo,
        backend: subModules?.recargas?.backend,
        permission: permissionInd,
      });
    }

    //------------Props Paquetes -----------------------------
    if (subModules?.paquetes?.backend) {
      let permissionInd: number[] = [];
      if (subModules?.paquetes?.permission) {
        permissionPaquetes.push(...subModules?.paquetes?.permission);
        permissionInd.push(...subModules?.paquetes?.permission);
      } else {
        permissionInd.push(...defaultPermissionPaquetes);
      }

      operadoresPaquetes.push({
        name: name,
        logo: logo,
        backend: subModules?.paquetes?.backend,
        permission: permissionInd,
      });
    }
  });

  //--------------------telefonia movil-----------------------------------
  return {
    link: "/telefonia-movil",
    label: <AppIcons Logo={"RECARGA_CELULAR"} name="Telefonía móvil" />,
    component: ({ subRoutes }: { subRoutes: TypeRouteModule[] }) => (
      <HNavbar links={subRoutes} />
    ),
    permission: [1], //los permisos son la combinacion de todos los modulos
    subRoutes: [
      {
        link: "/telefonia-movil/recargas",
        label: <AppIcons Logo={"RECARGA_CELULAR"} name="Recargas" />,
        component: () => WithTelefoniaMovil(operadoresRecargas, Recargas),
        permission: [1], //los permisos son la combinacion de todos los modulos
        subRoutes: [],
      },
      {
        link: "/telefonia-movil/paquetes",
        label: <AppIcons Logo={"RECARGA_CELULAR"} name="Paquetes" />,
        component: () => WithTelefoniaMovil(operadoresPaquetes, Paquetes),
        permission: [1], //los permisos son la combinacion de todos los modulos
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
};

export default GetRoutesTelefoniaMovil;
