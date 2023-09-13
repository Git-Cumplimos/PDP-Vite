import { lazy } from "react";
import { PermissionsCaja } from "./permissionsEnum";
const AppIcons = lazy(() => import("../../../../components/Base/AppIcons"));

/**
 * COMPONENTES ROL CAJERO
 */
const Panel = lazy(() => import("./Panel"));
const ReporteTrx = lazy(() => import("./ReporteArqueoCaja/ReporteTrx"));
const ReporteEfectivo = lazy(() => import("./ReporteArqueoCaja/ReporteEfectivo"));
const ReporteTarjeta = lazy(() => import("./ReporteArqueoCaja/ReporteTarjeta"));
const CierreCaja = lazy(() => import("./CierreCaja/CierreCaja"));
const CargaComprobante = lazy(() => import("./CargaComprobante"));
const NotasCD = lazy(() => import("./Notas"));
const Notas = lazy(() => import("./Notas/Notas"));
const ReporteSobranteFaltantes = lazy(() => import("./ReporteArqueoCaja/ReporteSobranteFaltantes"));


/**
 * COMPONENTES ROL ANALISTA
 */
const PanelHistorico = lazy(() => import("./PanelHistorico"));
const PanelConsignaciones = lazy(() => import("./PanelConsignaciones"));
const ParametrizacionRecaudo = lazy(() => import("./ParametrizacionRecaudo"));
const NotasCDHistorico = lazy(() => import("./Notas/NotasHistorico"));
const ReportesCierre = lazy(() => import("./ReportesCierre"));
const ValidacionSobranteFaltantes = lazy(() => import("./ValidacionSobranteFaltantes"));

export const rutasArqueo = [
  {
    link: "/gestion/arqueo/arqueo-cierre",
    label: <AppIcons Logo={"RECAUDO"} name="Arqueo y cierre" />,
    component: Panel,
    permission: [PermissionsCaja.RealizarArqueoCierre],
    show: false,
  },
  {
    link: "/gestion/arqueo/arqueo-cierre/reporte",
    label: <AppIcons Logo={"RECAUDO"} name="Arqueo y cierre" />,
    // label: <AppIcons Logo={"RECAUDO"} name="Reporte de transacciones" />,
    component: ReporteTrx,
    permission: [PermissionsCaja.RealizarArqueoCierre],
  },
  {
    link: "/gestion/arqueo/arqueo-cierre/reporte-efectivo-trxs",
    label: <AppIcons Logo={"RECAUDO"} name="Reporte Efectivo Arqueo de Caja" />,
    component: ReporteEfectivo,
    permission: [PermissionsCaja.VerReporteTrxCierre],
  },
  {
    link: "/gestion/arqueo/arqueo-cierre/reporte-tarjeta-trxs",
    label: <AppIcons Logo={"RECAUDO"} name="Reporte Tarjeta Arqueo de Caja" />,
    component: ReporteTarjeta,
    permission: [PermissionsCaja.VerReporteTrxCierre],
  },
  {
    link: "/gestion/arqueo/arqueo-cierre/cierre-caja",
    label: <AppIcons Logo={"RECAUDO"} name="Cierre de caja" />,
    component: CierreCaja,
    permission: [PermissionsCaja.VerReporteTrxCierre],
  },
  {
    link: "/gestion/arqueo/carga-comprobante",
    label: <AppIcons Logo={"RECAUDO"} name="Transportadora y Consignaciones" />,
    component: CargaComprobante,
    permission: [PermissionsCaja.AgregaComprobantes],
  },
  {
    link: "/gestion/arqueo/validar-comprobante",
    label: <AppIcons Logo={"RECAUDO"} name="Análisis de comprobante" />,
    component: PanelConsignaciones,
    permission: [PermissionsCaja.AnalizarComprobantes],
  },
  {
    link: "/gestion/arqueo/parametrizar-cuenta",
    label: <AppIcons Logo={"RECAUDO"} name="Parametrizar Transportadoras y Entidades Bancarias" />,
    component: ParametrizacionRecaudo,
    permission: [PermissionsCaja.AgregarEntidades],
  },
  {
    link: "/gestion/arqueo/historial-cierre",
    label: <AppIcons Logo={"RECAUDO"} name="Históricos de cierre de caja" />,
    component: PanelHistorico,
    permission: [PermissionsCaja.VerHistoricoCierresCaja],
  },
  {
    link: "/gestion/arqueo/notas",
    label: <AppIcons Logo={"RECAUDO"} name="Notas débito y crédito" />,
    component: NotasCD,
    permission: [PermissionsCaja.AgregarNotasDebito, PermissionsCaja.AgregarNotasCredito],
    subRoutes: [
      {
        link: "/gestion/arqueo/notas/debito",
        label: <AppIcons Logo={"RECAUDO"} name="Notas débito" />,
        component: () => <Notas type={true} />,
        permission: [PermissionsCaja.AgregarNotasDebito],
      },
      {
        link: "/gestion/arqueo/notas/credito",
        label: <AppIcons Logo={"RECAUDO"} name="Notas crédito" />,
        component: () => <Notas type={false} />,
        permission: [PermissionsCaja.AgregarNotasCredito],
      },
    ]
  },
  {
    link: "/gestion/arqueo/notas-historico",
    label: <AppIcons Logo={"RECAUDO"} name="Históricos notas débito y crédito" />,
    component: NotasCDHistorico,
    permission: [PermissionsCaja.VerHistoricoNotasDebitoCredito],
  },
  {
    link: "/gestion/arqueo/reporte-arqueo",
    label: <AppIcons Logo={"RECAUDO"} name="Reportes arqueo y cierre de caja" />,
    component: ReportesCierre,
    permission: [PermissionsCaja.VerHistoricoCierresCaja],
  },
  {
    link: "/gestion/arqueo/validacion-sobrantes-faltantes",
    label: <AppIcons Logo={"RECAUDO"} name="Validacion sobrantes y faltantes" />,
    component: ValidacionSobranteFaltantes,
    permission: [PermissionsCaja.ReporteSobrantesFaltantes],
  },
  {
    link: "/gestion/arqueo/reporte-sobrantes-faltantes",
    label: <AppIcons Logo={"RECAUDO"} name="Reporte de sobrantes/faltantes" />,
    component: ReporteSobranteFaltantes,
    permission: [PermissionsCaja.ReporteSobrantesFaltantes],
  },

];

const listPermissions = Object.values(PermissionsCaja);

export const listPermissionsCaja = listPermissions.splice(listPermissions.length / 2)
