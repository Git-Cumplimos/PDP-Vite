//----- importacion react -----
import React, { ReactNode, lazy, useEffect, useState } from "react";
//----- importacion pdp -----
import HNavbar from "../../../components/Base/HNavbar";
//----- importacion modulo-----
import { RoutesRecargas, RoutesPaquetes, RoutesOperarioPDP } from "./routes";
import { PropsBackendRecargas } from "./TypesSubModulos";
import { PropsRoutes, getRoutes } from "../utils/utils";
import RoutesTelefoniaMovil from "../routes";

//*** */
const Recargas = lazy(() => import("./Recargas"));
const Paquetes = lazy(() => import("./Paquetes"));
const OperarioPDP = lazy(() => import("./OperarioPDP"));
const OperarioPDPCargarPaquetes = lazy(
  () => import("./OperarioPDP/CargarPaquetes")
);
const OperarioPDPCargarConciliacion = lazy(
  () => import("./OperarioPDP/CargarConciliacion")
);
const OperarioPDPDescargarConciliacion = lazy(
  () => import("./OperarioPDP/DescargarConciliacion")
);

type PropsComponent = {
  linkModule: String;
  BackendRecargas?: () => Promise<PropsBackendRecargas>;
  BackendPaquetes?: () => Promise<PropsBackendRecargas>;
  BackendCargaPaquetes?: () => Promise<PropsBackendRecargas>;
  BackendCargaConciliacion?: () => Promise<PropsBackendRecargas>;
  BackendDescargaConciliacion?: () => Promise<PropsBackendRecargas>;
};

const OperadorTelefoniaMovil = ({
  linkModule,
  BackendRecargas,
  BackendPaquetes,
  BackendCargaPaquetes,
  BackendCargaConciliacion,
  BackendDescargaConciliacion,
}: PropsComponent) => {
  const ModuleCurrent: PropsRoutes | undefined = RoutesTelefoniaMovil.find(
    (indexRoute: PropsRoutes) => {
      return indexRoute.link === linkModule;
    }
  );

  if (ModuleCurrent !== undefined) {
    let SubModulesVisible = [];
    if (BackendRecargas !== undefined && ModuleCurrent?.subRoutes?.[0]) {
      //subRoutes[0] -> para modulo de recargas
      SubModulesVisible.push(ModuleCurrent?.subRoutes[0]);
    }
    if (BackendPaquetes !== undefined && ModuleCurrent?.subRoutes?.[1]) {
      //subRoutes[1] -> para modulo de paquetes
      SubModulesVisible.push(ModuleCurrent?.subRoutes[1]);
    }

    if (
      (BackendCargaPaquetes !== undefined ||
        BackendDescargaConciliacion !== undefined ||
        BackendCargaConciliacion !== undefined) &&
      ModuleCurrent?.subRoutes?.[2]
    ) {
      //subRoutes[2] -> para modulo de operario pdp
      SubModulesVisible.push(ModuleCurrent?.subRoutes[2]);

      let SubModulesVisibleOperarioPdp = [];
      if (
        BackendCargaPaquetes !== undefined &&
        ModuleCurrent?.subRoutes?.[2].subRoutes?.[0]
      ) {
        //subRoutes[2].subRoutes[0] -> para modulo de operario pdp carga paquetes
        SubModulesVisibleOperarioPdp.push(
          ModuleCurrent?.subRoutes[2].subRoutes[0]
        );
      }
      if (
        BackendCargaConciliacion !== undefined &&
        ModuleCurrent?.subRoutes?.[2].subRoutes?.[1]
      ) {
        //subRoutes[2].subRoutes[1] -> para modulo de operario pdp carga conciliacion
        SubModulesVisibleOperarioPdp.push(
          ModuleCurrent?.subRoutes[2].subRoutes[1]
        );
      }
      if (
        BackendDescargaConciliacion !== undefined &&
        ModuleCurrent?.subRoutes?.[2].subRoutes?.[2]
      ) {
        //subRoutes[2].subRoutes[2] -> para modulo de operario pdp descarga conciliacion
        SubModulesVisibleOperarioPdp.push(
          ModuleCurrent?.subRoutes[2].subRoutes[2]
        );
      }

      SubModulesVisible[2].subRoutes = SubModulesVisibleOperarioPdp;
    }
    return <HNavbar links={SubModulesVisible} />;
  }

  return <></>;
};

export default OperadorTelefoniaMovil;
