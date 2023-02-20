import { lazy } from "react";

/**
 * Rutas
 */
import rutasRecaudoDirecto from "../apps/RecaudoDirecto/routes";
import rutasColpatria, {
  listPermissionsColpatria,
} from "../apps/Colpatria/routes";
import rutasDaviviendaCB, {
  listPermissionsDavivienda,
} from "../apps/Corresponsalia/CorresponsaliaDavivienda/routes";

import { enumPermisosPractisistemas } from "../apps/Practisistemas/enumPermisosPractisistemas";
import {
  rutasRecargas,
  rutasPines,
  rutasSoat,
} from "../apps/Practisistemas/routes";

import { rutasPinesVus } from "../apps/PinesVus/routes";
import { enumPermisosPinesVus } from "../apps/PinesVus/enumPermisosPinesVus";

/**
 * * Providers
 */
import ProvideLoteria from "../apps/LoteriaBog/components/ProvideLoteria";
import ProvideFundamujer from "../apps/FundacionMujer/components/Providefundamujer";
import ProvidepinesVus from "../apps/PinesVus/components/ProvidepinesVus";
import rutasAvalCB, {
  listPermissionsAval,
} from "../apps/Corresponsalia/CorresponsaliaGrupoAval/routes";
import rutasAgrarioCB, {
  listPermissionsAgrario,
} from "../apps/Corresponsalia/CorresponsaliaBancoAgrario/routes";
import rutasConfiguraciones from "../apps/TrxParams/routes";

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
const Sorteos = lazy(() => import("../apps/LoteriaBog/Views/Sorteos"));
const DescargarArchivosS3 = lazy(() =>
  import("../apps/LoteriaBog/Views/DescargarArchivosS3")
);
const BorrarBilletes = lazy(() =>
  import("../apps/LoteriaBog/Views/Sorteos/Borrado_billetes")
);
const CrearSorteos = lazy(() =>
  import("../apps/LoteriaBog/Views/Sorteos/CrearSorteos")
);
const CargaArchivos = lazy(() =>
  import("../apps/LoteriaBog/Views/CargaArchivos")
);
const ArqueoBilletes = lazy(() =>
  import("../apps/LoteriaBog/Views/InventarioBilletes/ArqueoBilletes")
);
const Premios = lazy(() => import("../apps/LoteriaBog/Views/Premios"));
const Inventario = lazy(() => import("../apps/LoteriaBog/Views/Inventario"));
const CrearInventario = lazy(() =>
  import("../apps/LoteriaBog/Views/InventarioBilletes/Inventario")
);
const ReportInventario = lazy(() =>
  import("../apps/LoteriaBog/Views/InventarioBilletes/ReportesInventario")
);

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
 * Domiciliacion PPS
 */
const Domiciliacion = lazy(() => import("../apps/Domiciliacion/Domiciliacion"));

const moduloDomiciliacion = lazy(() =>
  import("../apps/Domiciliacion/Views/ModuloDomiciliacion")
);
const comprobarEmail = lazy(() =>
  import("../apps/Domiciliacion/Views/BuscarComercioEmail")
);
const ModificarPps = lazy(() =>
  import("../apps/Domiciliacion/Views/ModificarPpsVoluntario")
);
const BuscarCedulaPpsADemanda = lazy(() =>
  import("../apps/Domiciliacion/Views/BuscarCedulaPpsADemanda")
);

const PpsVoluntarioDemanda = lazy(() =>
  import("../apps/Domiciliacion/Views/PpsVoluntarioDemanda")
);
/**
 * Recaudo
 */
const Recaudo = lazy(() => import("../apps/Recaudo/Recaudo"));
const RecaudoTrxRecaudo = lazy(() =>
  import("../apps/Recaudo/Views/TrxRecaudo")
);
const RecaudoManual = lazy(() => import("../apps/Recaudo/Views/RecaudoManual"));
const RecaudoCodigo = lazy(() => import("../apps/Recaudo/Views/RecaudoCodigo"));

