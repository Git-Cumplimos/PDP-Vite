import { lazy } from "react";

/**
 * * Providers
 */
import ProvideLoteria from "../apps/LoteriaBog/components/ProvideLoteria";
import ProvideFundamujer from "../apps/FundacionMujer/components/Providefundamujer";

/**
 * * Logos
 */
const AppIcons = lazy(() => import("../components/Base/AppIcons/AppIcons"));

/**
 * * Paginas
 */

/**
 * Base
 */
const Login = lazy(() => import("../pages/Login"));
const Home = lazy(() => import("../pages/Home"));
const Transacciones = lazy(() => import("../pages/Transacciones"));
const AuthButton = lazy(() => import("../components/Compound/Signout/Signout"));
const Error404 = lazy(() => import("../pages/Error404"));
const Reportes = lazy(() => import("../pages/Reportes"));

/**
 * Loteria
 */
const LoteriaBog = lazy(() => import("../apps/LoteriaBog/LoteriaBog"));
const Loteria = lazy(() => import("../apps/LoteriaBog/Views/Loteria"));
const Descargas =  lazy(() => import("../apps/LoteriaBog/Views/Descargas"));
const DescargarArchivosS3 = lazy(() =>
  import("../apps/LoteriaBog/Views/Descargas/DescargarArchivosS3")
);
const BorrarBilletes = lazy(() =>
  import("../apps/LoteriaBog/Views/Descargas/Borrado_billetes")
);
const CrearSorteos = lazy(() =>
  import("../apps/LoteriaBog/Views/CrearSorteos")
);
const CargaArchivos = lazy(() =>
  import("../apps/LoteriaBog/Views/CargaArchivos")
);
/**
 * ColCard
 */
const ColCard = lazy(() => import("../apps/ColCard/ColCard"));
const ConsultarColCard = lazy(() =>
  import("../apps/ColCard/Views/ConsultarColCard")
);
const RecargarColCard = lazy(() =>
  import("../apps/ColCard/Views/RecargarColCard")
);
const Premios = lazy(() => import("../apps/LoteriaBog/Views/Premios"));

/**
 * Marketplace
 */
const MarketPlace = lazy(() => import("../apps/MarketPlace/MarketPlace"));

/**
 * Fundacion de la mujer
 */
const FunMujer = lazy(() => import("../apps/FundacionMujer/FunMujer"));
const recMujer = lazy(() => import("../apps/FundacionMujer/Views/Recaudos"));
const revMujer = lazy(() => import("../apps/FundacionMujer/Views/Reversos"));

/**
 * IAM
 */
const IAMUsers = lazy(() => import("../apps/IAM/Views/IAMUsers"));
const IAMGroups = lazy(() => import("../apps/IAM/Views/IAMGroups"));
const IAMRoles = lazy(() => import("../apps/IAM/Views/IAMRoles"));
const IAMPermissions = lazy(() => import("../apps/IAM/Views/IAMPermissions"));
const IAMIndex = lazy(() => import("../apps/IAM/IAMIndex"));
const IAMPolicies = lazy(() => import("../apps/IAM/Views/IAMPolicies"));

/**
 * Formulario de actualizacion
 */
const FormCommerce = lazy(() => import("../apps/UpdateCommerce/FormCommerce"));
const CommerceInfo = lazy(() => import("../apps/UpdateCommerce/CommerceInfo"));

/**
 * Trx params
 */
const TrxParams = lazy(() => import("../apps/TrxParams/TrxParams"));
const Comisiones = lazy(() => import("../apps/TrxParams/Views/Comisiones"));
const Com2Pay = lazy(() =>
  import("../apps/TrxParams/Views/Comisiones/Com2Pay")
);
const CreateComision = lazy(() =>
  import("../apps/TrxParams/Views/Comisiones/CreateComision")
);
const Com2Collect = lazy(() =>
  import("../apps/TrxParams/Views/Comisiones/Com2Collect")
);
const Convenios = lazy(() => import("../apps/TrxParams/Views/Convenios"));
const ConvAuto = lazy(() => import("../apps/TrxParams/Views/ConvAuto"));
const Autorizadores = lazy(() =>
  import("../apps/TrxParams/Views/Autorizadores")
);

/**
 * Solicitud Enrolamiento
 */
