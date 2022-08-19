import { lazy } from "react";

/**
 * Rutas
 */
import rutasColpatria from "../apps/Colpatria/routes";

/**
 * * Providers
 */
import ProvideLoteria from "../apps/LoteriaBog/components/ProvideLoteria";
import ProvideFundamujer from "../apps/FundacionMujer/components/Providefundamujer";
import ProvidepinesVus from "../apps/PinesVus/components/ProvidepinesVus";

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
 * Cupo
 */
const cupo = lazy(() => import("../apps/Cupo/Cupo"));
const DtlMovCupo = lazy(() =>
  import("../apps/Cupo/Views/LimiteCupo/DtlMovComercio")
);
const cupoComercio = lazy(() => import("../apps/Cupo/Views/CupoComer"));
const CrearCupo = lazy(() => import("../apps/Cupo/Views/CrearCupo"));
const ModifiCupo = lazy(() => import("../apps/Cupo/Views/ModifiLimiteCanje"));
const AjusteCupo = lazy(() => import("../apps/Cupo/Views/AjusteCupoComer"));
const TipoMovimientoCupo = lazy(() =>
  import("../apps/Cupo/Views/TipoMovimientoCupo")
);
const DetalleLimite = lazy(() => import("../apps/Cupo/Views/DtlMovLimite"));
/**
 * Movii
 */
