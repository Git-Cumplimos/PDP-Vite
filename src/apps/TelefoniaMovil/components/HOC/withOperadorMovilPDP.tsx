import React, { ReactNode, lazy } from "react";

import {
  PropsBackendRecargas,
  PrivateRoute,
} from "../../utils/TypesSubModulos";
import HNavbar from "../../../../components/Base/HNavbar";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../../../components/Base/AppIcons"));

const Recargas = lazy(() => import("../../views/Recargas"));
const Paquetes = lazy(() => import("../../views/Paquetes"));
const OperarioPDPCargarPaquetes = lazy(
  () => import("../../views/OperarioPDP/CargarPaquetes")
);
const OperarioPDPCargarConciliacion = lazy(
  () => import("../../views/OperarioPDP/CargarConciliacion")
);
const OperarioPDPDescargarConciliacion = lazy(
  () => import("../../views/OperarioPDP/DescargarConciliacion")
);

type HOCParams = Array<{
  name: string;
  label: ReactNode;
  permissionRecargas: number[];
  permissionPaguetes: number[];
  permissionOperario: number[];
  subModulos: {
    BackendRecargas?: () => Promise<PropsBackendRecargas>;
    BackendPaquetes?: () => Promise<PropsBackendRecargas>;
    BackendCargaPaquetes?: () => Promise<PropsBackendRecargas>;
    BackendCargaConciliacion?: () => Promise<PropsBackendRecargas>;
    BackendDescargaConciliacion?: () => Promise<PropsBackendRecargas>;
  };
}>;

const withOperadorMovilPDP = (
  params: HOCParams
) => {
  const permission: number[] = [];

  const subRutas: PrivateRoute[] = params.map(
    ({
      permissionRecargas,
      permissionPaguetes,
      permissionOperario,
      subModulos,
      label,
      name,
    }) => {
      const {
        BackendRecargas,
        BackendPaquetes,
        BackendCargaPaquetes,
        BackendCargaConciliacion,
        BackendDescargaConciliacion,
      } = subModulos;

      const subOperadorPDP = [];

      if (BackendRecargas) {
        subOperadorPDP.push({
          link: `/telefonia-movil/${name}/recargas`,
          label: <AppIcons Logo={"MARKETPLACE"} name="Recargas" />,
          component: () => <Recargas BackendRecargas={BackendRecargas} />,
          permission: [...permissionRecargas],
        });
        permission.push(...permissionRecargas);
      }
      if (BackendPaquetes) {
        subOperadorPDP.push({
          link: `/telefonia-movil/${name}/paquetes`,
          label: <AppIcons Logo={"MARKETPLACE"} name="Paquetes" />,
          component: () => <Paquetes BackendPaquetes={BackendPaquetes} />,
          permission: [...permissionPaguetes],
        });
        permission.push(...permissionPaguetes);
      }
      if (
        BackendCargaPaquetes ||
        BackendCargaConciliacion ||
        BackendDescargaConciliacion
      ) {
        const subOperativoPDP = [];
        if (BackendCargaPaquetes) {
          subOperativoPDP.push({
            link: `/telefonia-movil/${name}/operario-pdp/cargar-paquetes`,
            label: <AppIcons Logo={"MARKETPLACE"} name="Cargar paquetes" />,
            component: () => (
              <OperarioPDPCargarPaquetes
                BackendCargaPaquetes={BackendCargaPaquetes}
              />
            ),
            permission: [...permissionOperario],
          });
        }
        if (BackendCargaConciliacion) {
          subOperativoPDP.push({
            link: `/telefonia-movil/${name}/operario-pdp/cargar-conciliacion`,
            label: <AppIcons Logo={"MARKETPLACE"} name="Cargar conciliacion" />,
            component: () => (
              <OperarioPDPCargarConciliacion
                BackendCargaConciliacion={BackendCargaConciliacion}
              />
            ),
            permission: [...permissionOperario],
          });
        }
        if (BackendDescargaConciliacion) {
          subOperativoPDP.push({
            link: `/telefonia-movil/${name}/operario-pdp/descargar-conciliacion`,
            label: (
              <AppIcons Logo={"MARKETPLACE"} name="Descargar conciliacion" />
            ),
            component: () => (
              <OperarioPDPDescargarConciliacion
                BackendDescargaConciliacion={BackendDescargaConciliacion}
              />
            ),
            permission: [...permissionOperario],
          });
        }
        subOperadorPDP.push({
          link: `/telefonia-movil/${name}/operario-pdp`,
          label: <AppIcons Logo={"MARKETPLACE"} name="Operario PDP" />,
          component: ({ subRoutes }: { subRoutes: PrivateRoute[] }) => (
            <HNavbar links={subRoutes} />
          ),
          permission: [...permissionOperario],
          subRoutes: subOperativoPDP,
        });
        permission.push(...permissionOperario);
      }

      return {
        link: `/telefonia-movil/${name}`,
        label,
        component: ({ subRoutes }: { subRoutes: PrivateRoute[] }) => (
          <HNavbar links={subRoutes} />
        ),
        permission,
        subRoutes: subOperadorPDP,
      };
    }
  );

  return {
    link: "/telefonia-movil",
    label: <AppIcons Logo={"RecargaCelular"} name="Telefonía móvil" />,
    component: ({ subRoutes }: { subRoutes: PrivateRoute[] }) => (
      <HNavbar links={subRoutes} />
    ),
    permission,
    subRoutes: subRutas,
  };
};

export default withOperadorMovilPDP;
