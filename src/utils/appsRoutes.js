import { lazy } from "react";

/**
 * Rutas
 */
import rutasIAM from "../apps/IAM/routes";

import rutasBancolombiaRecaudoEmpresarial from "../apps/RecaudoIntegrado/RecaudoEmpresarialBancolombia/routes";
import rutasDaviviendaRecaudoEmpresarial from "../apps/RecaudoIntegrado/RecaudoEmpresarialDavivienda/routes";

import rutasRecaudoDirecto from "../apps/RecaudoDirecto/routes";

import rutasColpatria, {
  listPermissionsColpatria,
  rutasGestionColpatria,
} from "../apps/Colpatria/routes";
import rutasDaviviendaCB, {
  listPermissionsDavivienda,
} from "../apps/Corresponsalia/CorresponsaliaDavivienda/routes";
import RoutesTelefoniaMovil from "../apps/TelefoniaMovil/routes";

//Rutas Emcali
import routesEmcali from "../apps/Emcali/routes";
import routesOtrasEntidades from "../apps/OtrasEntidades/routes";

import { enumPermisosPractisistemas } from "../apps/Practisistemas/enumPermisosPractisistemas";
import {
  // rutasRecargas,
  rutasPines,
  // rutasSoat,
  rutasApuestas,
} from "../apps/Practisistemas/routes";

import { rutasPinesVus } from "../apps/PinesVus/routes";
import { enumPermisosPinesVus } from "../apps/PinesVus/enumPermisosPinesVus";

import rutasPinesCrc, {
  listPermissionsPinesCrc,
} from "../apps/PinesCrc/routes";

/**
 * * Providers
 */
