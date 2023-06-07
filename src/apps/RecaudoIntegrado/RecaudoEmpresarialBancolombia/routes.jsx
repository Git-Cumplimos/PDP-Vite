import { lazy } from "react";
import { enumPermisosBancolombia } from "./enumPermisosBancolombia";
/** Componente de iconos */
const AppIcons = lazy(() => import("../../../components/Base/AppIcons"));

/**
 * RecaudoEmpresarialBancolombia
 */
const RecaudoEmpresarialBancolombia = lazy(() =>
  import("./RecaudoEmpresarialBancolombia")
);
/* const CargarArchivosRecaudo = lazy(() =>
  import("./views/CargarArchivosRecaudo")
); */
const CargarArchivos = lazy(() =>
  import("./views/CargarArchivosRecaudo/CargarArchivos")
);
const HistoricoContingencia = lazy(() =>
  import("./views/HistoricoContingenciaRecaudo/HistoricoContingencia")
);
const TransaccionesRecaudo = lazy(() =>
  import("./views/TransaccionesRecaudo/Transacciones")
);

// const as = lazy(() => import("../Views/Bancolombia/Views/CargarArchivos"));

const listPermissions = Object.values(enumPermisosBancolombia);

export const listPermissionsBancolombia = listPermissions.splice(
  listPermissions.length / 2
);

const rutasBancolombiaRecaudoEmpresarial = {
  //RecaudoEmpresarialBancolombia
  link: "/recaudoEmpresarial/recaudoEmpresarialBancolombia",
  label: <AppIcons Logo={"RECAUDO"} name="Recaudo Empresarial Bancolombia" />,
  component: RecaudoEmpresarialBancolombia,
  permission: [4001],
  subRoutes: [
    {
      link: "/recaudoEmpresarial/recaudoEmpresarialBancolombia/CargarArchivos",
      label: (
        <AppIcons
          Logo={"RECAUDO"}
          name="Cargue archivo contingencia Bancolombia"
        />
      ),
      component: CargarArchivos,
      permission: [4001],
    },
    {
      link: "/recaudoEmpresarial/recaudoEmpresarialBancolombia/HistoricoContingencia",
      label: <AppIcons Logo={"RECAUDO"} name="Histórico Contingencia" />,
      component: HistoricoContingencia,
      permission: [4002],
    },
    {
      link: "/recaudoEmpresarial/recaudoEmpresarialBancolombia/TransaccionesRecaudo",
      label: <AppIcons Logo={"RECAUDO"} name="Transacciones Recaudo" />,
      component: TransaccionesRecaudo,
      permission: [4002],
    },
  ],
};

export default rutasBancolombiaRecaudoEmpresarial;
