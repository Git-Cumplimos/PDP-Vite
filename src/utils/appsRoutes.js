import { lazy } from "react";

/**
 * * Providers
 */
import ProvideLoteria from "../apps/LoteriaBog/components/ProvideLoteria";
import ProvideFundamujer from "../apps/FundacionMujer/components/Providefundamujer";

/**
 * * Logos
 */
const AppIcons = lazy(() => import("../components/Base/AppIcons"));

/**
 * * Paginas
 */

/**
 * Base
 */
const Transacciones = lazy(() => import("../pages/Transacciones"));

/**
 * Loteria
 */

const LoteriaBog = lazy(() => import("../apps/LoteriaBog/LoteriaBog"));

/** Loteria Bogota */
const venta = lazy(() => import("../apps/LoteriaBog/Views/Loteria"));
const Descargas = lazy(() => import("../apps/LoteriaBog/Views/Descargas"));
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
const ArqueoBilletes = lazy(() =>
  import("../apps/LoteriaBog/Views/ArqueoBilletes")
);
const Premios = lazy(() => import("../apps/LoteriaBog/Views/Premios"));

/**
 * ColCard
 */
const ColCard = lazy(() => import("../apps/ColCard/ColCard"));
const RecargarColCard = lazy(() =>
  import("../apps/ColCard/Views/RecargarColCard")
);

/**
 * Marketplace
 */
const MarketPlace = lazy(() => import("../apps/MarketPlace/MarketPlace"));
const ReporteGral = lazy(() => import("../apps/MarketPlace/Records/Crossval"));

/**
 * Fundacion de la mujer
 */
const FunMujer = lazy(() => import("../apps/FundacionMujer/FunMujer"));
const recMujer = lazy(() => import("../apps/FundacionMujer/Views/Recaudos"));
const revMujer = lazy(() => import("../apps/FundacionMujer/Views/Reversos"));
const reportFDLM = lazy(() => import("../apps/FundacionMujer/Views/Reporte"));

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
const TipoContratoComisiones = lazy(() =>
  import("../apps/TrxParams/Views/TipoContratoComisiones")
);
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
const CreateComisionCobrada = lazy(() =>
  import("../apps/TrxParams/Views/Comisiones/CreateComisionCobrada")
);
const ConfiguracionComercios = lazy(() =>
  import("../apps/TrxParams/Views/ConfiguracionComercios")
);

/**
 * Solicitud Enrolamiento : privado
 */
const ValidacionAsesorComercial = lazy(() =>
  import("../apps/ValidacionEnrolamiento/ValidacionAsesorComercial")
);
const VerificacionFormulario = lazy(() =>
  import("../apps/ValidacionEnrolamiento/views/VerificacionFormulario")
);
const ValidacionApertura = lazy(() =>
  import("../apps/ValidacionHellen/ValidacionApertura")
);
const VerificacionApertura = lazy(() =>
  import("../apps/ValidacionHellen/views/VerificacionApertura")
);
const VerificacionNuevosComercios = lazy(() =>
  import("../apps/ValidacionEnrolamiento/VerificacionNuevosComercios")
);
const ReporteComercios = lazy(() =>
  import("../apps/ValidacionEnrolamiento/views/ReporteComercios")
);

/**
 * AdministradorGestionComercial
 */

