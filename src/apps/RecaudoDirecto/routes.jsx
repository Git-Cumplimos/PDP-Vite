import { lazy } from "react";
import PermissionsRecaudoDirecto from "./permissions";
// import RetiroDirecto from ;

const ConvenioRecaudo = lazy(() => import("./Views/Admin/ConvenioRecaudo"));
const ConvenioRetiro = lazy(() => import("./Views/Admin/ConvenioRetiro"));
const GestionArchivosRecaudo = lazy(() =>
  import("./Views/Admin/GestionArchivosRecaudo")
);
const GestionArchivosRetiro = lazy(() =>
  import("./Views/Admin/GestionArchivosRetiro")
);
const RecaudoManual = lazy(() => import("./Views/Recaudo/RecaudoManual"));
const RecaudoBarras = lazy(() => import("./Views/Recaudo/RecaudoBarras"));
const RecaudoConjunto = lazy(() => import("./Views/Recaudo/RecaudoConjunto"));

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/** Rutas */
const RecaudoEntryPoint = lazy(() => import("./RecaudoEntryPoint"));
const AdminRecaudoDirecto = lazy(() => import("./Views/Admin"));
const RecaudoDirecto = lazy(() => import("./Views/Recaudo"));
const RetiroDirecto = lazy(() => import("./Views/Retiro/RetiroDirecto"));
const FormularioRetiro = lazy(() => import("./Views/Retiro/FormularioRetiro"));

const listPermissions = Object.values(PermissionsRecaudoDirecto);

export const listPermissionsRecaudoDirecto = listPermissions.splice(
  listPermissions.length / 2
);

export const rutasRecaudo = {
  link: "/recaudo-directo/recaudo",
  label: <AppIcons Logo={"RECAUDO"} name={"Recaudo Directo"} />,
  component: RecaudoDirecto,
  permission: [PermissionsRecaudoDirecto.Trx_recaudo_directo],
  subRoutes: [
    {
      link: "/recaudo-directo/recaudo/manual",
      label: <AppIcons Logo={"RECAUDO_MANUAL"} name={"Recaudo Manual"} />,
      component: RecaudoManual,
      permission: [PermissionsRecaudoDirecto.Trx_recaudo_directo],
    },
    {
      link: "/recaudo-directo/recaudo/barras",
      label: (
        <AppIcons
          Logo={"RECAUDO_CODIGO_DE_BARRAS"}
          name={"Recaudo con Código de Barras"}
        />
      ),
      component: RecaudoBarras,
      permission: [PermissionsRecaudoDirecto.Trx_recaudo_directo],
    },
    {
      link: "/recaudo-directo/recaudo/:pk_id_convenio",
      label: <AppIcons Logo={"RECAUDO"} name={"Consultas de recaudo"} />,
      component: RecaudoConjunto,
      permission: [PermissionsRecaudoDirecto.Trx_recaudo_directo],
      show: false,
    },
  ],
};

export const rutasRetiro = {
  link: "/recaudo-directo/consultar-retiro",
  label: <AppIcons Logo={"RETIRO"} name={"Retiro Directo"} />,
  component: RetiroDirecto,
  permission: [PermissionsRecaudoDirecto.Trx_retiro_directo],
  subRoutes: [
    {
      link: "/recaudo-directo/consultar-retiro/retirar/:pk_id_convenio",
      label: <AppIcons Logo={"RETIRO"} name={"Realizar retiro"} />,
      component: FormularioRetiro,
      permission: [PermissionsRecaudoDirecto.Trx_retiro_directo],
      show: false,
    },
  ],
};

export const rutasGestionRecaudoDirecto = {
  link: "/recaudo-directo/gestion",
  label: <AppIcons Logo={"RETIRO"} name={"Gestión"} />,
  component: AdminRecaudoDirecto,
  permission: [PermissionsRecaudoDirecto.Gestion_recaudo_retiro_directo],
  subRoutes: [
    {
      link: "/recaudo-directo/gestion/recaudo",
      label: <AppIcons Logo={"RETIRO"} name={"Convenios de Recaudos"} />,
      component: ConvenioRecaudo,
      permission: [PermissionsRecaudoDirecto.Gestion_recaudo_retiro_directo],
    },
    {
      link: "/recaudo-directo/gestion/retiro",
      label: <AppIcons Logo={"RETIRO"} name={"Convenios de Retiros"} />,
      component: ConvenioRetiro,
      permission: [PermissionsRecaudoDirecto.Gestion_recaudo_retiro_directo],
    },
    {
      link: "/recaudo-directo/gestion/archivos-recaudo",
      label: <AppIcons Logo={"RETIRO"} name={"Gestión Archivos de Recaudo"} />,
      component: GestionArchivosRecaudo,
      permission: [PermissionsRecaudoDirecto.Gestion_recaudo_retiro_directo],
    },
    {
      link: "/recaudo-directo/gestion/archivo-retiro",
      label: <AppIcons Logo={"RETIRO"} name={"Gestión Archivos de Retiro"} />,
      component: GestionArchivosRetiro,
      permission: [PermissionsRecaudoDirecto.Gestion_recaudo_retiro_directo],
    },
  ],
};

const rutasRecaudoDirecto = {
  link: "/recaudo-directo",
  label: <AppIcons Logo={"RETIRO"} name={"Recaudo/Retiro Directos"} />,
  component: RecaudoEntryPoint,
  permission: listPermissionsRecaudoDirecto,
  subRoutes: [rutasRecaudo, rutasRetiro, rutasGestionRecaudoDirecto],
};

export default rutasRecaudoDirecto;