const SolicitudEnrolamiento = lazy(() =>
  import("../apps/SolicitudEnrolamiento/SolicitudEnrolamiento")
);
const FormularioEnrolamiento = lazy(() =>
  import("../apps/SolicitudEnrolamiento/views/FormularioEnrolamiento")
);
const ConsultaEnrolamiento = lazy(() =>
  import("../apps/SolicitudEnrolamiento/views/ConsultaEnrolamiento")
);
const ReconoserID = lazy(() =>
  import("../apps/SolicitudEnrolamiento/views/ReconoserID")
);
/**
 * Recaudo
 */
const Recaudo = lazy(() => import("../apps/Recaudo/Recaudo"));
const RecaudoManual = lazy(() => import("../apps/Recaudo/Views/RecaudoManual"));
const RecaudoCodigo = lazy(() => import("../apps/Recaudo/Views/RecaudoCodigo"));

/**
 * Daviplata
 */
const Daviplata = lazy(() => import("../apps/Daviplata/DaviplataTrx"));
const Retiro = lazy(() => import("../apps/Daviplata/Views/Retiro"));
const Deposito = lazy(() => import("../apps/Daviplata/Views/Deposito"));

/**
 * API-SMS
 */
const API_SMS = lazy(() => import("../apps/API-SMS/API_SMS"));
const EnviarSMS = lazy(() => import("../apps/API-SMS/Views/EnviarSMS"));
const CrearSMS = lazy(() => import("../apps/API-SMS/Views/CrearSMS"));
const reporteSMS = lazy(() => import("../apps/API-SMS/Views/ReporteSMS"));
const BloquearNum = lazy(() => import("../apps/API-SMS/Views/BloquearNum"));

/**
 * Editar parametros tipos de transacciones
 */
const ParamsOperations = lazy(() => import("../apps/ParamsOperations/ParamsOperations"));

const emptyComp = () => {
  return <h1 className="text-3xl text-center my-4">En mantenimiento</h1>;
};

const CARGAR =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_1-P9wrhr8RWkx5zt3f64Ogy-Yr5DoQ_5ww&usqp=CAU";
const DESCARGAR =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5Ra0nfafOoCnsF9kD-Q1BH_J-kkz4CsP4Yw&usqp=CAU";

const publicUrls = [
  { link: "/login", label: "Login", component: Login },
  { link: "*", exact: false, component: Error404 },
];