/**
 * RecaudoIntegrado
 */
const RecaudoIntegrado = lazy(() =>
  import("../apps/RecaudoIntegrado/RecaudoIntegrado")
);
const RecaudoDavivienda = lazy(() =>
  import("../apps/RecaudoIntegrado/Views/Davivienda/RecaudoDavivienda")
);

const cargarArchivos = lazy(() =>
  import("../apps/RecaudoIntegrado/Views/Davivienda/Views/CargarArchivos")
);
const HistoricoContingenciaDavivienda = lazy(() =>
  import(
    "../apps/RecaudoIntegrado/Views/Davivienda/Views/HistoricoContingencia"
  )
);
const TransaccionesDavivienda = lazy(() =>
  import("../apps/RecaudoIntegrado/Views/Davivienda/Views/Transacciones")
);

const RecaudoBancolombia = lazy(() =>
  import("../apps/RecaudoIntegrado/Views/Bancolombia/RecaudoBancolombia")
);

const cargarArchivosBancolombia = lazy(() =>
  import("../apps/RecaudoIntegrado/Views/Bancolombia/Views/CargarArchivos")
);
const HistoricoContingenciaBancolombia = lazy(() =>
  import(
    "../apps/RecaudoIntegrado/Views/Bancolombia/Views/HistoricoContingencia"
  )
);
const TransaccionesBancolombia = lazy(() =>
  import("../apps/RecaudoIntegrado/Views/Bancolombia/Views/Transacciones")
);

/**
 * RUNT Banco Agrario
 */
/* const ContenedorRunt = lazy(() => import("../apps/Runt/ContenedorRunt"));
const PagarRunt = lazy(() => import("../apps/Runt/Views/PagarRunt"));
 */

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
 * API-SMS
 */
const API_SMS = lazy(() => import("../apps/API-SMS/API_SMS"));
const EnviarSMS = lazy(() => import("../apps/API-SMS/Views/EnviarSMS"));
const CrearSMS = lazy(() => import("../apps/API-SMS/Views/CrearSMS"));
const reporteSMS = lazy(() => import("../apps/API-SMS/Views/ReporteSMS"));
const BloquearNum = lazy(() => import("../apps/API-SMS/Views/BloquearNum"));

/**
 * iFood Aportes Sociales
 */

const iFoodAportes = lazy(() => import("../apps/Aportes-iFood/IFood"));

/**
 * Modulo Recargas
 */
const RecargasCelular = lazy(() =>
  import("../apps/RecargasCelular/RecargasCelular")
);

/**
 * Modulo Movistar
 */
const Movistar = lazy(() =>
  import("../apps/RecargasCelular/Movistar/Movistar.jsx")
);

const RecargasMovistar = lazy(() =>
  import("../apps/RecargasCelular/Movistar/Views/RecargasMovistar")
);
const PaquetesMovistar = lazy(() =>
  import("../apps/RecargasCelular/Movistar/Views/PaquetesMovistar.jsx")
);
const SubPaquetesMovistar = lazy(() =>
  import("../apps/RecargasCelular/Movistar/Views/SubPaquetesMovistar.jsx")
);

const OperadorPDPMovistar = lazy(() =>
  import("../apps/RecargasCelular/Movistar/Views/OperadorPDPMovistar")
);

const CargarPaquetesMovistar = lazy(() =>
  import("../apps/RecargasCelular/Movistar/Views/CargaPaquetesMovistar")
);

const ConcilacionMovistar = lazy(() =>
  import("../apps/RecargasCelular/Movistar/Views/ConcilacionMovistar")
);
const ConcilacionMovistarDescarga = lazy(() =>
  import("../apps/RecargasCelular/Movistar/Views/ConcilacionMovistarDescarga")
);
const ConciliacionMovistarCarga = lazy(() =>
  import("../apps/RecargasCelular/Movistar/Views/ConciliacionMovistarCarga")
);

