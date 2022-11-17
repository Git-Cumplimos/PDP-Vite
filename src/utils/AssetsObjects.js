const urlAssets = process.env.REACT_APP_ASSETS_URL;

const images = {
  SOIBANNERPAGINA: `${urlAssets}/assets/img/SOI-BANNERPAGINA.jpg`,
  SOATBANNERPAG: `${urlAssets}/assets/img/SOATBANNERPAG.jpg`,
  FUNDACIONBANNERPAG: `${urlAssets}/assets/img/FUNDACIONBANNERPAG.jpg`,
  COLPENSIONES: `${urlAssets}/assets/img/COLPENSIONES-BANNER.jpg`,
  SERVICIOS: `${urlAssets}/assets/img/BANNER SERVICIOS.jpg`,
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
  ACTUALIZACION: `${urlAssets}/assets/svg/ActualizacionDeDatos.svg`,
  backIcon2: `${urlAssets}/assets/svg/back-icon-2.svg`,
  backIconSecondary: `${urlAssets}/assets/svg/back-icon-secondary.svg`,
  backIcon: `${urlAssets}/assets/svg/back-icon.svg`,
  bar: `${urlAssets}/assets/svg/bar.svg`,
  BarThin: `${urlAssets}/assets/svg/BarThin.svg`,
  //LOTERIA
  Loteria: `${urlAssets}/assets/img/LOTERIA.png`,
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
  SUSER: `${urlAssets}/assets/svg/SUSER-01.svg`,

  //MOVISTAR
  MOVISTAR: `${urlAssets}/assets/svg/movistar/MOVISTAR_PRINCIPAL.svg`,
  RECARGASMOVISTAR: `${urlAssets}/assets/svg/movistar/MOVISTAR_RECARGAS.svg`,
  PAQUETESMOVISTAR: `${urlAssets}/assets/svg/movistar/MOVISTAR_PAQUETES.svg`,

  // Recaudo
  CATALOGOS_Y_REVISTAS: `${urlAssets}/assets/svg/recaudo/CATALOGOS&REVISTAS.svg`,
  EPS_Y_SALUD: `${urlAssets}/assets/svg/recaudo/EPS&SALUD.svg`,
  IMPUESTO: `${urlAssets}/assets/svg/recaudo/IMPUESTO.svg`,
  PAGO_DE_SEGURIDAD_SOCIAL: `${urlAssets}/assets/svg/recaudo/PAGO_DE_SEGURIDAD_SOCIAL.svg`,
  PRODUCTOS_FINANCIEROS: `${urlAssets}/assets/svg/recaudo/PRODUCTOS_FINANCIEROS.svg`,
  RECAUDO: `${urlAssets}/assets/svg/recaudo/RECAUDO.svg`,
  RETIRO: `${urlAssets}/assets/svg/recaudo/RETIRO.svg`,
  SERVICIOS_PUBLICOS: `${urlAssets}/assets/svg/recaudo/SERVICIOS_PUBLICOS.svg`,
  UNIVERSIDADES: `${urlAssets}/assets/svg/recaudo/UNIVERSIDADES.svg`,

  //PINES VUS
  CrearPines: `${urlAssets}/assets/img/CREAR PINES.png`,
  PagoParticipacion: `${urlAssets}/assets/img/pago participacion.png`,
  ReportePines: `${urlAssets}/assets/img/reporte pines.png`,
  TramitarPines: `${urlAssets}/assets/img/TRAMITAR PINES.png`,
  
  CorresponsalBancario: `${urlAssets}/assets/img/CORRESPONSAL BANCARIO.png`,
  Corresponsalia: `${urlAssets}/assets/img/CORRESPONSALIA.png`,
  Daviplata: `${urlAssets}/assets/img/DAVIPLATA.png`,
  DepositoDaviplata: `${urlAssets}/assets/img/DEPÓSITO DAVIPLATA.png`,
  Depositos: `${urlAssets}/assets/img/DEPÓSITOS.png`,
  DescargarReporte: `${urlAssets}/assets/img/descargar reporte.png`,
  Desembolso: `${urlAssets}/assets/img/DESEMBOLSO.png`,
  Fundacion: `${urlAssets}/assets/img/FUNDACION.jpg`,
  
  OperadorPdp: `${urlAssets}/assets/img/operador pdp.png`,  
  PagoPorGiro: `${urlAssets}/assets/img/PAGO POR GIRO.png`,
  PagoProductosPropios: `${urlAssets}/assets/img/PAGO PRODUCTOS PROPIOS.png`,
  PinesEntretenimiento: `${urlAssets}/assets/img/pines entretenimiento.png`,

  RecargaCelular: `${urlAssets}/assets/img/RecargasCelular.png`,
  RecaudoCodigoDeBarras: `${urlAssets}/assets/img/recaudo codigo de barras.png`,
  RecaudoManual: `${urlAssets}/assets/img/RECAUDO MANUAL.png`,
  Recaudo: `${urlAssets}/assets/img/RECAUDO.png`,
  
  Reporte: `${urlAssets}/assets/img/REPORTE.png`,
  RetiroDaviplata: `${urlAssets}/assets/img/RETIRO DAVIPLATA.png`,
  Retiro: `${urlAssets}/assets/img/RETIRO.png`,
  RetirosYDepositos: `${urlAssets}/assets/img/RETIROS Y DEPÓSITOS.png`,
  Reverso: `${urlAssets}/assets/img/REVERSO.png`,
  ServiciosPublicos: `${urlAssets}/assets/img/servicios publicos.jpg`,

  
  Transacciones: `${urlAssets}/assets/img/transacciones.png`,

  VerPagoParticipacion: `${urlAssets}/assets/img/VER PAGO PARTICIPACION-01.png`,
  CorresponsaliaDavivienda: `${urlAssets}/assets/svg/CORRESPOSALIA DAVIVIENDA-01.svg`,
  LogoRecargasCelular: `${urlAssets}/assets/img/RecargasCelular.png`,
};

export { images, svgs };
