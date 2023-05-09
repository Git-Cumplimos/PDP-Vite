import { lazy } from "react";
import { enumPermisosDavivienda } from "./enumPermisosDavivienda";
/** Componente de iconos */
const AppIcons = lazy(() => import("../../../components/Base/AppIcons"));

/**
 * RecaudoEmpresarialDavivienda
 */
const RecaudoEmpresarialDavivienda = lazy(() =>
  import("./RecaudoEmpresarialDavivienda")
);

const CargarArchivos = lazy(() =>
  import("./views/CargarArchivosRecaudo/CargarArchivos")
);
const HistoricoContingencia = lazy(() =>
  import("./views/HistoricoContingenciaRecaudo/HistoricoContingencia")
);
const TransaccionesRecaudo = lazy(() =>
  import("./views/TransaccionesRecaudo/Transacciones")
);

/* const as = lazy(() => import("../Views/Bancolombia/Views/CargarArchivos")); */

const listPermissions = Object.values(enumPermisosDavivienda);

export const listPermissionsDavivienda = listPermissions.splice(
  listPermissions.length / 2
);

const rutasDaviviendaRecaudoEmpresarial = {
  //RecaudoEmpresarialDavivienda
  link: "/recaudoEmpresarial/recaudoEmpresarialDavivienda",
  label: (
    <AppIcons
      Logo={"CorresponsaliaDavivienda"}
      name="Recaudo Empresarial Davivienda"
    />
  ),
  component: RecaudoEmpresarialDavivienda,
  permission: [4001],
  subRoutes: [
    {
      link: "/recaudoEmpresarial/recaudoEmpresarialDavivienda/CargarArchivos",
      label: <AppIcons Logo={"DepositoDaviplata"} name="Cargar Archivos" />,
      component: CargarArchivos,
      permission: [4001],
    },
    {
      link: "/recaudoEmpresarial/recaudoEmpresarialDavivienda/HistoricoContingencia",
      label: (
        <AppIcons Logo={"DepositoDaviplata"} name="Histórico Contingencia" />
      ),
      component: HistoricoContingencia,
      permission: [4002],
    },
    {
      link: "/recaudoEmpresarial/recaudoEmpresarialDavivienda/TransaccionesRecaudo",
      label: (
        <AppIcons Logo={"DepositoDaviplata"} name="Transacciones Recaudo" />
      ),
      component: TransaccionesRecaudo,
      permission: [4002],
    },
  ],
};

export default rutasDaviviendaRecaudoEmpresarial;
