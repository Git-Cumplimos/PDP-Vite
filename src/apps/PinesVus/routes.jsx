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
const CierreManual = lazy(() => import("./Views/CierreManual"));
const Citas = lazy(() => import("./Views/Citas"));
const ConsultaCitas = lazy(() => import("./Views/Citas/Citas"));
const ParametrizacionHorarios = lazy(() =>
  import("./Views/Citas/ParametrizacionHorarios")
);
const ReportePinesVer = lazy(() => import("./Views/Reportes/ReportePines"));
const ReportePinesDescargar = lazy(() =>
  import("./Views/Reportes/DescargarReportePines")
);
const PagoParticipantes = lazy(() => import("./Views/PagoParticipantes"));
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
  label: (
    <AppIcons
      Logo={"GeneracionLicenciasPines"}
      name="Pines para generación de licencias"
    />
  ),
  component: PinesVus,
  permission: [
    enumPermisosPinesVus.operarPinesVus,
    enumPermisosPinesVus.administrarPinesVus,
  ],
  subRoutes: [
    {
      link: "/Pines/PinesVus/Crear",
      label: <AppIcons Logo={"CrearPines"} name={"Crear Pin"} />,
      component: CrearPines,
      permission: [enumPermisosPinesVus.operarPinesVus],
    },
    {
      link: "/Pines/PinesVus/Tramitar",
      label: <AppIcons Logo={"TramitarPines"} name={"Tramitar Pines"} />,
      component: TramitarPines,
      permission: [enumPermisosPinesVus.operarPinesVus],
    },
    {
      link: "/PinesVus/Administrar",
      label: <AppIcons Logo={"AdministrarPines"} name={"Administrar Pines"} />,
      component: AdministrarPines,
      permission: [
        enumPermisosPinesVus.operarPinesVus,
        enumPermisosPinesVus.administrarPinesVus,
      ],
      subRoutes: [
        {
          link: "/Pines/PinesVus/Administrar/Participacion",
          label: (
            <AppIcons Logo={"PagoParticipacion"} name={"Participación Pines"} />
          ),
          component: PagoParticipantes,
          permission: [enumPermisosPinesVus.operarPinesVus],
          subRoutes: [
            {
              link: "/Pines/PinesVus/Administrar/Participacion/PagoParticipacion",
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
          link: "/Pines/PinesVus/Administrar/Reportes",
          label: <AppIcons Logo={"ReportePines"} name={"Reportes Pines"} />,
          component: ReportePines,
          permission: [
            enumPermisosPinesVus.operarPinesVus,
            enumPermisosPinesVus.administrarPinesVus,
          ],
          subRoutes: [
            {
              link: "/Pines/PinesVus/Administrar/Reporte/VerReportes",
              label: <AppIcons Logo={"ReportePines"} name={"Reportes Pines"} />,
              component: ReportePinesVer,
              permission: [
                enumPermisosPinesVus.operarPinesVus,
                enumPermisosPinesVus.administrarPinesVus,
              ],
            },
            {
              link: "/Pines/PinesVus/Administrar/Reporte/DescargarReportes",
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
              link: "/Pines/PinesVus/Administrar/Participacion/VerPagoParticipacion",
              label: (
                <AppIcons
                  Logo={"ReportePines"}
                  name={"Ver pago participación"}
                />
              ),
              component: VerParticipacionPines,
              permission: [
                enumPermisosPinesVus.operarPinesVus,
                enumPermisosPinesVus.administrarPinesVus,
              ],
            },
          ],
        },
        // {
        //   link: "/Pines/PinesVus/EspejoQX",
        //   label: <AppIcons Logo={"RECAUDO"} name={"Espejo Cupo QX"} />,
        //   component: EspejoQX,
        //   permission: [enumPermisosPinesVus.administrarPinesVus],
        // },
        {
          link: "/Pines/PinesVus/Administrar/CierreManual",
          label: <AppIcons Logo={"RECAUDO"} name={"Cierre Manual"} />,
          component: CierreManual,
          permission: [enumPermisosPinesVus.operarPinesVus],
        },

        {
          link: "/Pines/PinesVus/Administrar/QX",
          label: <AppIcons Logo={"RECAUDO"} name={"QX"} />,
          component: QX,
          permission: [
            enumPermisosPinesVus.administrarPinesVus,
            enumPermisosPinesVus.operarPinesVus,
          ],
        },
      ],
    },
    {
      link: "/Pines/PinesVus/Citas",
      label: <AppIcons Logo={"TramitarPines"} name={"Citas"} />,
      component: Citas,
      permission: [
        enumPermisosPinesVus.operarPinesVus,
        enumPermisosPinesVus.administrarPinesVus,
      ],
      subRoutes: [
        {
          link: "/Pines/PinesVus/Citas/Consultar",
          label: <AppIcons Logo={"PagoParticipacion"} name={"Consultar"} />,
          component: ConsultaCitas,
          permission: [enumPermisosPinesVus.operarPinesVus,enumPermisosPinesVus.administrarPinesVus],
        },
        {
          link: "/Pines/PinesVus/Citas/Parametrizacion",
          label: (
            <AppIcons
              Logo={"PagoParticipacion"}
              name={"Parametrizar horarios"}
            />
          ),
          component: ParametrizacionHorarios,
          permission: [enumPermisosPinesVus.administrarPinesVus],
        },
      ],
    },
  ],
};