import ProvideLoteria from "../apps/LoteriaBog/components/ProvideLoteria";
import ProvidepinesVus from "../apps/PinesVus/components/ProvidepinesVus";
import rutasAvalCB, {
  listPermissionsAval,
  listPermissionsGestionAval,
  rutasGestionGrupoAval,
} from "../apps/Corresponsalia/CorresponsaliaGrupoAval/routes";
import rutasAgrarioCB, {
  listPermissionsAgrario,
  listPermissionsGestionAgrario,
  rutasGestionAgrario,
} from "../apps/Corresponsalia/CorresponsaliaBancoAgrario/routes";
import rutasConfiguraciones from "../apps/TrxParams/routes";
import rutasRecaudoMultiple, {
  listPermissionsRecaudoMultiple,
} from "../apps/Corresponsalia/RecaudoMultiple/routes";
import rutasRecargasTullave, {
  rutasGestionRecargasTullave,
  listPermissionsTuLlaveAdmin,
} from "../apps/RecargasTuLlave/routes";
import rutasPowwi from "../apps/Powwi/routes";
import routesAlmaseg from "../apps/Almaseg/routes"; //Modulo Almaseg
import rutasFundacionMujer from "../apps/FundacionMujer/routes";
import rutasMovii from "../apps/Movii-pdp/routes";
import rutasMoviliza from "../apps/Moviliza/routes";
import routesRecargaCupo from "../apps/RecargaCupo/routes";
import rutasCorresponsaliaNequi from "../apps/Nequi/routes";

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
const DownloadArchivos = lazy(() =>
  import("../apps/LoteriaBog/Views/DownloadArchivos")
);
const ArchivosPagoPremios = lazy(() =>
  import("../apps/LoteriaBog/Views/ArchivosPagoPremios")
);
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
const HistoricoCargues = lazy(() =>
  import("../apps/LoteriaBog/Views/HistoricoCargues")
);
const ArqueoBilletes = lazy(() =>
  import("../apps/LoteriaBog/Views/InventarioBilletes/ArqueoBilletes")
);
const PagoDePremios = lazy(() =>
  import("../apps/LoteriaBog/Views/PagoDePremios")
);
const Premios = lazy(() => import("../apps/LoteriaBog/Views/Premios"));
const HistoricoPagoPremios = lazy(() =>
  import("../apps/LoteriaBog/Views/HistoricoPagoPremios")
);
const Inventario = lazy(() => import("../apps/LoteriaBog/Views/Inventario"));
const CrearInventario = lazy(() =>
  import("../apps/LoteriaBog/Views/InventarioBilletes/Inventario")
);
const ReportInventario = lazy(() =>
  import("../apps/LoteriaBog/Views/InventarioBilletes/ReportesInventario")
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
const DetalleModificacionCupo = lazy(() =>
  import("../apps/Cupo/Views/DtlModifiCupo")
);
/**
 * Movii
 */
// const rutasMovii = lazy(() => import("../apps/Movii-pdp/routes"));
/**
 * Marketplace
 */
const MarketPlace = lazy(() => import("../apps/MarketPlace/MarketPlace"));
const ReporteGral = lazy(() => import("../apps/MarketPlace/Records/Crossval"));

/**
 * Pines Vus
 */
const PinesVus = lazy(() => import("../apps/PinesVus/PinesVus"));
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
// const RecaudoIntegrado = lazy(() =>
//   import("../apps/RecaudoIntegrado/RecaudoIntegrado")
// );
// const RecaudoDavivienda = lazy(() =>
//   import("../apps/RecaudoIntegrado/Views/Davivienda/RecaudoDavivienda")
// );

// const cargarArchivos = lazy(() =>
//   import("../apps/RecaudoIntegrado/Views/Davivienda/Views/CargarArchivos")
// );
// const HistoricoContingenciaDavivienda = lazy(() =>
//   import(
//     "../apps/RecaudoIntegrado/Views/Davivienda/Views/HistoricoContingencia"
//   )
// );
// const TransaccionesDavivienda = lazy(() =>
//   import("../apps/RecaudoIntegrado/Views/Davivienda/Views/Transacciones")
// );

// const RecaudoBancolombia = lazy(() =>
//   import("../apps/RecaudoIntegrado/Views/Bancolombia/RecaudoBancolombia")
// );

// const cargarArchivosBancolombia = lazy(() =>
//   import("../apps/RecaudoIntegrado/Views/Bancolombia/Views/CargarArchivos")
// );
// const HistoricoContingenciaBancolombia = lazy(() =>
//   import(
//     "../apps/RecaudoIntegrado/Views/Bancolombia/Views/HistoricoContingencia"
//   )
// );
// const TransaccionesBancolombia = lazy(() =>
//   import("../apps/RecaudoIntegrado/Views/Bancolombia/Views/Transacciones")
// );

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
 * RecaudoEmpresarial
 */
const RecaudoEmpresarial = lazy(() =>
  import("../apps/RecaudoIntegrado/RecaudoEmpresarial")
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

/**
 * Modulo Gestion transaccional
 */
const GestionTransaccional = lazy(() =>
  import("../pages/GestionTransaccional")
);

/**
 * Gestion anulación pines CRC
 */
const AnulacionesPinesCRC = lazy(() =>
  import("../apps/PinesCrc/Views/AnulacionesPines")
);
const CargueAnulacionesPinesCRC = lazy(() =>
  import("../apps/PinesCrc/Views/Anulaciones/CargueAnulaciones")
);
const DescargaPeticionesPinesCRC = lazy(() =>
  import("../apps/PinesCrc/Views/Anulaciones/DescargarArchivoPeticiones")
);
const HistoricoAnulacionesPinesCRC = lazy(() =>
  import("../apps/PinesCrc/Views/Anulaciones/HistoricoAnulaciones")
);

/**
 * Pines Combinados -- CRC y Comsión premium
 */
const PinesCombinados = lazy(() =>
  import("../apps/PinesVus/Views/PinesCombinados/CrearPin")
);

const allUrlsPrivateApps = [
  {
    link: "https://portal.solucionesenred.co/",
    label: <AppIcons Logo={"SUSER"} name="SUSER" />,
    extern: true,
    permission: [1],
  },
  {
    link: "/GestionTransaccional",
    label: <AppIcons Logo={"PINES_ADMINISTRAR"} name="Gestión Transaccional" />,
    component: GestionTransaccional,
    permission: [
      63,
      53,
      ...listPermissionsTuLlaveAdmin,
      ...listPermissionsGestionAval,
      ...listPermissionsGestionAgrario,
    ],
    subRoutes: [
      {
        link: "/GestionTransaccional/AnulacionesPinesCRC",
        label: (
          <AppIcons Logo={"PINES_ADMINISTRAR"} name={"Anulaciones Pines CRC"} />
        ),
        component: AnulacionesPinesCRC,
        permission: [63],
        subRoutes: [
          {
            link: "/GestionTransaccional/AnulacionesPinesCRC/CargueArchivo",
            label: (
              <AppIcons Logo={"CARGAR"} name={"Cargue Archivo Anulaciones"} />
            ),
            component: CargueAnulacionesPinesCRC,
            permission: [63],
          },
          {
            link: "/GestionTransaccional/AnulacionesPinesCRC/DescargarPeticiones",
            label: (
              <AppIcons
                Logo={"DESCARGAR"}
                name={"Descarga Archivo Peticiones"}
              />
            ),
            component: DescargaPeticionesPinesCRC,
            permission: [63],
          },
          {
            link: "/GestionTransaccional/AnulacionesPinesCRC/Historico",
            label: (
              <AppIcons Logo={"DESCARGAR"} name={"Histórico Anulaciones"} />
            ),
            component: HistoricoAnulacionesPinesCRC,
            permission: [63],
          },
        ],
      },
      rutasGestionColpatria,
      rutasGestionRecargasTullave,
      rutasGestionGrupoAval,
      rutasGestionAgrario,
    ],
  },
  {
    link: "/loteria",
    label: <AppIcons Logo={"LOTERIA"} name="Lotería" />,
    component: LoteriaBog,
    provider: ProvideLoteria,
    permission: [3, 4, 5, 6, 44, 45, 46, 47, 95],
    subRoutes: [
      {
        link: "loteria-de-bogota",
        label: "Lotería de Bogotá",
        logo: "LOTERIA_BOGOTA",
        permission: [3, 4, 5, 6],
      },
      {
        link: "loteria-del-tolima",
        label: "Lotería del Tolima",
        logo: "LOTERIA_TOLIMA",
        permission: [44, 45, 46, 47],
      },
      {
        link: "loteria-de-cundinamarca",
        label: "Lotería de Cundinamarca",
        logo: "LOTERIA_CUNDINAMARCA",
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
          label: <AppIcons Logo={"LOTERIA_VENTAS"} name="Ventas" />,
          component: venta,
          permission: [3, 44, 95],
        },
        {
          link: `/loteria/${name}/cargar`,
          label: (
            <AppIcons
              Logo={"LOTERIA_CARGA_ARCHIVOS"}
              name="Carga de archivos"
            />
          ),
          component: CargaArchivos,
          permission: [4],
        },
        {
          link: `/loteria/${name}/historico_cargues`,
          label: (
            <AppIcons
              Logo={"LOTERIA_HISTORICO_CARGUE_ARCHIVOS"}
              name="Histórico cargues de archivos"
            />
          ),
          component: HistoricoCargues,
          extern: false,
          permission: [3, 44, 95], ///////////////////////////////////////////////////////////////////
        },
        {
          link: `/loteria/${name}/sorteos`,
          label: <AppIcons Logo={"LOTERIA_SORTEOS"} name="Sorteos" />,
          component: Sorteos,
          permission: [5, 6],
          subRoutes: [
            {
              link: `/loteria/${name}/sorteos/tramitarSorteos`,
              label: <AppIcons Logo={"LOTERIA_SORTEOS"} name="Sorteos" />,
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
          link: `/loteria/${name}/descargarArchivos`,
          label: (
            <AppIcons
              Logo={"LOTERIA_DESCARGA_DE_ARCHIVOS"}
              name="Descarga de archivos"
            />
          ),
          component: DownloadArchivos,
          permission: [6],
          subRoutes: [
            {
              link: `/loteria/${name}/descargarArchivos/descarga_reportes`,
              label: <AppIcons Logo={"DESCARGAR"} name="Archivos de ventas" />,
              component: DescargarArchivosS3,
              permission: [6],
            },
            {
              link: `/loteria/${name}/descargarArchivos/descarga_reportes_pagoPremios`,
              label: (
                <AppIcons
                  Logo={"DESCARGAR"}
                  name="Archivos de pago de premios"
                />
              ),
              component: ArchivosPagoPremios,
              permission: [6],
            },
          ],
        },
        {
          link: `/loteria/${name}/premios`,
          label: <AppIcons Logo={"LOTERIA_PREMIOS"} name="Pago de premios" />,
          component: PagoDePremios,
          extern: false,
          permission: [3, 6, 44, 95],
          subRoutes: [
            {
              link: `/loteria/${name}/premios/Pagopremios`,
              label: <AppIcons Logo={"LOTERIA_PREMIOS"} name="Premios" />,
              component: Premios,
              permission: [3, 44, 95],
            },
            {
              link: `/loteria/${name}/premios/HistoricoPagopremios`,
              label: (
                <AppIcons Logo={"REPORTE"} name="Histórico pago de premios" />
              ),
              component: HistoricoPagoPremios,
              permission: [6],
            },
          ],
        },
        {
          link: `/loteria/${name}/inventario`,
          label: (
            <AppIcons
              Logo={"LOTERIA_INVENTARIO_BILLETES"}
              name="Inventario Billetes"
            />
          ),
          component: Inventario,
          extern: false,
          permission: [3, 6, 44, 95], ///////////////////////////////////////////////////////////////////
          subRoutes: [
            {
              link: `/loteria/${name}/arqueo`,
              label: (
                <AppIcons
                  Logo={"LOTERIA_ARQUEO_BILLETES"}
                  name="Arqueo Billetes"
                />
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
    // label: <AppIcons Logo={"MARKETPLACE"} name="Transacciones" />,
    label: <AppIcons Logo={"TRANSACCIONES"} name="Transacciones" />,
    component: Transacciones,
    permission: [8],
  },
  rutasIAM,
  // {
  //   link: "/update-commerce",
  //   label: (
  //     <AppIcons Logo={"ACTUALIZACION_DATOS"} name="Actualizacion de datos" />
  //   ),
  //   component: FormCommerce,
  //   permission: [7],
  // },
  // {
  //   link: "/review-commerce-forms",
  //   label: (
  //     <AppIcons
  //       Logo={"ACTUALIZACION_DATOS"}
  //       name="Revisar actualizacion de datos"
  //     />
  //   ),
  //   component: CommerceInfo,
  //   permission: [9],
  // },
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
  rutasFundacionMujer,
  {
    link: "/Pines",
    label: <AppIcons Logo={"PINES"} name="Pines" />,
    component: PinesVus,
    permission: [
      enumPermisosPinesVus.administrarPinesVus,
      enumPermisosPinesVus.operarPinesVus,
      enumPermisosPractisistemas.practisistemasPines,
      ...listPermissionsPinesCrc,
    ],
    provider: ProvidepinesVus,
    subRoutes: [
      rutasPines,
      rutasPinesVus,
      rutasPinesCrc,
      {
        link: "/Pines/Combinados",
        label: <AppIcons Logo={"PINES"} name={"Pines Combinados"} />,
        component: PinesCombinados,
        permission: [enumPermisosPinesVus.operarPinesVus],
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
        label: <AppIcons Logo={"RECAUDO_MANUAL"} name={"Recaudo manual"} />,
        component: RecaudoManual,
        permission: [22],
      },
      {
        link: "/recaudo/codigo",
        label: (
          <AppIcons
            Logo={"RECAUDO_CODIGO_DE_BARRAS"}
            name={"Recaudo codigo de barras"}
          />
        ),
        component: RecaudoCodigo,
        permission: [23],
      },
    ],
  },
  {
    link: "/cupo",
    label: <AppIcons Logo={"DETALLES_CUPO"} name={"Detalles Cupo"} />,
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
        link: "/cupo/ajuste-deuda-cupo",
        label: <AppIcons Logo={"RECAUDO"} name={"Ajuste deuda cupo"} />,
        component: AjusteCupo,
        permission: [59],
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
        label: <AppIcons Logo={"RECAUDO"} name={"Modificación cupo"} />,
        component: ModifiCupo,
        permission: [60],
      },
      {
        link: "/cupo/detalle-modificacion-cupo",
        label: <AppIcons Logo={"RECAUDO"} name={"Detalle modificación cupo"} />,
        component: DetalleModificacionCupo,
        permission: [1],
      },
      {
        link: "/cupo/tipos-movimientos-cupo",
        label: <AppIcons Logo={"RECAUDO"} name={"Tipos de movimientos cupo"} />,
        component: TipoMovimientoCupo,
        permission: [64],
      },
    ],
  },
  {
    link: "/daviplata",
    label: <AppIcons Logo={"DAVIPLATA"} name="DaviPlata" />,
    component: Daviplata,
    permission: [53],
    subRoutes: [
      {
        link: "/daviplata/depositos",
        label: (
          <AppIcons Logo={"DAVIPLATA_DEPOSITO"} name="Depósito DaviPlata" />
        ),
        component: Deposito,
        permission: [53],
      },
      {
        link: "/daviplata/retiros",
        label: <AppIcons Logo={"DAVIPLATA_RETIRO"} name="Retiro DaviPlata" />,
        component: Retiro,
        permission: [53],
      },
    ],
  },
  {
    link: "/corresponsalia",
    label: <AppIcons Logo={"CORRESPONSALIA"} name="Corresponsalía" />,
    component: Corresponsalia,
    permission: [
      ...listPermissionsColpatria,
      ...listPermissionsDavivienda,
      ...listPermissionsAval,
      ...listPermissionsAgrario,
      ...listPermissionsRecaudoMultiple,
    ],
    subRoutes: [
      rutasDaviviendaCB,
      rutasAvalCB,
      rutasAgrarioCB,
      rutasColpatria,
      rutasRecaudoMultiple,
    ],
  },
  {
    link: "/recaudoEmpresarial",
    label: <AppIcons Logo={"RECAUDO"} name="Recaudo Empresarial" />,
    component: RecaudoEmpresarial,
    permission: [
      54,
      ...listPermissionsColpatria,
      ...listPermissionsDavivienda,
      ...listPermissionsAval,
      ...listPermissionsAgrario,
    ],
    subRoutes: [
      rutasBancolombiaRecaudoEmpresarial,
      rutasDaviviendaRecaudoEmpresarial,
    ],
  },

  {
    link: "/API_SMS",
    label: <AppIcons Logo={"SMS"} name="SMS" />,
    component: API_SMS,
    permission: [25],
    subRoutes: [
      {
        link: "/API_SMS/EnviarSMS",
        label: <AppIcons Logo={"SMS_ENVIO_DE_MENSAJE"} name="Enviar SMS" />,
        component: EnviarSMS,
        permission: [25],
      },
      {
        link: "/API_SMS/crearSMS",
        label: <AppIcons Logo={"SMS_CREAR"} name="Crear SMS" />,
        component: CrearSMS,
        permission: [26],
      },
      {
        link: "/API_SMS/reporteSMS",
        label: <AppIcons Logo={"SMS_REPORTE"} name="Reporte" />,
        component: reporteSMS,
        permission: [26],
      },
      {
        link: "/API_SMS/BloquearNum",
        label: (
          <AppIcons Logo={"SMS_BLOQUEO_DE_NUMEROS"} name="Bloqueo de números" />
        ),
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

  //Modulo Telefonia Movil
  RoutesTelefoniaMovil,

  //Modulo RecargasCelular
  {
    link: "/recargas-celular",
    label: <AppIcons Logo={"RECARGA_CELULAR"} name="Recargas Celular" />,
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
              <AppIcons Logo={"MOVISTAR_RECARGAS"} name="Recargas Movistar " />
            ),
            component: RecargasMovistar,
            permission: [65],
          },
          {
            link: "/movistar/paquetes-movistar",
            label: (
              <AppIcons Logo={"MOVISTAR_PAQUETES"} name="Paquetes Movistar " />
            ),
            component: PaquetesMovistar,
            permission: [65],
            subRoutes: [
              {
                link: "/movistar/paquetes-movistar/combo",
                label: <AppIcons Logo={"MOVISTAR_COMBOS"} name="Combos" />,
                component: SubPaquetesMovistar,
                permission: [65],
              },
              {
                link: "/movistar/paquetes-movistar/paquete-voz",
                label: (
                  <AppIcons
                    Logo={"MOVISTAR_PAQUETE_VOZ"}
                    name="Paquete de Voz"
                  />
                ),
                component: SubPaquetesMovistar,
                permission: [65],
              },
              {
                link: "/movistar/paquetes-movistar/paquete-datos",
                label: (
                  <AppIcons
                    Logo={"MOVISTAR_PAQUETES_DATOS"}
                    name="Paquete de Datos"
                  />
                ),
                component: SubPaquetesMovistar,
                permission: [65],
              },
              {
                link: "/movistar/paquetes-movistar/prepagada",
                label: (
                  <AppIcons Logo={"MOVISTAR_TV_PREPAGADA"} name="Prepagada" />
                ),
                component: SubPaquetesMovistar,
                permission: [65],
              },
            ],
          },
          {
            link: "/movistar/operador-pdp",
            label: (
              <AppIcons Logo={"MOVISTAR_OPERADOR_PDP"} name="Operador PDP" />
            ),
            component: OperadorPDPMovistar,
            permission: [66],
            subRoutes: [
              {
                link: "/movistar/operador-pdp/cargar-paquetes",
                label: (
                  <AppIcons
                    Logo={"MOVISTAR_CARGUE_DE_PAQUETES"}
                    name="Cargue de paquetes de movistar"
                  />
                ),
                component: CargarPaquetesMovistar,
                permission: [66],
              },
              {
                link: "/movistar/operador-pdp/concilacion",
                label: (
                  <AppIcons
                    Logo={"MOVISTAR_CONCILIACION"}
                    name="Conciliación"
                  />
                ),
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
  // rutasRecargas,
  rutasMovii,
  {
    link: "/colpensiones",
    label: <AppIcons Logo={"COLPENSIONES"} name={"Colpensiones"} />,
    component: Domiciliacion,
    permission: [55, 56, 57],
    subRoutes: [
      {
        link: "/colpensiones/domiciliacion",
        label: <AppIcons Logo={"RECAUDO"} name={"Domiciliación"} />,
        component: moduloDomiciliacion,
        permission: [56, 57],
        subRoutes: [
          {
            link: "/colpensiones/formulario",
            label: (
              <AppIcons Logo={"RECAUDO"} name={"Formulario Domiciliación"} />
            ),
            component: comprobarEmail,
            permission: [55],
          },
          {
            link: "/colpensiones/modificar",
            label: <AppIcons Logo={"RECAUDO"} name={"Modificar"} />,
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
        label: <AppIcons Logo={"RECAUDO"} name={"Voluntario a Demanda"} />,
        component: PpsVoluntarioDemanda,
        permission: [56],
        show: false,
      },
      {
        link: "/colpensiones/ppspordemanda",
        label: <AppIcons Logo={"RECAUDO"} name={"PPS Demanda"} />,
        component: BuscarCedulaPpsADemanda,
        permission: [57],
      },
    ],
  },

  // {
  //   link: "/recaudo-integrado",
  //   label: <AppIcons Logo={"RECAUDO"} name={"Recaudo Integrado"} />,
  //   component: RecaudoIntegrado,
  //   permission: [55, 56, 57],
  //   subRoutes: [
  //     {
  //       link: "/recaudo-integrado/davivienda",
  //       label: <AppIcons Logo={"RETIRO"} name={"Davivienda"} />,
  //       component: RecaudoDavivienda,
  //       permission: [56, 57],
  //       subRoutes: [
  //         {
  //           link: "/recaudo-integrado/davivienda/cargar",
  //           label: <AppIcons Logo={"IMPUESTO"} name={"Cargar Archivos"} />,
  //           component: cargarArchivos,
  //           permission: [55],
  //         },
  //         {
  //           link: "/recaudo-integrado/davivienda/historicocontingencia",
  //           label: (
  //             <AppIcons Logo={"IMPUESTO"} name={"Histórico de contingencia"} />
  //           ),
  //           component: HistoricoContingenciaDavivienda,
  //           permission: [55],
  //         },
  //         {
  //           link: "/recaudo-integrado/davivienda/transacciones",
  //           label: <AppIcons Logo={"IMPUESTO"} name={"Transacciones"} />,
  //           component: TransaccionesDavivienda,
  //           permission: [55],
  //         },
  //       ],
  //     },
  //     //--------------------
  //     {
  //       link: "/recaudo-integrado/bancolombia",
  //       label: <AppIcons Logo={"RETIRO"} name={"Bancolombia"} />,
  //       component: RecaudoBancolombia,
  //       permission: [56, 57],
  //       subRoutes: [
  //         {
  //           link: "/recaudo-integrado/bancolombia/cargar",
  //           label: <AppIcons Logo={"IMPUESTO"} name={"Cargar Archivos"} />,
  //           component: cargarArchivosBancolombia,
  //           permission: [55],
  //         },
  //         {
  //           link: "/recaudo-integrado/bancolombia/historicocontingencia",
  //           label: (
  //             <AppIcons Logo={"IMPUESTO"} name={"Histórico de contingencia"} />
  //           ),
  //           component: HistoricoContingenciaBancolombia,
  //           permission: [55],
  //         },
  //         {
  //           link: "/recaudo-integrado/bancolombia/transacciones",
  //           label: <AppIcons Logo={"IMPUESTO"} name={"Transacciones"} />,
  //           component: TransaccionesBancolombia,
  //           permission: [55],
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   link: "/pagos-ifood",
  //   label: <AppIcons Logo={"RECAUDO"} name={"Aportes en Linea iFood"} />,
  //   component: iFoodAportes,
  //   permission: [1],
  // },
  // rutasSoat,
  rutasApuestas,
  rutasRecaudoDirecto,
  rutasRecargasTullave,
  rutasPowwi,

  //Modulo Almaseg
  routesAlmaseg,
  //Modulo Emcali
  routesEmcali,
  routesOtrasEntidades,
  //Modulo Moviliza
  rutasMoviliza,
  //Modulo Recarga Cupo
  routesRecargaCupo,
  //Modulo Nequi
  rutasCorresponsaliaNequi,
];

export { allUrlsPrivateApps };
