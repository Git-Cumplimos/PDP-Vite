import { lazy } from "react";

const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

const PublicHome = lazy(() => import("."));

/**
 * Solicitud Enrolamiento : publico
 */
const SolicitudEnrolamiento = lazy(() =>
  import("../../apps/SolicitudEnrolamiento/SolicitudEnrolamiento")
);
const FormularioEnrolamiento = lazy(() =>
  import("../../apps/SolicitudEnrolamiento/views/FormularioEnrolamiento")
);
const FormularioAutoEnrolamiento = lazy(() =>
  import("../../apps/SolicitudEnrolamiento/views/FormularioAutoEnrolamiento")
);
const ConsultaEnrolamiento = lazy(() =>
  import("../../apps/SolicitudEnrolamiento/views/ConsultaEnrolamiento")
);
const CorreccionFormulario = lazy(() =>
  import("../../apps/SolicitudEnrolamiento/views/CorreccionFormulario")
);
const ReconoserID = lazy(() =>
  import("../../apps/SolicitudEnrolamiento/views/ReconoserID")
);
const ContinuarReconoserID = lazy(() =>
  import("../../apps/SolicitudEnrolamiento/views/ContinuarReconoserID")
);

export const publicUrls = [
  { link: "", label: "Inicio", component: PublicHome },
  {
    link: "/public/solicitud-enrolamiento",
    label: <AppIcons Logo={"PAGO"} name={"Solicitud Enrolamiento"} />,
    component: SolicitudEnrolamiento,
    subRoutes: [
      {
        link: "/public/solicitud-enrolamiento/formulario",
        label: <AppIcons Logo={"PAGO"} name={"Formulario Inscripción"} />,
        component: FormularioAutoEnrolamiento,
      },
      {
        link: "/public/solicitud-enrolamiento/consultar",
        label: (
          <AppIcons Logo={"PAGO"} name={"Consultar Estado de Inscripción"} />
        ),
        component: ConsultaEnrolamiento,
        subRoutes: [
          {
            link: "/public/solicitud-enrolamiento/reconoserid/:numCedula",
            label: (
              <AppIcons Logo={"PAGO"} name={"Iniciar Proceso ReconoserID"} />
            ),
            component: ReconoserID,
          },
          {
            link: "/public/solicitud-enrolamiento/continuarreconoserid/:idreconoser",
            label: (
              <AppIcons Logo={"PAGO"} name={"Continuar Proceso ReconoserID"} />
            ),
            component: ContinuarReconoserID,
          },
          {
            link: "/public/solicitud-enrolamiento/correccionformulario/:numCedula",
            label: <AppIcons Logo={"PAGO"} name={"Corrección De Formulario"} />,
            component: CorreccionFormulario,
          },
        ],
      },
      {
        link: "/public/solicitud-enrolamiento/formulario/:idAsesor",
        label: <AppIcons Logo={"PAGO"} name={"Formulario Inscripción"} />,
        component: FormularioEnrolamiento,
      },
    ],
  },
];