const MoviiPDP = lazy(() => import("../apps/Movii-pdp/MoviiPDP"));
const MoviiPDPCashOut = lazy(() =>
  import("../apps/Movii-pdp/Views/MoviiPDPCashOut")
);
const MoviiPDPReverseCashOut = lazy(() =>
  import("../apps/Movii-pdp/Views/MoviiPDPReverseCashOut")
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
const DesembolsoFDLM = lazy(() =>
  import("../apps/FundacionMujer/Views/Desembolsos")
);

/**
 * Pines Vus
 */
const PinesVus = lazy(() => import("../apps/PinesVus/PinesVus"));
const CrearPines = lazy(() => import("../apps/PinesVus/Views/CrearPin"));
const TramitarPines = lazy(() => import("../apps/PinesVus/Views/TramitePines"));
const ReportePines = lazy(() => import("../apps/PinesVus/Views/ReportePines"));
const ReportePinesVer = lazy(() =>
  import("../apps/PinesVus/Views/Reportes/ReportePines")
);
const ReportePinesDescargar = lazy(() =>
  import("../apps/PinesVus/Views/Reportes/DescargarReportePines")
);
const PagoParticipantes = lazy(() =>
  import("../apps/PinesVus/Views/PagoParticipantes")
);
const ParticipacionPines = lazy(() =>
  import("../apps/PinesVus/Views/PagoParticipantes/Participacion")
);
const VerParticipacionPines = lazy(() =>
  import("../apps/PinesVus/Views/PagoParticipantes/VerParticipacion")
);
//const EspejoQX = lazy(() => import("../apps/PinesVus/Views/EspejoQX"));
const QX = lazy(() => import("../apps/PinesVus/Views/QX"));

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
const ParametrosAutorizadores = lazy(() =>
  import("../apps/TrxParams/Views/ParametrosAutorizadores")
);
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
const CrearComercios = lazy(() =>
  import("../apps/TrxParams/Views/Comercios/CrearComercios")
);
const ListarComercios = lazy(() =>
  import("../apps/TrxParams/Views/Comercios/ListarComercios")
);
const TipoNivelComercio = lazy(() =>
  import("../apps/TrxParams/Views/TipoNivelComercios")
);
const ListarMensajePublicitario = lazy(() =>
  import(
    "../apps/TrxParams/Views/MensajesPublicitarios/ListarMensajePublicitario"
  )
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
 * Domiciliacion PPS
 */
const Domiciliacion = lazy(() => import("../apps/Domiciliacion/Domiciliacion"));
const comprobarEmail = lazy(() =>
  import("../apps/Domiciliacion/Views/BuscarComercioEmail")
);
const ModificarPps = lazy(() =>
  import("../apps/Domiciliacion/Views/ModificarPpsVoluntario")
);
const BuscarCedulaPpsADemanda = lazy(() =>
  import("../apps/Domiciliacion/Views/BuscarCedulaPpsADemanda")
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
 * Corresponsalia
 */
const Corresponsalia = lazy(() =>
  import("../apps/Corresponsalia/Corresponsalia")
);
/**
 * Corresponsalia Davivienda
 */
const CorresponsaliaDavivienda = lazy(() =>
  import(
    "../apps/Corresponsalia/CorresponsaliaDavivienda/CorresponsaliaDavivienda"
  )
);
const DaviplataCB = lazy(() =>
  import("../apps/Corresponsalia/CorresponsaliaDavivienda/Views/Daviplata")
);
const CashIn = lazy(() =>
  import(
    "../apps/Corresponsalia/CorresponsaliaDavivienda/Views/Daviplata/Deposito"
  )
);
const CashOut = lazy(() =>
  import(
    "../apps/Corresponsalia/CorresponsaliaDavivienda/Views/Daviplata/Retiro"
  )
);
const PagoGiro = lazy(() =>
  import(
    "../apps/Corresponsalia/CorresponsaliaDavivienda/Views/Daviplata/PagoGiro"
  )
);

const AhorrosCorrienteCB = lazy(() =>
  import(
    "../apps/Corresponsalia/CorresponsaliaDavivienda/Views/AhorrosCorriente"
  )
);
const DepositoCB = lazy(() =>
  import(
    "../apps/Corresponsalia/CorresponsaliaDavivienda/Views/AhorrosCorriente/Deposito"
  )
);
const RetiroCB = lazy(() =>
  import(
    "../apps/Corresponsalia/CorresponsaliaDavivienda/Views/AhorrosCorriente/Retiro"
  )
);
const PagoDeProductosPropios = lazy(() =>
  import(
    "../apps/Corresponsalia/CorresponsaliaDavivienda/Views/PagoDeProductosPropios"
  )
);
const SeleccionServicioPagar = lazy(() =>
  import(
    "../apps/Corresponsalia/CorresponsaliaDavivienda/Views/RecaudoServiciosPublicosPrivados/SeleccionServicioPagar"
  )
);
const RecaudoServiciosPublicosPrivados = lazy(() =>
  import(
    "../apps/Corresponsalia/CorresponsaliaDavivienda/Views/RecaudoServiciosPublicosPrivados/RecaudoServiciosPublicosPrivados"
  )
);
const RecaudoServiciosPublicosPrivadosMenu = lazy(() =>
  import(
    "../apps/Corresponsalia/CorresponsaliaDavivienda/Views/RecaudoServiciosPublicosPrivadosMenu"
  )
);

const RecaudoServiciosPublicosPrivadosLecturaCodigoBarras = lazy(() =>
  import(
    "../apps/Corresponsalia/CorresponsaliaDavivienda/Views/RecaudoServiciosPublicosPrivados/RecaudoServiciosPublicosPrivadosLecturaCodigoBarras"
  )
);
/**
 * API-SMS
 */
const API_SMS = lazy(() => import("../apps/API-SMS/API_SMS"));
const EnviarSMS = lazy(() => import("../apps/API-SMS/Views/EnviarSMS"));
const CrearSMS = lazy(() => import("../apps/API-SMS/Views/CrearSMS"));
const reporteSMS = lazy(() => import("../apps/API-SMS/Views/ReporteSMS"));
const BloquearNum = lazy(() => import("../apps/API-SMS/Views/BloquearNum"));

/**
 * Consorcio CIRCULEMOS
 */
const CirculemosComp = lazy(() => import("../apps/Circulemos/Circulemos"));

/**
 * Editar parametros tipos de transacciones
 */
const ParamsOperations = lazy(() =>
  import("../apps/ParamsOperations/ParamsOperations")
);
const TypesTrxs = lazy(() =>
  import("../apps/ParamsOperations/Views/TypesTrxs")
);

/**
 * iFood Aportes Sociales
 */

const iFoodAportes = lazy(() => import("../apps/Aportes-iFood/IFood"));

/**
 * RecargasMovistar
 */
const Movistar = lazy(() => import("../apps/Movistar/Movistar"));
const RecargasMovistar = lazy(() =>
  import("../apps/Movistar/Views/RecargasMovistar.jsx")
);
const ConcilacionMovistar = lazy(() =>
  import("../apps/Movistar/Views/ConcilacionMovistar")
);
const ConcilacionMovistarDescarga = lazy(() =>
  import("../apps/Movistar/Views/ConcilacionMovistarDescarga")
);
const ConciliacionMovistarCarga = lazy(() =>
  import("../apps/Movistar/Views/ConciliacionMovistarCarga")
);

const CARGAR =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_1-P9wrhr8RWkx5zt3f64Ogy-Yr5DoQ_5ww&usqp=CAU";
const DESCARGAR =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5Ra0nfafOoCnsF9kD-Q1BH_J-kkz4CsP4Yw&usqp=CAU";

const allUrlsPrivateApps = [
  {
    link: "https://portal.solucionesenred.co/",
    label: <AppIcons Logo={"SUSER"} name='SUSER' />,
    extern: true,
    permission: [1],
  },
  {
    link: "/loteria",
    label: <AppIcons Logo={"LOTERIA"} name='Loteria' />,
    component: LoteriaBog,
    provider: ProvideLoteria,
    permission: [3, 4, 5, 6, 44, 45, 46, 47],
    subRoutes: [
      {
        link: "loteria-de-bogota",
        label: "Lotería de Bogotá",
        permission: [3, 4, 5, 6],
      },
      {
        link: "loteria-del-tolima",
        label: "Lotería del Tolima",
        permission: [44, 45, 46, 47],
      },
    ].map(({ link: name, label, permission }) => ({
      link: `/loteria/${name}`,
      label: <AppIcons Logo={"LOTERIA"} name={label} />,
      component: LoteriaBog,
      permission: permission,
      subRoutes: [
        {
          link: `/loteria/${name}/ventas`,
          label: <AppIcons Logo={"SORTEOS"} name='Ventas' />,
          component: venta,
          permission: [3],
        },
        {
          link: `/loteria/${name}/cargar`,
          label: <AppIcons Logo={CARGAR} name='Carga de archivos' />,
          component: CargaArchivos,
          permission: [4],
        },
        {
          link: `/loteria/${name}/descargar`,
          label: <AppIcons Logo={DESCARGAR} name='Descarga de archivos' />,
          component: Descargas,
          permission: [6],
          subRoutes: [
            {
              link: `/loteria/${name}/descargar/descarga_reportes`,
              label: <AppIcons Logo={DESCARGAR} name='Descarga de archivos' />,
              component: DescargarArchivosS3,
              permission: [6],
            },
            {
              link: `/loteria/${name}/descargar/borrar_billetes`,
              label: <AppIcons Logo={"REPORTE"} name='Eliminar Billeteria' />,
              component: BorrarBilletes,
              permission: [6],
            },
          ],
        },
        {
          link: `/loteria/${name}/sorteos`,
          label: <AppIcons Logo={"REPORTE"} name='Sorteos' />,
          component: CrearSorteos,
          permission: [5],
        },
        {
          link: `/loteria/${name}/premios`,
          label: <AppIcons Logo={"PAGO"} name='Premios' />,
          component: Premios,
          extern: false,
          permission: [3], ///////////////////////////////////////////////////////////////////
        },
        {
          link: `/loteria/${name}/arqueo`,
          label: <AppIcons Logo={"PAGO"} name='Arqueo Billetes' />,
          component: ArqueoBilletes,
          extern: false,
          permission: [3, 6], ///////////////////////////////////////////////////////////////////
        },
      ],
    })),
  },

  {
    link: "/transacciones",
    label: <AppIcons Logo={"MARKETPLACE"} name='Transacciones' />,
    component: Transacciones,
    permission: [8],
  },
  {
    link: "/update-commerce",
    label: <AppIcons Logo={"ACTUALIZACION"} name='Actualizacion de datos' />,
    component: FormCommerce,
    permission: [7],
  },
  {
    link: "/review-commerce-forms",
    label: (
      <AppIcons Logo={"ACTUALIZACION"} name='Revisar actualizacion de datos' />
    ),
    component: CommerceInfo,
    permission: [9],
  },
  {
    link: "https://www.puntodecompra.com.co/",
    label: <AppIcons Logo={"MARKETPLACE"} name='Marketplace' />,
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
    label: <AppIcons Logo={"MARKETPLACE"} name='Reporte Punto De Compra' />,
    component: ReporteGral,
    permission: [37],
  },
  {
    link: "/funmujer",
    label: <AppIcons Logo={"RECAUDO"} name='Fundación de la mujer' />,
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
        link: "/funmujer/desembolso",
        label: <AppIcons Logo={"RECAUDO"} name={"Desembolso"} />,
        component: DesembolsoFDLM,
        permission: [28, 17],
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
    link: "/PinesVus",
    label: <AppIcons Logo={"RECAUDO"} name='Pines' />,
    component: PinesVus,
    permission: [53, 63],
    provider: ProvidepinesVus,
    subRoutes: [
      {
        link: "/PinesVus/Crear",
        label: <AppIcons Logo={"RECAUDO"} name={"Crear Pin"} />,
        component: CrearPines,
        permission: [53],
      },
      {
        link: "/PinesVus/Tramitar",
        label: <AppIcons Logo={"RECAUDO"} name={"Tramitar Pines"} />,
        component: TramitarPines,
        permission: [53],
      },
      {
        link: "/PinesVus/Participacion",
        label: <AppIcons Logo={"RECAUDO"} name={"Participación Pines"} />,
        component: PagoParticipantes,
        permission: [53],
        subRoutes: [
          {
            link: "/PinesVus/Participacion/PagoParticipacion",
            label: <AppIcons Logo={"RECAUDO"} name={"Pago participación"} />,
            component: ParticipacionPines,
            permission: [53],
          },
          {
            link: "/PinesVus/Participacion/VerPagoParticipacion",
            label: (
              <AppIcons Logo={"RECAUDO"} name={"Ver pago participación"} />
            ),
            component: VerParticipacionPines,
            permission: [53],
          },
        ],
      },
      {
        link: "/PinesVus/Reportes",
        label: <AppIcons Logo={"RECAUDO"} name={"Reportes Pines"} />,
        component: ReportePines,
        permission: [53, 63],
        subRoutes: [
          {
            link: "/PinesVus/Reporte/VerReportes",
            label: <AppIcons Logo={"RECAUDO"} name={"Reportes Pines"} />,
            component: ReportePinesVer,
            permission: [53, 63],
          },
          {
            link: "/PinesVus/Reporte/DescargarReportes",
            label: (
              <AppIcons Logo={"RECAUDO"} name={"Descargar Reportes Pines"} />
            ),
            component: ReportePinesDescargar,
            permission: [63],
          },
        ],
      },
      // {
      //   link: "/PinesVus/EspejoQX",
      //   label: <AppIcons Logo={"RECAUDO"} name={"Espejo Cupo QX"} />,
      //   component: EspejoQX,
      //   permission: [63],
      // },
      {
        link: "/PinesVus/QX",
        label: <AppIcons Logo={"RECAUDO"} name={"QX"} />,
        component: QX,
        permission: [63, 53],
      },
    ],
  },

  {
    link: "/iam",
    label: <AppIcons Logo={"MARKETPLACE"} name='IAM' />,
    component: IAMIndex,
    permission: [12, 13, 14, 15, 16],
    subRoutes: [
      {
        link: "/iam/users",
        label: <AppIcons Logo={"MARKETPLACE"} name='Usuarios' />,
        component: IAMUsers,
        permission: [13],
      },
      {
        link: "/iam/groups",
        label: <AppIcons Logo={"MARKETPLACE"} name='Grupos' />,
        component: IAMGroups,
        permission: [12],
      },
      {
        link: "/iam/policies",
        label: <AppIcons Logo={"MARKETPLACE"} name='Politicas' />,
        component: IAMPolicies,
        permission: [16],
      },
      {
        link: "/iam/roles",
        label: <AppIcons Logo={"MARKETPLACE"} name='Roles' />,
        component: IAMRoles,
        permission: [14],
      },
      {
        link: "/iam/permissions",
        label: <AppIcons Logo={"MARKETPLACE"} name='Permisos' />,
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
    link: "/cupo",
    label: <AppIcons Logo={"RECAUDO"} name={"Detalles Cupo"} />,
    component: cupo,
    permission: [59, 60, 61, 62, 64],
    subRoutes: [
      {
        link: "/cupo/cupo-comercio",
        label: <AppIcons Logo={"RECAUDO"} name={"Cupo comercios"} />,
        component: cupoComercio,
        permission: [62],
      },
      {
        link: "/cupo/cupo-comercio/detalles-cupo",
        label: <AppIcons Logo={"RECAUDO"} name={"Detalle movimiento cupo"} />,
        component: DtlMovCupo,
        permission: [62],
      },
      {
        link: "/cupo/crear-cupo",
        label: <AppIcons Logo={"RECAUDO"} name={"Crear cupo"} />,
        component: CrearCupo,
        permission: [61],
      },
      {
        link: "/cupo/modificar-cupo",
        label: (
          <AppIcons Logo={"RECAUDO"} name={"Modificación límite de cupo"} />
        ),
        component: ModifiCupo,
        permission: [60],
      },
      {
        link: "/cupo/ajuste-deuda-cupo",
        label: <AppIcons Logo={"RECAUDO"} name={"Ajuste deuda cupo"} />,
        component: AjusteCupo,
        permission: [59],
      },
      {
        link: "/cupo/tipos-movimientos-cupo",
        label: <AppIcons Logo={"RECAUDO"} name={"Tipos de movimientos cupo"} />,
        component: TipoMovimientoCupo,
        permission: [64],
      },
      {
        link: "/cupo/detalles-limite-cupo",
        label: <AppIcons Logo={"RECAUDO"} name={"Detalles límite de cupo"} />,
        component: DetalleLimite,
        permission: [1],
      },
    ],
  },
  {
    link: "/daviplata",
    label: <AppIcons Logo={"MARKETPLACE"} name='DaviPlata' />,
    component: Daviplata,
    permission: [53],
    subRoutes: [
      {
        link: "/daviplata/depositos",
        label: <AppIcons Logo={"MARKETPLACE"} name='Depósito DaviPlata' />,
        component: Deposito,
        permission: [53],
      },
      {
        link: "/daviplata/retiros",
        label: <AppIcons Logo={"MARKETPLACE"} name='Retiro DaviPlata' />,
        component: Retiro,
        permission: [53],
      },
    ],
  },
  {
    link: "/corresponsalia",
    label: <AppIcons Logo={"MARKETPLACE"} name='Corresponsalia' />,
    component: Corresponsalia,
    permission: [54],
    subRoutes: [
      {
        link: "/corresponsalia/corresponsaliaDavivienda",
        label: (
          <AppIcons Logo={"MARKETPLACE"} name='Corresponsalia Davivienda' />
        ),
        component: CorresponsaliaDavivienda,
        permission: [54],
        subRoutes: [
          {
            link: "/corresponsalia/corresponsaliaDavivienda/Daviplata",
            label: <AppIcons Logo={"MARKETPLACE"} name='DaviPlata' />,
            component: DaviplataCB,
            permission: [54],
            subRoutes: [
              {
                link: "/corresponsalia/corresponsaliaDavivienda/DaviplatacashIn",
                label: (
                  <AppIcons Logo={"MARKETPLACE"} name='Depósito DaviPlata' />
                ),
                component: CashIn,
                permission: [54],
              },
              {
                link: "/corresponsalia/corresponsaliaDavivienda/DaviplatacashOut",
                label: (
                  <AppIcons Logo={"MARKETPLACE"} name='Retiro DaviPlata' />
                ),
                component: CashOut,
                permission: [54],
              },
            ],
          },

          {
            link: "/corresponsalia/corresponsaliaDavivienda/ahorrosCorriente",
            label: (
              <AppIcons
                Logo={"MARKETPLACE"}
                name='Transacciones cuentas Davivienda'
              />
            ),
            component: AhorrosCorrienteCB,
            permission: [54],
            subRoutes: [
              {
                link: "/corresponsalia/corresponsaliaDavivienda/ahorrosCorriente/deposito",
                label: <AppIcons Logo={"MARKETPLACE"} name='Depósitos' />,
                component: DepositoCB,
                permission: [54],
              },
              {
                link: "/corresponsalia/corresponsaliaDavivienda/ahorrosCorriente/retiro",
                label: <AppIcons Logo={"MARKETPLACE"} name='Retiros' />,
                component: RetiroCB,
                permission: [54],
              },
            ],
          },
          {
            link: "/corresponsalia/corresponsaliaDavivienda/Daviplatapagos_giros",
            label: <AppIcons Logo={"MARKETPLACE"} name='Pago por giro' />,
            component: PagoGiro,
            permission: [54],
          },

          {
            link: "/corresponsalia/corresponsaliaDavivienda/pagoDeProductosPropios",
            label: (
              <AppIcons
                Logo={"MARKETPLACE"}
                name='Pago de productos de crédito'
              />
            ),
            component: PagoDeProductosPropios,
            permission: [54],
          },
          {
            link: "/corresponsalia/corresponsaliaDavivienda/recaudoServiciosPublicosPrivados",
            label: (
              <AppIcons
                Logo={"MARKETPLACE"}
                name='Recaudo servicios públicos y privados'
              />
            ),
            component: RecaudoServiciosPublicosPrivadosMenu,
            permission: [54],
            subRoutes: [
              {
                link: "/corresponsalia/corresponsaliaDavivienda/recaudoServiciosPublicosPrivados/seleccion",
                label: <AppIcons Logo={"MARKETPLACE"} name='Recaudo manual' />,
                component: SeleccionServicioPagar,
                permission: [54],
              },
              {
                link: "/corresponsalia/corresponsaliaDavivienda/recaudoServiciosPublicosPrivados/codbarras",
                label: (
                  <AppIcons
                    Logo={"MARKETPLACE"}
                    name='Recaudo código de barras'
                  />
                ),
                component: RecaudoServiciosPublicosPrivadosLecturaCodigoBarras,
                permission: [54],
              },
              {
                link: "/corresponsalia/corresponsaliaDavivienda/recaudoServiciosPublicosPrivados/manual",
                label: (
                  <AppIcons Logo={"MARKETPLACE"} name='Selección del covenio' />
                ),
                component: RecaudoServiciosPublicosPrivados,
                permission: [54],
                show: false,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    link: "/API_SMS",
    label: <AppIcons Logo={"MARKETPLACE"} name='SMS' />,
    component: API_SMS,
    permission: [25],
    subRoutes: [
      {
        link: "/API_SMS/EnviarSMS",
        label: <AppIcons Logo={"MARKETPLACE"} name='Enviar SMS' />,
        component: EnviarSMS,
        permission: [25],
      },
      {
        link: "/API_SMS/crearSMS",
        label: <AppIcons Logo={"MARKETPLACE"} name='Crear SMS' />,
        component: CrearSMS,
        permission: [26],
      },
      {
        link: "/API_SMS/reporteSMS",
        label: <AppIcons Logo={"MARKETPLACE"} name='Reporte' />,
        component: reporteSMS,
        permission: [26],
      },
      {
        link: "/API_SMS/BloquearNum",
        label: <AppIcons Logo={"MARKETPLACE"} name='Bloqueo de números' />,
        component: BloquearNum,
        permission: [26],
      },
    ],
  },
  // {
  //   link: "/recargas-Colcard",
  //   label: <AppIcons Logo={"LOTERIA"} name='Recargas ColCard' />,
  //   component: ColCard,
  //   permission: [50],
  //   subRoutes: [
  //     {
  //       link: "/recargas-Colcard/recargar-tarjeta",
  //       label: <AppIcons Logo={"SORTEOS"} name='Recargar tarjeta' />,
  //       component: RecargarColCard,
  //       permission: [50],
  //     },
  //     // {
  //     //   link: "/recargas-Colcard/consultar-tarjeta",
  //     //   label: <AppIcons Logo={CARGAR} name="Consultar tarjeta" />,
  //     //   component: ConsultarColCard,
  //     //   permission: [3],
  //     // },
  //   ],
  // },

  {
    link: "/movistar",
    label: <AppIcons Logo={"LOTERIA"} name='Movistar' />,
    component: Movistar,
    permission: [65, 66],
    subRoutes: [
      {
        link: "/movistar/recargas-movistar",
        label: <AppIcons Logo={"SORTEOS"} name='Recargas Movistar ' />,
        component: RecargasMovistar,
        permission: [65],
      },
      {
        link: "/movistar/concilacion",
        label: <AppIcons Logo={"SORTEOS"} name='Conciliación' />,
        component: ConcilacionMovistar,
        permission: [66],
        subRoutes: [
          {
            link: "/movistar/concilacion/descarga",
            label: <AppIcons Logo={"SORTEOS"} name='Decargar archivos' />,
            component: ConcilacionMovistarDescarga,
            permission: [66],
          },
          {
            link: "/movistar/concilacion/carga",
            label: <AppIcons Logo={"SORTEOS"} name='Cargar archivos' />,
            component: ConciliacionMovistarCarga,
            permission: [66],
          },
        ],
      },
    ],
  },

  {
    link: "/movii-pdp",
    label: <AppIcons Logo={"LOTERIA"} name='MOVII PDP' />,
    component: MoviiPDP,
    permission: [48],
    subRoutes: [
      {
        link: "/movii-pdp/cash-out",
        label: <AppIcons Logo={"SORTEOS"} name='Cash out' />,
        component: MoviiPDPCashOut,
        permission: [49],
      },
      {
        link: "/movii-pdp/cash-out-reversos",
        label: <AppIcons Logo={"SORTEOS"} name='Reversos cash out' />,
        component: MoviiPDPReverseCashOut,
        permission: [52],
      },
    ],
  },
  {
    link: "/params-operations",
    label: <AppIcons Logo={"RECAUDO"} name={"Parametros transaccionales"} />,
    component: ParamsOperations,
    permission: [18, 19, 20, 21, 31],
    subRoutes: [
      {
        link: "/params-operations/parametros-autorizadores",
        label: (
          <AppIcons Logo={"RECAUDO"} name={"Parametros por autorizador"} />
        ),
        component: ParametrosAutorizadores,
        permission: [51],
      },
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
      {
        link: "/params-operations/tipo-nivel-comercios",
        label: <AppIcons Logo={"RECAUDO"} name={"Tipo nivel comercios"} />,
        component: TipoNivelComercio,
        permission: [21],
      },
      {
        link: "/params-operations/comercios",
        label: <AppIcons Logo={"RECAUDO"} name={"Comercios"} />,
        component: ListarComercios,
        permission: [21],
      },
      {
        link: "/params-operations/comercios/crear",
        label: <AppIcons Logo={"RECAUDO"} name={"Comercios"} />,
        component: CrearComercios,
        permission: [21],
        show: false,
      },
      {
        link: "/params-operations/mensajes_publicitarios",
        label: <AppIcons Logo={"RECAUDO"} name={"Mensajes publicitarios"} />,
        component: ListarMensajePublicitario,
        permission: [21],
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
  {
    link: "/domiciliacion",
    label: <AppIcons Logo={"RECAUDO"} name={"Domiciliación"} />,
    component: Domiciliacion,
    permission: [55, 56, 57],
    subRoutes: [
      {
        link: "/domiciliacion/formulario",
        label: <AppIcons Logo={"IMPUESTO"} name={"Formulario Domiciliación"} />,
        component: comprobarEmail,
        permission: [55],
      },
      {
        link: "/domiciliacion/modificar",
        label: <AppIcons Logo={"ACTUALIZACION"} name={"Modificar"} />,
        component: ModificarPps,
        permission: [56],
      },
      {
        link: "/domiciliacion/ppspordemanda",
        label: <AppIcons Logo={"ACTUALIZACION"} name={"Pps A Demanda"} />,
        component: BuscarCedulaPpsADemanda,
        permission: [57],
      },
    ],
  },
  {
    link: "/circulemos",
    label: <AppIcons Logo={"RECAUDO"} name={"Consorcio circulemos"} />,
    component: CirculemosComp,
    permission: [],
  },
  {
    link: "/pagos-ifood",
    label: <AppIcons Logo={"RECAUDO"} name={"Aportes en Linea iFood"} />,
    component: iFoodAportes,
    permission: [1],
  },
  rutasColpatria,
];

export { allUrlsPrivateApps };
