import { lazy } from "react";
import PermissionsRecaudoDirecto from "./permissions";
// import RetiroDirecto from ;

const ConvenioRecaudo = lazy(() => import("./Views/Admin/ConvenioRecaudo"));
const ConvenioRetiro = lazy(() => import("./Views/Admin/ConvenioRetiro"));
const CargarArchivosRecaudo = lazy(() => import("./Views/Admin/CargarArchivosRecaudo"));
const CargarArchivosRetiro = lazy(() => import("./Views/Admin/CargarArchivosRetiro"));
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

export const listPermissionsRecaudoDirecto = listPermissions.splice(listPermissions.length / 2)

export const rutasRecaudo = {
  link: "/recaudo-directo/recaudo",
  label: <AppIcons Logo={"Recaudo"} name={"Recaudo Directo"} />,
  component: RecaudoDirecto,
  permission: listPermissionsRecaudoDirecto,
  subRoutes: [
    {
      link: "/recaudo-directo/recaudo/manual",
      label: <AppIcons Logo={"RecaudoManual"} name={"Recaudo Manual"} />,
      component: RecaudoManual,
      permission: [PermissionsRecaudoDirecto.recaudo],
    },
    {
      link: "/recaudo-directo/recaudo/barras",
      label: <AppIcons Logo={"RecaudoCodigoDeBarras"} name={"Recaudo con Codigo de Barras"} />,
      component: RecaudoBarras,
      permission: [PermissionsRecaudoDirecto.recaudo],
    },
    {
      link: "/recaudo-directo/recaudo/:pk_id_convenio",
      label: <AppIcons Logo={"Recaudo"} name={"Consultas de recaudo"} />,
      component: RecaudoConjunto,
      permission: [PermissionsRecaudoDirecto.recaudo],
      show: false,
    },
  ],
}

export const rutasRetiro = {
  link: "/recaudo-directo/consultar-retiro",
  label: <AppIcons Logo={"Retiro"} name={"Retiro Directo"} />,
  component: RetiroDirecto,
  permission: [PermissionsRecaudoDirecto.recaudo],
  subRoutes: [
    {
      link: "/recaudo-directo/consultar-retiro/retirar/:pk_id_convenio/:nombre_convenio",
      label: <AppIcons Logo={"Retiro"} name={"Realizar retiro"} />,
      component: FormularioRetiro,
      permission: [PermissionsRecaudoDirecto.recaudo],
      show:false,
    },
  ],
}

export const rutasGestionRecaudoDirecto = {
  link: "/recaudo-directo/gestion",
  label: <AppIcons Logo={"Reporte"} name={"Gestión"} />,
  component: AdminRecaudoDirecto,
  permission: [PermissionsRecaudoDirecto.recaudo],
  subRoutes: [
    {
      link: "/recaudo-directo/gestion/recaudo",
      label: <AppIcons Logo={"Reporte"} name={"Convenios de Recaudos"} />,
      component: ConvenioRecaudo,
      permission: [PermissionsRecaudoDirecto.recaudo],
    }, {
      link: "/recaudo-directo/gestion/retiro",
      label: <AppIcons Logo={"Reporte"} name={"Convenios de Retiros"} />,
      component: ConvenioRetiro,
      permission: [PermissionsRecaudoDirecto.recaudo],
    }, {
      link: "/recaudo-directo/gestion/cargar-archivo-recaudo",
      label: <AppIcons Logo={"Reporte"} name={"Cargar Archivos de Recaudo"} />,
      component: CargarArchivosRecaudo,
      permission: [PermissionsRecaudoDirecto.recaudo],
    }, {
      link: "/recaudo-directo/gestion/cargar-archivo-retiro",
      label: <AppIcons Logo={"Reporte"} name={"Cargar Archivos de Retiro"} />,
      component: CargarArchivosRetiro,
      permission: [PermissionsRecaudoDirecto.recaudo],
    },]
}

const rutasRecaudoDirecto = {
  link: "/recaudo-directo",
  label: <AppIcons Logo={"CorresponsalBancario"} name={"Recaudo/Retiro Directos"} />,
  component: RecaudoEntryPoint,
  permission: listPermissionsRecaudoDirecto,
  subRoutes: [
    rutasRecaudo,
    rutasRetiro,
    rutasGestionRecaudoDirecto,
  ],
};

export default rutasRecaudoDirecto;