const AdministradorGestionComercial = lazy(() =>
  import("../apps/AdministradorGestionComercial/AdministradorGestionComercial")
);
const AsesoresComerciales = lazy(() =>
  import("../apps/AdministradorGestionComercial/Views/AsesoresComerciales")
);
const ResponsablesComerciales = lazy(() =>
  import("../apps/AdministradorGestionComercial/Views/ResponsablesComerciales")
);
const UnidadesNegocioComerciales = lazy(() =>
  import(
    "../apps/AdministradorGestionComercial/Views/UnidadesNegocioComerciales"
  )
);
const ZonasComerciales = lazy(() =>
  import("../apps/AdministradorGestionComercial/Views/ZonasComerciales")
);
const LocalidadesComerciales = lazy(() =>
  import("../apps/AdministradorGestionComercial/Views/LocalidadesComerciales")
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
const ParamsOperations = lazy(() =>
  import("../apps/ParamsOperations/ParamsOperations")
);
const TypesTrxs = lazy(() =>
  import("../apps/ParamsOperations/Views/TypesTrxs")
);

const CARGAR =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_1-P9wrhr8RWkx5zt3f64Ogy-Yr5DoQ_5ww&usqp=CAU";
const DESCARGAR =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5Ra0nfafOoCnsF9kD-Q1BH_J-kkz4CsP4Yw&usqp=CAU";

const allUrlsPrivateApps = [
  {
    link: "https://portal.solucionesenred.co/",
    label: <AppIcons Logo={"SUSER"} name="SUSER" />,
    extern: true,
    permission: [1],
  },

  {
    link: "/loteria",
    label: <AppIcons Logo={"LOTERIA"} name="Loteria" />,
    component: LoteriaBog,
    provider: ProvideLoteria,
    permission: [3, 4, 5, 6],
    subRoutes: [
      { link: "loteria-de-bogota", label: "Loteria de bogota" },
      { link: "loteria-del-tolima", label: "Loteria del tolima" },
    ].map(({ link: name, label }) => ({
      link: `/loteria/${name}`,
      label: <AppIcons Logo={"LOTERIA"} name={label} />,
      component: LoteriaBog,
      permission: [3, 4, 5, 6],
      subRoutes: [
        {
          link: `/loteria/${name}/ventas`,
          label: <AppIcons Logo={"SORTEOS"} name="Ventas" />,
          component: venta,
          permission: [3],
        },
        {
          link: `/loteria/${name}/cargar`,
          label: <AppIcons Logo={CARGAR} name="Carga de archivos" />,
          component: CargaArchivos,
          permission: [4],
        },
        {
          link: `/loteria/${name}/descargar`,
          label: <AppIcons Logo={DESCARGAR} name="Descarga de archivos" />,
          component: Descargas,
          permission: [6],
          subRoutes: [
            {
              link: `/loteria/${name}/descargar/descarga_reportes`,
              label: <AppIcons Logo={DESCARGAR} name="Descarga de archivos" />,
              component: DescargarArchivosS3,
              permission: [6],
            },
            {
              link: `/loteria/${name}/descargar/borrar_billetes`,
              label: <AppIcons Logo={"REPORTE"} name="Eliminar Billeteria" />,
              component: BorrarBilletes,
              permission: [6],
            },
          ],
        },
        {
          link: `/loteria/${name}/sorteos`,
          label: <AppIcons Logo={"REPORTE"} name="Sorteos" />,
          component: CrearSorteos,
          permission: [5],
        },
        {
          link: `/loteria/${name}/premios`,
          label: <AppIcons Logo={"PAGO"} name="Premios" />,
          component: Premios,
          extern: false,
          permission: [3], ///////////////////////////////////////////////////////////////////
        },
      ],
    })),
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
    link: "https://www.puntodecompra.com.co/",
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
    link: "/reporte_general",
    label: <AppIcons Logo={"MARKETPLACE"} name="Reporte Punto De Compra" />,
    component: ReporteGral,
    permission: [8],
  },
  {
    link: "/funmujer",
    label: <AppIcons Logo={"RECAUDO"} name="Fundación de la mujer" />,
    component: FunMujer,
    permission: [17, 27, 28],
    provider: ProvideFundamujer,
    subRoutes: [
      {
        link: "/funmujer/recaudo",
        label: <AppIcons Logo={"RECAUDO"} name={"Recaudo"} />,
        component: recMujer,
        permission: [17],
      },
      {
        link: "/funmujer/reversorecaudo",
        label: <AppIcons Logo={"RECAUDO"} name={"Reverso Manual"} />,
        component: revMujer,
        permission: [27],
      },
      {
        link: "/funmujer/reporte",
        label: <AppIcons Logo={"RECAUDO"} name={"Reporte"} />,
        component: reportFDLM,
        permission: [28, 17],
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
    link: "/daviplata",
    label: <AppIcons Logo={"MARKETPLACE"} name="Daviplata" />,
    component: Daviplata,
    permission: [29, 30],
    subRoutes: [
      {
        link: "/daviplata/depositos",
        label: <AppIcons Logo={"MARKETPLACE"} name="Depositos Daviplata" />,
        component: Deposito,
        permission: [29],
      },
      {
        link: "/daviplata/retiros",
        label: <AppIcons Logo={"MARKETPLACE"} name="Retiros Daviplata" />,
        component: Retiro,
        permission: [30],
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
      // {
      //   link: "/recargas-Colcard/consultar-tarjeta",
      //   label: <AppIcons Logo={CARGAR} name="Consultar tarjeta" />,
      //   component: ConsultarColCard,
      //   permission: [3],
      // },
    ],
  },
  {
    link: "/params-operations",
    label: <AppIcons Logo={"RECAUDO"} name={"Parametros transaccionales"} />,
    component: ParamsOperations,
    permission: [18, 19, 20, 21, 31],
    subRoutes: [
      {
        link: "/params-operations/types-trxs",
        label: <AppIcons Logo={"RECAUDO"} name={"Tipos de transacciones"} />,
        component: TypesTrxs,
        permission: [31],
      },
      {
        link: "/params-operations/comisiones",
        label: <AppIcons Logo={"IMPUESTO"} name={"Tarifas / Comisiones"} />,
        component: Comisiones,
        permission: [18, 19],
        subRoutes: [
          {
            link: "/params-operations/comisiones/pagadas",
            label: <AppIcons Logo={"IMPUESTO"} name={"Comisiones a pagar"} />,
            component: Com2Pay,
            permission: [18],
            subRoutes: [
              {
                link: "/params-operations/comisiones/pagadas/personalizadas",
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
            link: "/params-operations/comisiones/cobradas",
            label: <AppIcons Logo={"IMPUESTO"} name={"Comisiones a cobrar"} />,
            component: Com2Collect,
            permission: [19],
            subRoutes: [
              {
                link: "/params-operations/comisiones/cobradas/crear",
                label: (
                  <AppIcons
                    Logo={"IMPUESTO"}
                    name={"Comisiones a cobrar por autorizador"}
                  />
                ),
                component: CreateComisionCobrada,
                permission: [19],
              },
            ],
          },
        ],
      },
      {
        link: "/params-operations/convenios",
        label: <AppIcons Logo={"RETIRO"} name={"Convenios"} />,
        component: Convenios,
        permission: [20],
        subRoutes: [
          {
            link: "/params-operations/convenios/autorizadores",
            label: (
              <AppIcons Logo={"RETIRO"} name={"Autorizadores de convenio"} />
            ),
            component: ConvAuto,
            permission: [20],
          },
        ],
      },

      {
        link: "/params-operations/autorizadores",
        label: (
          <AppIcons
            Logo={"PRODUCTOS_FINANCIEROS"}
            name={"Proveedores / Autorizadores"}
          />
        ),
        component: Autorizadores,
        permission: [21],
      },
      {
        link: "/params-operations/configuracion_comercios",
        label: <AppIcons Logo={"RETIRO"} name={"Configuración comercios"} />,
        component: ConfiguracionComercios,
        permission: [21],
      },
      {
        link: "/params-operations/tipo_contrato_comisiones",
        label: <AppIcons Logo={"RETIRO"} name={"Contratos comisiones"} />,
        component: TipoContratoComisiones,
        permission: [20],
        subRoutes: [
          {
            link: "/params-operations/convenios/autorizadores",
            label: (
              <AppIcons Logo={"RETIRO"} name={"Autorizadores de convenio"} />
            ),
            component: ConvAuto,
            permission: [20],
          },
        ],
      },
    ],
  },
  {
    link: "/verificacionnuevoscomercios",
    label: <AppIcons Logo={"PAGO"} name={"Verificación Enrolamientos"} />,
    component: VerificacionNuevosComercios,
    permission: [38, 39],
    subRoutes: [
      {
        link: "/Solicitud-enrolamiento/validarformulario",
        label: (
          <AppIcons Logo={"PAGO"} name={"Validar Formulario Inscripción"} />
        ),
        component: ValidacionAsesorComercial,
        permission: [39],
        subRoutes: [
          {
            link: "/Solicitud-enrolamiento/validarformulario/verificaciondatos/:id",
            label: (
              <AppIcons
                Logo={"PAGO"}
                name={"Verificar Formulario Inscripción"}
              />
            ),
            component: VerificacionFormulario,
            permission: [39],
          },
        ],
      },
      {
        link: "/Solicitud-enrolamiento/ReporteComercios",
        label: <AppIcons Logo={"PAGO"} name={"Reporte De Comercios"} />,
        component: ReporteComercios,
        permission: [39],
        subRoutes: [],
      },
      {
        link: "/Solicitud-enrolamiento/validarformularioreconoserid",
        label: (
          <AppIcons Logo={"PAGO"} name={"Validar Formulario ReconoserID"} />
        ),
        component: ValidacionApertura,
        permission: [39],
        subRoutes: [
          {
            link: "/Solicitud-enrolamiento/validarformularioreconoserid/verificacionapertura/:id",
            label: <AppIcons Logo={"PAGO"} name={"Verificacion Apertura"} />,
            component: VerificacionApertura,
            permission: [39],
          },
        ],
      },
    ],
  },
  {
    link: "/administrador-gestion-comercial",
    label: (
      <AppIcons Logo={"RECAUDO"} name={"Administrador Gestion Comercial"} />
    ),
    component: AdministradorGestionComercial,
    permission: [32, 33, 34, 35, 36],
    subRoutes: [
      {
        link: "/administrador-gestion-comercial/asesores",
        label: <AppIcons Logo={"IMPUESTO"} name={"Administrar Asesores"} />,
        component: AsesoresComerciales,
        permission: [34],
      },
      {
        link: "/administrador-gestion-comercial/responsables",
        label: (
          <AppIcons Logo={"ACTUALIZACION"} name={"Administrar Responsables"} />
        ),
        component: ResponsablesComerciales,
        permission: [33],
      },
      {
        link: "/administrador-gestion-comercial/unidades-de-negocio",
        label: (
          <AppIcons Logo={"RECAUDO"} name={"Administrar Unidades de Negocio"} />
        ),
        component: UnidadesNegocioComerciales,
        permission: [32],
      },
      {
        link: "/administrador-gestion-comercial/zonas",
        label: <AppIcons Logo={"RECAUDO"} name={"Administrar Zonas"} />,
        component: ZonasComerciales,
        permission: [35],
      },
      {
        link: "/administrador-gestion-comercial/localidades",
        label: <AppIcons Logo={"RECAUDO"} name={"Administrar Localidades"} />,
        component: LocalidadesComerciales,
        permission: [36],
      },
    ],
  },
];

export { allUrlsPrivateApps };
