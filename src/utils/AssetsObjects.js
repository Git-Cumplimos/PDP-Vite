const urlAssets = process.env.REACT_APP_ASSETS_URL;

const images = {
  pdpHorizontal: `${urlAssets}/assets/img/LogofinalPDP.svg`,
  Loteria_de_Bogota: `${urlAssets}/assets/img/Loteria_de_Bogota.png`,
  personas: `${urlAssets}/assets/img/personas.png`,
  PINVUS: `${urlAssets}/assets/img/LogoPinVus.jpg`,
  MiLicencia: `${urlAssets}/assets/img/logo-milicencia.jpg`,
  LogoOccidente: `${urlAssets}/assets/img/banco-de-occidente.png`,
  ScotiabankColpatria: `${urlAssets}/assets/img/ScotiabankColpatria.webp`,
  LogoAgrario: `${urlAssets}/assets/img/Banco-agrario.jpg`,
};

const svgs = {
  // ACTUALIZACION: `${urlAssets}/assets/svg/ActualizacionDeDatos.svg`,
  ACTUALIZACION: `${urlAssets}/assets/svg/recaudo/ACTUALIZACIONDATOS.svg`,
  backIcon2: `${urlAssets}/assets/svg/back-icon-2.svg`,
  backIconSecondary: `${urlAssets}/assets/svg/back-icon-secondary.svg`,
  backIcon: `${urlAssets}/assets/svg/back-icon.svg`,
  bar: `${urlAssets}/assets/svg/bar.svg`,
  BarThin: `${urlAssets}/assets/svg/BarThin.svg`,
  //LOTERIA
  // Loteria: `${urlAssets}/assets/img/LOTERIA.png`,
  Loteria: `${urlAssets}/assets/svg/recaudo/LOTERIAS.svg`,
  LoteriaBogota: `${urlAssets}/assets/img/loteria bogota.png`,
  LoteriaTolima: `${urlAssets}/assets/img/loteria tolima.png`,
  Ventas: `${urlAssets}/assets/img/ventas.png`,
  CARGAR: `${urlAssets}/assets/svg/CARGAR.svg`,
  DESCARGAR: `${urlAssets}/assets/svg/DESCARGAR.svg`,
  SORTEO01: `${urlAssets}/assets/img/SORTEO-01.png`,
  ArqueoBilletes: `${urlAssets}/assets/img/arqueo de billetes.png`,
  Premio: `${urlAssets}/assets/img/premio.png`,

  MARKETPLACE: `${urlAssets}/assets/svg/MARKETPLACE-01.svg`,
  PAGO: `${urlAssets}/assets/svg/PAGO-01.svg`,
  REPORTE: `${urlAssets}/assets/svg/REPORTES-01.svg`,
  right_arrow: `${urlAssets}/assets/svg/right-arrow.svg`,
  // SUSER: `${urlAssets}/assets/svg/SUSER-01.svg`,
  SUSER: `${urlAssets}/assets/svg/recaudo/SUSER.svg`,

  //MOVISTAR
  // MOVISTAR: `${urlAssets}/assets/svg/movistar/MOVISTAR_PRINCIPAL.svg`,
  MOVISTAR: `${urlAssets}/assets/svg/recaudo/MOVISTAR.svg`,
  // RECARGASMOVISTAR: `${urlAssets}/assets/svg/movistar/MOVISTAR_RECARGAS.svg`,
  RECARGASMOVISTAR: `${urlAssets}/assets/svg/recaudo/MOVISTARRECARGAS.svg`,
  // PAQUETESMOVISTAR: `${urlAssets}/assets/svg/movistar/MOVISTAR_PAQUETES.svg`,
  PAQUETESMOVISTAR: `${urlAssets}/assets/svg/recaudo/PAQUETESMOVISTAR.svg`,
  OPERADORPDPMOVISTAR: `${urlAssets}/assets/svg/recaudo/OPERADORPDPMOVISTAR.svg`,
  COMBOS: `${urlAssets}/assets/svg/recaudo/COMBOS.svg`,
  PAQUETEDATOS: `${urlAssets}/assets/svg/recaudo/PAQUETEDEDATOS.svg`,
  PAQUETEVOZ: `${urlAssets}/assets/svg/recaudo/PAQUETESVOZ.svg`,
  PREPAGADA: `${urlAssets}/assets/svg/recaudo/TVPREPAGADA.svg`,

  // Recaudo
  CATALOGOS_Y_REVISTAS: `${urlAssets}/assets/svg/recaudo/CATALOGOS&REVISTAS.svg`,
  EPS_Y_SALUD: `${urlAssets}/assets/svg/recaudo/EPS&SALUD.svg`,
  IMPUESTO: `${urlAssets}/assets/svg/recaudo/IMPUESTO.svg`,
  PAGO_DE_SEGURIDAD_SOCIAL: `${urlAssets}/assets/svg/recaudo/PAGO_DE_SEGURIDAD_SOCIAL.svg`,
  PRODUCTOS_FINANCIEROS: `${urlAssets}/assets/svg/recaudo/PRODUCTOS_FINANCIEROS.svg`,
  RECAUDO: `${urlAssets}/assets/svg/recaudo/RECAUDOS.svg`,
  RETIRO: `${urlAssets}/assets/svg/recaudo/RETIRO.svg`,
  SERVICIOS_PUBLICOS: `${urlAssets}/assets/svg/recaudo/SERVICIOS_PUBLICOS.svg`,
  UNIVERSIDADES: `${urlAssets}/assets/svg/recaudo/UNIVERSIDADES.svg`,

  //IAM
  IAM: `${urlAssets}/assets/svg/recaudo/IAM.svg`,

  //TRANSACCIONES
  TRANSACCIONES: `${urlAssets}/assets/svg/recaudo/Transacciones.svg`,

  //DETALLES CUPO
  DETALLES_CUPO: `${urlAssets}/assets/svg/recaudo/DETALLECUPO.svg`,

  //COLPENSIONES
  COLPENSIONES: `${urlAssets}/assets/svg/recaudo/COLPENSIONES.svg`,

  //VENTA SEGUROS SOAT
  VENTA_SEGUROS: `${urlAssets}/assets/svg/recaudo/VENTADESEGUROS.svg`,

  //PARAMETROS TRANSACCIONALES
  PARAMETROS_TRANSACCIONALES: `${urlAssets}/assets/svg/recaudo/PARAMETROSTRANSACCIONALES.svg`,

  //RECAUDO RETIRO DIRECTO
  RECAUDO_RETIRO_DIRECTO: `${urlAssets}/assets/svg/recaudo/RECAUDORETIRODIRECTO.svg`,

  //SMS
  SMS: `${urlAssets}/assets/svg/recaudo/SMS.svg`,

  //Movii
  MOVII: `${urlAssets}/assets/svg/recaudo/MOVII.svg`,
  MoviiRetiro: `${urlAssets}/assets/svg/recaudo/RETIROMOVII.svg`,
  MoviiReverso: `${urlAssets}/assets/svg/recaudo/REVERSOMOVII.svg`,

  //MARKETPLACE
  MarketPlace: `${urlAssets}/assets/svg/recaudo/MARKETPLACE.svg`,

  // FUNDACION DE LA MUJER
  Fundacion: `${urlAssets}/assets/svg/recaudo/FUNDACIONMUJER.svg`,
  FundacionRecaudo: `${urlAssets}/assets/svg/recaudo/RECAUDOFUNDACIONMUJER.svg`,
  FundacionDesembolso: `${urlAssets}/assets/svg/recaudo/DESEMBOLSOFUNDACION.svg`,
  FundacionReversoManual: `${urlAssets}/assets/svg/recaudo/RESVERSOMANUAL.svg`,
  FundacionReporte: `${urlAssets}/assets/svg/recaudo/REPORTEFUNDACIONMUJER.svg`,
  //PINES VUS
  // CrearPines: `${urlAssets}/assets/img/CREAR PINES.png`,
  CrearPines: `${urlAssets}/assets/svg/recaudo/PINES.svg`,
  PagoParticipacion: `${urlAssets}/assets/img/pago participacion.png`,
  ReportePines: `${urlAssets}/assets/img/reporte pines.png`,
  TramitarPines: `${urlAssets}/assets/img/TRAMITAR PINES.png`,

  //COLPATRIA
  CorresponsaliaColpatria: `${urlAssets}/assets/svg/recaudo/COLPATRIACORRESPONSAL.svg`,
  PinPagoColpatria: `${urlAssets}/assets/svg/recaudo/COLPATRIAPINDEPAGO.svg`,
  VentaPinRecaudoColpatria: `${urlAssets}/assets/svg/recaudo/COLPATRIAVENTAPINDERECAUDO.svg`,
  RetiroPinColpatria: `${urlAssets}/assets/svg/recaudo/COLPATRIARETIROCONPIN.svg`,
  RecaudoServiciosPubPrivados: `${urlAssets}/assets/svg/recaudo/COLPATRIARECAUDOSERVICIOSPUBLICOSYPRIVADOS.svg`,
  RecaudoManualColpatria: `${urlAssets}/assets/svg/recaudo/COLPATRIARECAUDOMANUAL.svg`,
  RecaudoCodigoBarrasColpatria: `${urlAssets}/assets/svg/recaudo/COLPATRIARECAUDOCODIGODEBARRAS.svg`,

  CorresponsalBancario: `${urlAssets}/assets/img/CORRESPONSAL BANCARIO.png`,
  // Corresponsalia: `${urlAssets}/assets/img/CORRESPONSALIA.png`,
  Corresponsalia: `${urlAssets}/assets/svg/recaudo/PROXIMAMENTECOLPA.svg`,
  // Daviplata: `${urlAssets}/assets/img/DAVIPLATA.png`,
  Daviplata: `${urlAssets}/assets/svg/recaudo/DAVIPLATA.svg`,
  DepositoDaviplata: `${urlAssets}/assets/svg/recaudo/DEPOSITODAVIPLATA.svg`,
  Depositos: `${urlAssets}/assets/img/DEPÓSITOS.png`,
  DescargarReporte: `${urlAssets}/assets/img/descargar reporte.png`,
  Desembolso: `${urlAssets}/assets/img/DESEMBOLSO.png`,
  // Fundacion: `${urlAssets}/assets/img/FUNDACION.jpg`,

  OperadorPdp: `${urlAssets}/assets/img/operador pdp.png`,
  // PagoPorGiro: `${urlAssets}/assets/img/PAGO POR GIRO.png`,
  PagoPorGiro: `${urlAssets}/assets/svg/recaudo/PAGOPORGIRO.svg`,
  RecaudoServiciosPublicosDavivienda: `${urlAssets}/assets/svg/recaudo/RECAUDOSERVICIOSPUBLICOSDAVIVIENDA.svg`,
  // PagoProductosPropios: `${urlAssets}/assets/img/PAGO PRODUCTOS PROPIOS.png`,
  PagoProductosPropios: `${urlAssets}/assets/svg/recaudo/PAGODEPRODUCTOSPROPIOS.svg`,
  PinesEntretenimiento: `${urlAssets}/assets/img/pines entretenimiento.png`,

  // RecargaCelular: `${urlAssets}/assets/img/RecargasCelular.png`,
  RecargaCelular: `${urlAssets}/assets/svg/recaudo/RECARGASCELULAR.svg`,
  RecaudoCodigoDeBarras: `${urlAssets}/assets/img/recaudo codigo de barras.png`,
  RecaudoManual: `${urlAssets}/assets/img/RECAUDO MANUAL.png`,
  Recaudo: `${urlAssets}/assets/img/RECAUDO.png`,

  Reporte: `${urlAssets}/assets/img/REPORTE.png`,
  RetiroDaviplata: `${urlAssets}/assets/svg/recaudo/RETIRODAVIPLATA.svg`,
  Retiro: `${urlAssets}/assets/svg/recaudo/RETIRODAVIPLATA.svg`,
  RetirosYDepositos: `${urlAssets}/assets/img/RETIROS Y DEPÓSITOS.png`,
  Reverso: `${urlAssets}/assets/img/REVERSO.png`,
  ServiciosPublicos: `${urlAssets}/assets/img/servicios publicos.jpg`,

  Transacciones: `${urlAssets}/assets/img/transacciones.png`,

  VerPagoParticipacion: `${urlAssets}/assets/img/VER PAGO PARTICIPACION-01.png`,
  // CorresponsaliaDavivienda: `${urlAssets}/assets/svg/CORRESPOSALIA DAVIVIENDA-01.svg`,
  CorresponsaliaDavivienda: `${urlAssets}/assets/svg/recaudo/CORRESPONSALDAVIVIENDA.svg`,
  LogoRecargasCelular: `${urlAssets}/assets/img/RecargasCelular.png`,
};

const banners = {
  // MOVISTAR: `${urlAssets}/assets/img/banners/movistar_min.jpg`,
  // SOI: `${urlAssets}/assets/img/banners/SOI_BANNER.jpg`,
  // FUNDACION_DE_LA_MUJER: `${urlAssets}/assets/img/banners/FUNDACION_BANNER.png`,
  // CORRESPONSAL: `${urlAssets}/assets/img/banners/CORRESPONSAL_banner.jpg`,
  BANNER_1: `${urlAssets}/assets/img/banners/BANNER_1.jpg`,
  BANNER_2: `${urlAssets}/assets/img/banners/BANNER_2.jpg`,
  BANNER_3: `${urlAssets}/assets/img/banners/BANNER_3.jpg`,
  BANNER_4: `${urlAssets}/assets/img/banners/BANNER_4.jpg`,
  BANNER_5: `${urlAssets}/assets/img/banners/BANNER_5.jpg`,
};

export { images, svgs, banners };