const allUrlsPrivateApps = [
  {
    link: "https://portal.solucionesenred.co/",
    label: <AppIcons Logo={"SUSER"} name="SUSER" />,
    extern: true,
    permission: [1],
  },
  {
    link: "/loteria-de-bogota",
    label: <AppIcons Logo={"LOTERIA"} name="Loteria de bogota" />,
    component: LoteriaBog,
    provider: ProvideLoteria,
    permission: [3, 4, 5, 6],
    subRoutes: [
      {
        link: "/loteria-de-bogota/ventas",
        label: <AppIcons Logo={"SORTEOS"} name="Ventas" />,
        component: Loteria,
        permission: [3],
      },
      {
        link: "/loteria-de-bogota/cargar",
        label: <AppIcons Logo={CARGAR} name="Carga de archivos" />,
        component: CargaArchivos,
        permission: [4],
      },
      {
        link: "/loteria-de-bogota/descargar",
        label: <AppIcons Logo={DESCARGAR} name="Descarga de archivos" />,
        component: Descargas,
        permission: [6],
        subRoutes: [
          {
            link: "/loteria-de-bogota/descargar/descarga_reportes",
            label: <AppIcons Logo={DESCARGAR} name="Descarga de archivos" />,
            component: DescargarArchivosS3,
            permission: [6],
          },
          {
            link: "/loteria-de-bogota/descargar/borrar_billetes",
            label: <AppIcons Logo={"REPORTE"} name="Eliminar Billeteria" />,
            component: BorrarBilletes,
            permission: [6],
          }
        ]
      },
      {
        link: "/loteria-de-bogota/sorteos",
        label: <AppIcons Logo={"REPORTE"} name="Sorteos" />,
        component: CrearSorteos,
        permission: [5],
      },
      {
        link: "/loteria-de-bogota/premios",
        label: <AppIcons Logo={"PAGO"} name="Premios" />,
        component: Premios,
        extern: false,
        permission: [5], ///////////////////////////////////////////////////////////////////
      },
    ],
  },
  {
    link: "/transacciones",
    label: <AppIcons Logo={"MARKETPLACE"} name="Transacciones" />,
    component: Transacciones,
    permission: [8],
  },
  {
    link: "/update-commerce",
    label: <AppIcons Logo={"ACTUALIZACION"} name="Actualizacion de datos" />,
    component: FormCommerce,
    permission: [7],
  },
  {
    link: "/review-commerce-forms",
    label: (
      <AppIcons Logo={"ACTUALIZACION"} name="Revisar actualizacion de datos" />
    ),
    component: CommerceInfo,
    permission: [9],
  },
  {
    link: "/marketplace",
    label: <AppIcons Logo={"MARKETPLACE"} name="Marketplace" />,
    component: MarketPlace,
    extern: true,
    permission: [10],
  },
  {
    link: "/marketplace/payorder/:orden",
    label: null,
    component: MarketPlace,
    permission: [10],
  },
  {
    link: "/funmujer",
    label: <AppIcons Logo={"RECAUDO"} name="Fundación de la mujer" />,
    component: FunMujer,
    permission: [3],
    provider: ProvideFundamujer,
    subRoutes: [
      {
        link: "/funmujer/recaudo",
        label: <AppIcons Logo={"RECAUDO"} name={"Recaudo"} />,
        component: recMujer,
        permission: [3],
      },
      {
        link: "/funmujer/reversorecaudo",
        label: <AppIcons Logo={"RECAUDO"} name={"Reverso Manual"} />,
        component: revMujer,
        permission: [3],
      },
    ],
  },
  {
    link: "/iam",
    label: <AppIcons Logo={"MARKETPLACE"} name="IAM" />,
    component: IAMIndex,
    permission: [12, 13, 14, 15, 16],
    subRoutes: [
      {
        link: "/iam/users",
        label: <AppIcons Logo={"MARKETPLACE"} name="Usuarios" />,
        component: IAMUsers,
        permission: [13],
      },
      {
        link: "/iam/groups",
        label: <AppIcons Logo={"MARKETPLACE"} name="Grupos" />,
        component: IAMGroups,
        permission: [12],
      },
      {
        link: "/iam/policies",
        label: <AppIcons Logo={"MARKETPLACE"} name="Politicas" />,
        component: IAMPolicies,
        permission: [16],
      },
      {
        link: "/iam/roles",
        label: <AppIcons Logo={"MARKETPLACE"} name="Roles" />,
        component: IAMRoles,
        permission: [14],
      },
      {
        link: "/iam/permissions",
        label: <AppIcons Logo={"MARKETPLACE"} name="Permisos" />,
        component: IAMPermissions,
        permission: [15],
      },
    ],
  },
  {
    link: "/recaudo",
    label: <AppIcons Logo={"RECAUDO"} name={"Recaudo"} />,
    component: Recaudo,
    permission: [22, 23],
    subRoutes: [
      {
        link: "/recaudo/manual",
        label: <AppIcons Logo={"RECAUDO"} name={"Recaudo manual"} />,
        component: RecaudoManual,
        permission: [22],
      },
      {
        link: "/recaudo/codigo",
        label: <AppIcons Logo={"RECAUDO"} name={"Recaudo codigo de barras"} />,
        component: RecaudoCodigo,
        permission: [23],
      },
    ],
  },
  {
    link: "/trx-params",
    label: (
      <AppIcons Logo={"RECAUDO"} name={"Parametros transaccionales recaudo"} />
    ),
    component: TrxParams,
    permission: [18, 19, 20, 21],
    subRoutes: [
      {
        link: "/trx-params/comisiones",
        label: <AppIcons Logo={"IMPUESTO"} name={"Comisiones"} />,
        component: Comisiones,
        permission: [18, 19],
        subRoutes: [
          {
            link: "/trx-params/comisiones/pagadas",
            label: <AppIcons Logo={"IMPUESTO"} name={"Comisiones a pagar"} />,
            component: Com2Pay,
            permission: [18],
            subRoutes: [
              {
                link: "/trx-params/comisiones/pagadas/personalizadas",
                label: (
                  <AppIcons
                    Logo={"IMPUESTO"}
                    name={"Comisiones a pagar por comercio"}
                  />
                ),
                component: CreateComision,
                permission: [18],
              },
            ],
          },
          {
            link: "/trx-params/comisiones/cobradas",
            label: <AppIcons Logo={"IMPUESTO"} name={"Comisiones a cobrar"} />,
            component: Com2Collect,
            permission: [19],
          },
        ],
      },
      {
        link: "/trx-params/convenios",
        label: <AppIcons Logo={"RETIRO"} name={"Convenios"} />,
        component: Convenios,
        permission: [20],
        subRoutes: [
          {
            link: "/trx-params/convenios/autorizadores",
            label: (
              <AppIcons Logo={"RETIRO"} name={"Autorizadores de convenio"} />
            ),
            component: ConvAuto,
            permission: [20],
          },
        ],
      },
      {
        link: "/trx-params/autorizadores",
        label: (
          <AppIcons Logo={"PRODUCTOS_FINANCIEROS"} name={"Autorizadores"} />
        ),
        component: Autorizadores,
        permission: [21],
      },
    ],
  },
  {
    link: "/solicitud-enrolamiento",
    label: <AppIcons Logo={"PAGO"} name={"Solicitud Enrolamiento"} />,
    component: SolicitudEnrolamiento,
    permission: [1],
    subRoutes: [
      {
        link: "/solicitud-enrolamiento/formulario",
        label: <AppIcons Logo={"PAGO"} name={"Formulario Inscripción"} />,
        component: FormularioEnrolamiento,
        permission: [1],
      },
      {
        link: "/Solicitud-enrolamiento/consultar",
        label: (
          <AppIcons Logo={"PAGO"} name={"Consultar Estado de Inscripción"} />
        ),
        component: ConsultaEnrolamiento,
        permission: [1],
      },
      {
        link: "/Solicitud-enrolamiento/reconoserid",
        label: <AppIcons Logo={"PAGO"} name={"Iniciar Proceso ReconoserID"} />,
        component: ReconoserID,
        permission: [1],
      },
    ],
  },
  {
    link: "/daviplata",
    label: <AppIcons Logo={"MARKETPLACE"} name="Daviplata" />,
    component: Daviplata,
    permission: [3],
    subRoutes: [
      {
        link: "/daviplata/depositos",
        label: <AppIcons Logo={"MARKETPLACE"} name="Depositos Daviplata" />,
        component: Deposito,
        permission: [3],
      },
      {
        link: "/daviplata/retiros",
        label: <AppIcons Logo={"MARKETPLACE"} name="Retiros Daviplata" />,
        component: Retiro,
        permission: [3],
      },
    ],
  },
  {
    link: "/API_SMS",
    label: <AppIcons Logo={"MARKETPLACE"} name="SMS" />,
    component: API_SMS,
    permission: [25],
    subRoutes: [
      {
        link: "/API_SMS/EnviarSMS",
        label: <AppIcons Logo={"MARKETPLACE"} name="Enviar SMS" />,
        component: EnviarSMS,
        permission: [25],
      },
      {
        link: "/API_SMS/crearSMS",
        label: <AppIcons Logo={"MARKETPLACE"} name="Crear SMS" />,
        component: CrearSMS,
        permission: [26],
      },
      {
        link: "/API_SMS/reporteSMS",
        label: <AppIcons Logo={"MARKETPLACE"} name="Reporte" />,
        component: reporteSMS,
        permission: [26],
      },
      {
        link: "/API_SMS/BloquearNum",
        label: <AppIcons Logo={"MARKETPLACE"} name="Bloqueo de números" />,
        component: BloquearNum,
        permission: [26],
      },
    ],
  },
  {
    link: "/recargas-Colcard",
    label: <AppIcons Logo={"LOTERIA"} name="Recargas ColCard" />,
    component: ColCard,
    permission: [3],
    subRoutes: [
      {
        link: "/recargas-Colcard/recargar-tarjeta",
        label: <AppIcons Logo={"SORTEOS"} name="Recargar tarjeta" />,
        component: RecargarColCard,
        permission: [3],
      },
      {
        link: "/recargas-Colcard/consultar-tarjeta",
        label: <AppIcons Logo={CARGAR} name="Consultar tarjeta" />,
        component: ConsultarColCard,
        permission: [3],
      },
    ],
  },
  {
    link: "/params-operations",
    label: (
      <AppIcons Logo={"RECAUDO"} name={"Parametros transaccionales"} />
    ),
    component: ParamsOperations,
    permission: [1],
    subRoutes: [
      {
        link: "/params-operations/edit-params",
        label: <AppIcons Logo={"IMPUESTO"} name={"Editar parametros"} />,
        component: Comisiones,
        permission: [1],
      },
    ],
  },
];

const privateUrls = [
  { link: "/", label: "Inicio", component: Home },
  { link: "/info", label: "Informacion general", component: emptyComp },
  { link: "/gestion", label: "Gestion", component: emptyComp },
  { link: "/reportes", label: "Reportes", component: Reportes },
  { link: "/seguridad", label: "Seguridad", component: emptyComp },
  { link: "/solicitudes", label: "Tus solicitudes", component: emptyComp },
  { label: <AuthButton /> },
];

export { allUrlsPrivateApps, privateUrls, publicUrls };
