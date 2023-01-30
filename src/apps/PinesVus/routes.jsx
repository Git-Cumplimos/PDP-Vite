import { lazy } from "react";
import { enumPermisosPinesVus } from "./enumPermisosPinesVus";
/**
 * * Logos
 */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));


/**
 * Pines Vus
 */
 const PinesVus = lazy(() => import("./PinesVus"));
 const CrearPines = lazy(() => import("./Views/CrearPin"));
 const TramitarPines = lazy(() => import("./Views/TramitePines"));
 const AdministrarPines = lazy(() => import("./Views/AdministrarPines"));
 const ReportePines = lazy(() => import("./Views/ReportePines"));
 const CierreManual = lazy(() => import("./Views/CierreManual"))
 const ReportePinesVer = lazy(() =>
   import("./Views/Reportes/ReportePines")
 );
 const ReportePinesDescargar = lazy(() =>
   import("./Views/Reportes/DescargarReportePines")
 );
 const PagoParticipantes = lazy(() =>
   import("./Views/PagoParticipantes")
 );
 const ParticipacionPines = lazy(() =>
   import("./Views/PagoParticipantes/Participacion")
 );
 const VerParticipacionPines = lazy(() =>
   import("./Views/PagoParticipantes/VerParticipacion")
 );
 //const EspejoQX = lazy(() => import("./PinesVus/Views/EspejoQX"));
 const QX = lazy(() => import("./Views/QX"));

export const rutasPinesVus = {
  link: "/Pines/PinesVus",
  label: <AppIcons Logo={"MARKETPLACE"} name='Pines para generación de licencias' />,
  component: PinesVus,
  permission: [enumPermisosPinesVus.operarPinesVus, enumPermisosPinesVus.administrarPinesVus],
  subRoutes: [
    {
      link: "/PinesVus/Crear",
      label: <AppIcons Logo={"CrearPines"} name={"Crear Pin"} />,
      component: CrearPines,
      permission: [enumPermisosPinesVus.operarPinesVus],
    },
    {
      link: "/PinesVus/Tramitar",
      label: <AppIcons Logo={"TramitarPines"} name={"Tramitar Pines"} />,
      component: TramitarPines,
      permission: [enumPermisosPinesVus.operarPinesVus],
    },
    {      
      link: "/PinesVus/Administrar",
      label: <AppIcons Logo={"ReportePines"} name={"Administrar Pines"} />,
      component: AdministrarPines,
      permission: [enumPermisosPinesVus.operarPinesVus, enumPermisosPinesVus.administrarPinesVus],
      subRoutes: [
        {
          link: "/PinesVus/Administrar/Participacion",
          label: (
            <AppIcons Logo={"PagoParticipacion"} name={"Participación Pines"} />
          ),
          component: PagoParticipantes,
          permission: [enumPermisosPinesVus.operarPinesVus],
          subRoutes: [
            {
              link: "/PinesVus/Administrar/Participacion/PagoParticipacion",
              label: (
                <AppIcons
                  Logo={"PagoParticipacion"}
                  name={"Pago participación"}
                />
              ),
              component: ParticipacionPines,
              permission: [enumPermisosPinesVus.operarPinesVus],
            },
          ],
        },
        {
          link: "/PinesVus/Administrar/Reportes",
          label: <AppIcons Logo={"ReportePines"} name={"Reportes Pines"} />,
          component: ReportePines,
          permission: [enumPermisosPinesVus.operarPinesVus, enumPermisosPinesVus.administrarPinesVus],
          subRoutes: [
            {
              link: "/PinesVus/Administrar/Reporte/VerReportes",
              label: <AppIcons Logo={"ReportePines"} name={"Reportes Pines"} />,
              component: ReportePinesVer,
              permission: [enumPermisosPinesVus.operarPinesVus, enumPermisosPinesVus.administrarPinesVus],
            },
            {
              link: "/PinesVus/Administrar/Reporte/DescargarReportes",
              label: (
                <AppIcons
                  Logo={"DescargarReporte"}
                  name={"Descargar Reportes Pines"}
                />
              ),
              component: ReportePinesDescargar,
              permission: [enumPermisosPinesVus.administrarPinesVus],
            },
            {
              link: "/PinesVus/Administrar/Participacion/VerPagoParticipacion",
              label: (
                <AppIcons Logo={"ReportePines"} name={"Ver pago participación"} />
              ),
              component: VerParticipacionPines,
              permission: [enumPermisosPinesVus.operarPinesVus, enumPermisosPinesVus.administrarPinesVus],
            },
          ],
        },
        // {
        //   link: "/PinesVus/EspejoQX",
        //   label: <AppIcons Logo={"RECAUDO"} name={"Espejo Cupo QX"} />,
        //   component: EspejoQX,
        //   permission: [enumPermisosPinesVus.administrarPinesVus],
        // },
        {
          link: "/PinesVus/Administrar/CierreManual",
          label: <AppIcons Logo={"RECAUDO"} name={"Cierre Manual"} />,
          component: CierreManual,
          permission: [enumPermisosPinesVus.operarPinesVus],
        },

        {
          link: "/PinesVus/Administrar/QX",
          label: <AppIcons Logo={"RECAUDO"} name={"QX"} />,
          component: QX,
          permission: [enumPermisosPinesVus.administrarPinesVus, enumPermisosPinesVus.operarPinesVus],
        },     
      ]
    },
  ],
};