const allUrlsPrivateApps = [
  {
    link: "https://portal.solucionesenred.co/",
    label: <AppIcons Logo={"SUSER"} name="SUSER" />,
    extern: true,
    permission: [1],
  },
  {
    link: "/loteria",
    label: <AppIcons Logo={"Loteria"} name="Loteria" />,
    component: LoteriaBog,
    provider: ProvideLoteria,
    permission: [3, 4, 5, 6, 44, 45, 46, 47, 95],
    subRoutes: [
      {
        link: "loteria-de-bogota",
        label: "Lotería de Bogotá",
        logo: "LoteriaBogota",
        permission: [3, 4, 5, 6],
      },
      {
        link: "loteria-del-tolima",
        label: "Lotería del Tolima",
        logo: "LoteriaTolima",
        permission: [44, 45, 46, 47],
      },
      {
        link: "loteria-de-cundinamarca",
        label: "Lotería de Cundinamarca",
        logo: "LoteriaTolima",
        permission: [95, 45, 46, 47],
      },
    ].map(({ link: name, label, logo, permission }) => ({
      link: `/loteria/${name}`,
      label: <AppIcons Logo={logo} name={label} />,
      component: LoteriaBog,
      permission: permission,
      subRoutes: [
        {
          link: `/loteria/${name}/ventas`,
          label: <AppIcons Logo={"Ventas"} name="Ventas" />,
          component: venta,
          permission: [3, 44, 95],
        },
        {
          link: `/loteria/${name}/cargar`,
          label: <AppIcons Logo={"CARGAR"} name="Carga de archivos" />,
          component: CargaArchivos,
          permission: [4],
        },
        {
          link: `/loteria/${name}/sorteos`,
          label: <AppIcons Logo={"SORTEO01"} name="Sorteos" />,
          component: Sorteos,
          permission: [5, 6],
          subRoutes: [
            {
              link: `/loteria/${name}/sorteos/tramitarSorteos`,
              label: <AppIcons Logo={"SORTEO01"} name="Sorteos" />,
              component: CrearSorteos,
              permission: [5],
            },
            {
              link: `/loteria/${name}/sorteos/borrar_billetes`,
              label: <AppIcons Logo={"REPORTE"} name="Eliminar Billeteria" />,
              component: BorrarBilletes,
              permission: [6],
            },
          ],
        },
        {
          link: `/loteria/${name}/descargar/descarga_reportes`,
          label: <AppIcons Logo={"DESCARGAR"} name="Descarga de archivos" />,
          component: DescargarArchivosS3,
          permission: [6],
        },
        {
          link: `/loteria/${name}/premios`,
          label: <AppIcons Logo={"Premio"} name="Premios" />,
          component: Premios,
          extern: false,
          permission: [3, 44, 95], ///////////////////////////////////////////////////////////////////
        },
        {
          link: `/loteria/${name}/inventario`,
          label: <AppIcons Logo={"REPORTE"} name="Inventario Billetes" />,
          component: Inventario,
          extern: false,
          permission: [3, 6, 44, 95], ///////////////////////////////////////////////////////////////////
          subRoutes: [
            {
              link: `/loteria/${name}/arqueo`,
              label: (
                <AppIcons Logo={"ArqueoBilletes"} name="Arqueo Billetes" />
              ),
              component: ArqueoBilletes,
              extern: false,
              permission: [3, 6, 44, 95], ///////////////////////////////////////////////////////////////////
            },
            {
              link: `/loteria/${name}/inventario/crear`,
              label: (
                <AppIcons Logo={"REPORTE"} name="Crear Inventario Billetes" />
              ),
              component: CrearInventario,
              extern: false,
              permission: [3, 44, 95], ///////////////////////////////////////////////////////////////////
            },
            {
              link: `/loteria/${name}/inventario/reportes`,
              label: (
                <AppIcons
                  Logo={"REPORTE"}
                  name="Reportes Inventario Billetes"
                />
              ),
              component: ReportInventario,
              extern: false,
              permission: [6], ///////////////////////////////////////////////////////////////////
            },
          ],
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
    permission: [37],
  },
  {
    link: "/funmujer",
    label: <AppIcons Logo={"Fundacion"} name="Fundación de la mujer" />,
    component: FunMujer,
    permission: [17, 27, 28],
    provider: ProvideFundamujer,
    subRoutes: [
      {
        link: "/funmujer/recaudo",
        label: <AppIcons Logo={"Recaudo"} name={"Recaudo"} />,
        component: recMujer,
        permission: [17],
      },
      {
        link: "/funmujer/desembolso",
        label: <AppIcons Logo={"Desembolso"} name={"Desembolso"} />,
        component: DesembolsoFDLM,
        permission: [28, 17],
      },
      {
        link: "/funmujer/reversorecaudo",
        label: <AppIcons Logo={"Reverso"} name={"Reverso Manual"} />,
        component: revMujer,
        permission: [27],
      },
      {
        link: "/funmujer/reporte",
        label: <AppIcons Logo={"Reporte"} name={"Reporte"} />,
        component: reportFDLM,
        permission: [28, 17],
      },
    ],
  },

  {
    link: "/PinesVus",
    label: <AppIcons Logo={"CrearPines"} name="Pines" />,
    component: PinesVus,
    permission: [
      enumPermisosPinesVus.administrarPinesVus,
      enumPermisosPinesVus.operarPinesVus,
      enumPermisosPractisistemas.practisistemasPines,
    ],
    provider: ProvidepinesVus,
    subRoutes: [rutasPines, rutasPinesVus],
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
        link: "/recaudo/trx",
        label: <AppIcons Logo={"RECAUDO"} name={"Recaudo"} />,
        component: RecaudoTrxRecaudo,
        permission: [22],
        show: false,
      },
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
    label: <AppIcons Logo={"MARKETPLACE"} name="DaviPlata" />,
    component: Daviplata,
    permission: [53],
    subRoutes: [
      {
        link: "/daviplata/depositos",
        label: <AppIcons Logo={"MARKETPLACE"} name="Depósito DaviPlata" />,
        component: Deposito,
        permission: [53],
      },
      {
        link: "/daviplata/retiros",
        label: <AppIcons Logo={"MARKETPLACE"} name="Retiro DaviPlata" />,
        component: Retiro,
        permission: [53],
      },
    ],
  },
  {
    link: "/corresponsalia",
    label: <AppIcons Logo={"Corresponsalia"} name="Corresponsalía" />,
    component: Corresponsalia,
    permission: [
      54,
      ...listPermissionsColpatria,
      ...listPermissionsDavivienda,
      ...listPermissionsAval,
      ...listPermissionsAgrario,
    ],
    subRoutes: [rutasDaviviendaCB, rutasAvalCB, rutasAgrarioCB, rutasColpatria],
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
        label: <AppIcons Logo={"Reporte"} name="Reporte" />,
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

  //Modulo RecargasCelular
  {
    link: "/recargas-celular",
    label: <AppIcons Logo={"RecargaCelular"} name="Recargas Celular" />,
    component: RecargasCelular,
    permission: [65, 66],
    subRoutes: [
      //Modulo Movistar
      {
        link: "/movistar",
        label: <AppIcons Logo={"MOVISTAR"} name="Movistar" />,
        component: Movistar,
        permission: [65, 66],
        subRoutes: [
          {
            link: "/movistar/recargas-movistar",
            label: (
              <AppIcons Logo={"RECARGASMOVISTAR"} name="Recargas Movistar " />
            ),
            component: RecargasMovistar,
            permission: [65],
          },
          {
            link: "/movistar/paquetes-movistar",
            label: (
              <AppIcons Logo={"PAQUETESMOVISTAR"} name="Paquetes Movistar " />
            ),
            component: PaquetesMovistar,
            permission: [65],
            subRoutes: [
              {
                link: "/movistar/paquetes-movistar/combo",
                label: <AppIcons Logo={"PAQUETESMOVISTAR"} name="Combos" />,
                component: SubPaquetesMovistar,
                permission: [65],
              },
              {
                link: "/movistar/paquetes-movistar/paquete-voz",
                label: (
                  <AppIcons Logo={"PAQUETESMOVISTAR"} name="Paquete de Voz" />
                ),
                component: SubPaquetesMovistar,
                permission: [65],
              },
              {
                link: "/movistar/paquetes-movistar/paquete-datos",
                label: (
                  <AppIcons Logo={"PAQUETESMOVISTAR"} name="Paquete de Datos" />
                ),
                component: SubPaquetesMovistar,
                permission: [65],
              },
              {
                link: "/movistar/paquetes-movistar/prepagada",
                label: <AppIcons Logo={"PAQUETESMOVISTAR"} name="Prepagada" />,
                component: SubPaquetesMovistar,
                permission: [65],
              },
            ],
          },
          {
            link: "/movistar/operador-pdp",
            label: <AppIcons Logo={"OperadorPdp"} name="Operador PDP" />,
            component: OperadorPDPMovistar,
            permission: [66],
            subRoutes: [
              {
                link: "/movistar/operador-pdp/cargar-paquetes",
                label: (
                  <AppIcons
                    Logo={"SORTEO01"}
                    name="Cargue de paquetes de movistar"
                  />
                ),
                component: CargarPaquetesMovistar,
                permission: [66],
              },
              {
                link: "/movistar/operador-pdp/concilacion",
                label: <AppIcons Logo={"SORTEO01"} name="Conciliación" />,
                component: ConcilacionMovistar,
                permission: [66],
                subRoutes: [
                  {
                    link: "/movistar/operador-pdp/concilacion/descarga",
                    label: (
                      <AppIcons Logo={"SORTEO01"} name="Decargar archivos" />
                    ),
                    component: ConcilacionMovistarDescarga,
                    permission: [66],
                  },
                  {
                    link: "/movistar/operador-pdp/concilacion/carga",
                    label: (
                      <AppIcons Logo={"SORTEO01"} name="Cargar archivos" />
                    ),
                    component: ConciliacionMovistarCarga,
                    permission: [66],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  rutasConfiguraciones,
  rutasRecargas,
  {
    link: "/movii-pdp",
    label: <AppIcons Logo={"MARKETPLACE"} name="MOVII PDP" />,
    component: MoviiPDP,
    permission: [48],
    subRoutes: [
      {
        link: "/movii-pdp/cash-out",
        label: <AppIcons Logo={"MARKETPLACE"} name="Cash out" />,
        component: MoviiPDPCashOut,
        permission: [49],
      },
      {
        link: "/movii-pdp/cash-out-reversos",
        label: <AppIcons Logo={"SORTEOS"} name="Reversos cash out" />,
        component: MoviiPDPReverseCashOut,
        permission: [52],
      },
    ],
  },
  {
    link: "/colpensiones",
    label: <AppIcons Logo={"RECAUDO"} name={"Colpensiones"} />,
    component: Domiciliacion,
    permission: [55, 56, 57],
    subRoutes: [
      {
        link: "/colpensiones/domiciliacion",
        label: <AppIcons Logo={"RETIRO"} name={"Domiciliación"} />,
        component: moduloDomiciliacion,
        permission: [56, 57],
        subRoutes: [
          {
            link: "/colpensiones/formulario",
            label: (
              <AppIcons Logo={"IMPUESTO"} name={"Formulario Domiciliación"} />
            ),
            component: comprobarEmail,
            permission: [55],
          },
          {
            link: "/colpensiones/modificar",
            label: <AppIcons Logo={"ACTUALIZACION"} name={"Modificar"} />,
            component: ModificarPps,
            permission: [56],
          },
        ],
      },

      /*       {
        link: "/colpensiones/formulario",
        label: <AppIcons Logo={"IMPUESTO"} name={"Formulario Domiciliación"} />,
        component: comprobarEmail,
        permission: [55],
      }, */
      /*    {
        link: "/colpensiones/modificar",
        label: <AppIcons Logo={"ACTUALIZACION"} name={"Modificar"} />,
        component: ModificarPps,
        permission: [56],
      }, */
      {
        link: "/colpensiones/voluntariodemanda",
        label: (
          <AppIcons Logo={"ACTUALIZACION"} name={"Voluntario a Demanda"} />
        ),
        component: PpsVoluntarioDemanda,
        permission: [56],
        show: false,
      },
      {
        link: "/colpensiones/ppspordemanda",
        label: <AppIcons Logo={"ACTUALIZACION"} name={"PPS Demanda"} />,
        component: BuscarCedulaPpsADemanda,
        permission: [57],
      },
    ],
  },

  {
    link: "/recaudo-integrado",
    label: <AppIcons Logo={"RECAUDO"} name={"Recaudo Integrado"} />,
    component: RecaudoIntegrado,
    permission: [55, 56, 57],
    subRoutes: [
      {
        link: "/recaudo-integrado/davivienda",
        label: <AppIcons Logo={"RETIRO"} name={"Davivienda"} />,
        component: RecaudoDavivienda,
        permission: [56, 57],
        subRoutes: [
          {
            link: "/recaudo-integrado/davivienda/cargar",
            label: <AppIcons Logo={"IMPUESTO"} name={"Cargar Archivos"} />,
            component: cargarArchivos,
            permission: [55],
          },
          {
            link: "/recaudo-integrado/davivienda/historicocontingencia",
            label: (
              <AppIcons Logo={"IMPUESTO"} name={"Histórico de contingencia"} />
            ),
            component: HistoricoContingenciaDavivienda,
            permission: [55],
          },
          {
            link: "/recaudo-integrado/davivienda/transacciones",
            label: <AppIcons Logo={"IMPUESTO"} name={"Transacciones"} />,
            component: TransaccionesDavivienda,
            permission: [55],
          },
        ],
      },
      //--------------------
      {
        link: "/recaudo-integrado/bancolombia",
        label: <AppIcons Logo={"RETIRO"} name={"Bancolombia"} />,
        component: RecaudoBancolombia,
        permission: [56, 57],
        subRoutes: [
          {
            link: "/recaudo-integrado/bancolombia/cargar",
            label: <AppIcons Logo={"IMPUESTO"} name={"Cargar Archivos"} />,
            component: cargarArchivosBancolombia,
            permission: [55],
          },
          {
            link: "/recaudo-integrado/bancolombia/historicocontingencia",
            label: (
              <AppIcons Logo={"IMPUESTO"} name={"Histórico de contingencia"} />
            ),
            component: HistoricoContingenciaBancolombia,
            permission: [55],
          },
          {
            link: "/recaudo-integrado/bancolombia/transacciones",
            label: <AppIcons Logo={"IMPUESTO"} name={"Transacciones"} />,
            component: TransaccionesBancolombia,
            permission: [55],
          },
        ],
      },
    ],
  },

  // {
  //   link: "/runt",
  //   label: <AppIcons Logo={"IMPUESTO"} name={"Runt"} />,
  //   component: ContenedorRunt,
  //   permission: [55, 56, 57],
  //   subRoutes: [
  //     {
  //       link: "/runt/pagar-runt",
  //       label: <AppIcons Logo={"RETIRO"} name={"Pagar Runt"} />,
  //       component: PagarRunt,
  //       permission: [56, 57],
  //       /*   subRoutes: [
  //         {
  //           link: "/recaudo-integrado/davivienda/cargar",
  //           label: <AppIcons Logo={"IMPUESTO"} name={"Cargar Archivos"} />,
  //           component: cargarArchivos,
  //           permission: [55],
  //         },
  //       ], */
  //     },
  //   ],
  // },

  // {
  //   link: "/pagos-ifood",
  //   label: <AppIcons Logo={"RECAUDO"} name={"Aportes en Linea iFood"} />,
  //   component: iFoodAportes,
  //   permission: [1],
  // },
  rutasSoat,
  rutasRecaudoDirecto
];

export { allUrlsPrivateApps };
