const urlAssets = process.env.REACT_APP_ASSETS_URL;

const images = {
  pdpHorizontal: `${urlAssets}/assets/img/LogofinalPDP.svg`,
  Loteria_de_Bogota: `${urlAssets}/assets/img/Logo_lot_Bogota.png`,
  Loteria_de_Tolima: `${urlAssets}/assets/img/Logo_lot_Tolima.jpg`,
  Loteria_de_Cundinamarca: `${urlAssets}/assets/img/Logo_lot_Cundi.png`,
  personas: `${urlAssets}/assets/img/personas.png`,
  PINVUS: `${urlAssets}/assets/img/LogoPinVus.jpg`,
  MiLicencia: `${urlAssets}/assets/img/logo-milicencia.jpg`,
  LogoOccidente: `${urlAssets}/assets/img/banco-de-occidente.png`,
  LogoDale: `${urlAssets}/assets/img/Logo-Dale.png`,
  ScotiabankColpatria: `${urlAssets}/assets/img/ScotiabankColpatria.webp`,
  LogoAgrario: `${urlAssets}/assets/img/Banco-agrario.jpg`,
  LogoPowwi: `${urlAssets}/assets/img/LogoPowwi.png`,
  LogoEmcali: `${urlAssets}/assets/img/LogoEmcali.png`,
};

const svgs = {
  backIcon2: `${urlAssets}/assets/svg/back-icon-2.svg`,
  backIconSecondary: `${urlAssets}/assets/svg/back-icon-secondary.svg`,
  backIcon: `${urlAssets}/assets/svg/back-icon.svg`,
  bar: `${urlAssets}/assets/svg/bar.svg`,
  BarThin: `${urlAssets}/assets/svg/BarThin.svg`,
  PAGO: `${urlAssets}/assets/svg/PAGO-01.svg`,
  REPORTE: `${urlAssets}/assets/svg/REPORTES-01.svg`,
  right_arrow: `${urlAssets}/assets/svg/right-arrow.svg`,

  //SUSER
  SUSER: `${urlAssets}/assets/svg/recaudo/SUSER/SUSER.svg`,

  //LOTERIA
  LOTERIA: `${urlAssets}/assets/svg/recaudo/LOTERIA/LOTERIA.svg`,
  LOTERIA_BOGOTA: `${urlAssets}/assets/svg/recaudo/LOTERIA/LOTERIA_BOGOTA.svg`,
  LOTERIA_TOLIMA: `${urlAssets}/assets/svg/recaudo/LOTERIA/LOTERIA_TOLIMA.svg`,
  LOTERIA_CUNDINAMARCA: `${urlAssets}/assets/svg/recaudo/LOTERIA/LOTERIA_CUNDINAMARCA.svg`,
  LOTERIA_VENTAS: `${urlAssets}/assets/svg/recaudo/LOTERIA/LOTERIA_VENTAS.svg`,
  LOTERIA_PREMIOS: `${urlAssets}/assets/svg/recaudo/LOTERIA/LOTERIA_PREMIOS.svg`,
  LOTERIA_ARQUEO_BILLETES: `${urlAssets}/assets/svg/recaudo/LOTERIA/LOTERIA_ARQUEO_BILLETES.svg`,
  LOTERIA_CARGA_ARCHIVOS: `${urlAssets}/assets/svg/recaudo/LOTERIA/LOTERIA_CARGA_DE_ARCHIVOS.svg`,
  LOTERIA_DESCARGA_DE_ARCHIVOS: `${urlAssets}/assets/svg/recaudo/LOTERIA/LOTERIA_DESCARGA_DE_ARCHIVOS.svg`,
  LOTERIA_SORTEOS: `${urlAssets}/assets/svg/recaudo/LOTERIA/LOTERIA_SORTEOS.svg`,
  LOTERIA_INVENTARIO_BILLETES: `${urlAssets}/assets/svg/recaudo/LOTERIA/LOTERIA_INVENTARIO_BILLETES.svg`,
  LOTERIA_HISTORICO_CARGUE_ARCHIVOS: `${urlAssets}/assets/svg/recaudo/LOTERIA/LOTERIA_HISTORICO_CARGUE_ARCHIVOS.svg`,

  CARGAR: `${urlAssets}/assets/svg/CARGAR.svg`,
  DESCARGAR: `${urlAssets}/assets/svg/DESCARGAR.svg`,
  SORTEO01: `${urlAssets}/assets/img/SORTEO-01.png`,

  //TRANSACCIONES
  TRANSACCIONES: `${urlAssets}/assets/svg/recaudo/TRANSACCIONES/TRANSACCIONES.svg`,

  //IAM
  IAM: `${urlAssets}/assets/svg/recaudo/IAM/IAM.svg`,

  //ACTUALIZACION DE DATOS
  ACTUALIZACION_DATOS: `${urlAssets}/assets/svg/recaudo/ACTUALIZACION_DATOS/ACTUALIZACION.svg`,

  //MARKETPLACE
  MARKETPLACE: `${urlAssets}/assets/svg/recaudo/MARKETPLACE/MARKETPLACE.svg`,

  // FUNDACION DE LA MUJER
  FUNDACION_MUJER: `${urlAssets}/assets/svg/recaudo/FUNDACION_MUJER/FUNDACION_MUJER.svg`,
  FUNDACION_MUJER_RECAUDO: `${urlAssets}/assets/svg/recaudo/FUNDACION_MUJER/FUNDACION_MUJER_RECAUDO.svg`,
  FUNDACION_MUJER_DESEMBOLSO: `${urlAssets}/assets/svg/recaudo/FUNDACION_MUJER/FUNDACION_MUJER_DESEMBOLSO.svg`,
  FUNDACION_MUJER_REVERSO: `${urlAssets}/assets/svg/recaudo/FUNDACION_MUJER/FUNDACION_MUJER_REVERSO.svg`,
  FUNDACION_MUJER_REPORTE: `${urlAssets}/assets/svg/recaudo/FUNDACION_MUJER/FUNDACION_MUJER_REPORTE.svg`,

  //PINES VUS
  PINES: `${urlAssets}/assets/svg/recaudo/PINES/PINES.svg`,
  PINES_TRAMITAR: `${urlAssets}/assets/svg/recaudo/PINES/PINES_TRAMITAR.svg`,
  PINES_CREAR: `${urlAssets}/assets/svg/recaudo/PINES/PINES_CREAR.svg`,
  PINES_CITAS: `${urlAssets}/assets/svg/recaudo/PINES/PINES_CITAS.svg`,
  PINES_CONSULTAR_CITAS: `${urlAssets}/assets/svg/recaudo/PINES/PINES_CONSULTAR_CITAS.svg`,
  PINES_QX: `${urlAssets}/assets/svg/recaudo/PINES/PIINES_QX.svg`,
  PINES_CIERRE_MANUAL: `${urlAssets}/assets/svg/recaudo/PINES/PINES_CIERRE_MANUAL.svg`,
  PINES_PARTICIPACION: `${urlAssets}/assets/svg/recaudo/PINES/PINES_PARTICIPACION.svg`,
  PINES_REPORTES: `${urlAssets}/assets/svg/recaudo/PINES/PINES_REPORTES.svg`,
  PINES_PAGO_PARTICIPACION: `${urlAssets}/assets/svg/recaudo/PINES/PINES_PAGO_PARTICIPACION.svg`,
  PINES_VER_PAGO_PARTICIPACION: `${urlAssets}/assets/svg/recaudo/PINES/PINES_VER_PAGO_PARTICIPACION.svg`,
  PINES_ADMINISTRAR: `${urlAssets}/assets/svg/recaudo/PINES/PINES_ADMINISTAR.svg`,
  PINES_GENERACION_LICENCIA: `${urlAssets}/assets/svg/recaudo/PINES/PINES_GENERACION_LICENCIA.svg`,
  PINES_SERVICIO_CONTENIDO: `${urlAssets}/assets/svg/recaudo/PINES/PINES_SERVICIO_Y_CONTENIDO.svg`,
  PINES_DESCARGA_REPORTE: `${urlAssets}/assets/svg/recaudo/PINES/PINES_DESCARGA_REPORTE.svg`,
  PINES_PARAMETRIZAR_HORARIOS: `${urlAssets}/assets/svg/recaudo/PINES/PINES_PARAMETRIZAR_HORARIOS.svg`,

  PagoParticipacion: `${urlAssets}/assets/img/pago participacion.png`,
  ReportePines: `${urlAssets}/assets/img/reporte pines.png`,

  //RECAUDO

  RECAUDO: `${urlAssets}/assets/svg/recaudo/RECAUDO/RECAUDO.svg`,
  RECAUDO_MANUAL: `${urlAssets}/assets/svg/recaudo/RECAUDO/REACAUDO_MANUAL.svg`,
  RECAUDO_CODIGO_DE_BARRAS: `${urlAssets}/assets/svg/recaudo/RECAUDO/RECAUDO_CODIGO_DE_BARRAS.svg`,

  //DETALLES CUPO
  DETALLES_CUPO: `${urlAssets}/assets/svg/recaudo/DETALLES_CUPO/DETALLE_CUPO.svg`,

  //DAVIPLATA
  DAVIPLATA: `${urlAssets}/assets/svg/recaudo/DAVIPLATA/DAVIPLATA.svg`,
  DAVIPLATA_DEPOSITO: `${urlAssets}/assets/svg/recaudo/DAVIPLATA/DAVIPLATA_DEPOSITO.svg`,
  DAVIPLATA_RETIRO: `${urlAssets}/assets/svg/recaudo/DAVIPLATA/DAVIPLATA_RETIRO.svg`,
  Retiro: `${urlAssets}/assets/svg/recaudo/DAVIPLATA/DAVIPLATA_RETIRO.svg`,

  //CORRESPONSALIA
  CORRESPONSALIA: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/CORRESPONSALIA.svg`,

  //CORRESPONSALIA/DAVIVIENDA
  DAVIVIENDA: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/DAVIVIENDA/DAVIVIENDA.svg`,
  DAVIVIENDA_RETIROS_Y_DEPOSITOS: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/DAVIVIENDA/DAVIVIENDA_RETIROS_Y_DEPOSITOS.svg`,
  DAVIVIENDA_PAGO_POR_GIRO: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/DAVIVIENDA/DAVIVIENDA_PAGO_POR_GIRO.svg`,
  DAVIVIENDA_PAGO_PRODUCTOS_PROPIOS: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/DAVIVIENDA/DAVIVIENDA_PAGO_PRODUCTOS_PROPIOS.svg`,
  DAVIVIENDA_RECAUDO_SERVICIOS_PUBLICOS_Y_PRIVADOS: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/DAVIVIENDA/DAVIVIENDA_RECAUDO_SERVICIOS_PUBLICOS_Y_PRIVADOS.svg`,
  DAVIVIENDA_DEPOSITOS: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/DAVIVIENDA/DAVIVIENDA_DEPOSITOS.svg`,
  DAVIVIENDA_RETIROS: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/DAVIVIENDA/DAVIVIENDA_DEPOSITOS.svg`,
  DAVIVIENDA_RECAUDO_CODIGO_DE_BARRAS: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/DAVIVIENDA/DAVIVIENDA_RECAUDO_CODIGO_DE_BARRAS.svg`,
  DAVIVIENDA_RECAUDO_MANUAL: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/DAVIVIENDA/DAVIVIENDA_RECAUDO_MANUAL.svg`,
  DAVIVIENDA_RECAUDO_MANUAL_OPERACIONES: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/DAVIVIENDA/DAVIVIENDA_RECAUDO_MANUAL_OPERACIONES.svg`,

  //CORRESPONSALIA/COLPATRIA
  COLPATRIA: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/COLPATRIA/COLPATRIA.svg`,
  COLPATRIA_DEPOSITO: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/COLPATRIA/COLPATRIA_DEPOSITO.svg`,
  COLPATRIA_VENTA_PINES_DE_RECAUDO: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/COLPATRIA/COLPATRIA_VENTA_PINES_DE_RECAUDO.svg`,
  COLPATRIA_RECAUDO_SERVICIOS_PUBLICOS_Y_PRIVADOS: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/COLPATRIA/COLPATRIA_RECAUDO_SERVICIOS_PUBLICOS_Y_PRIVADOS.svg`,
  COLPATRIA_RETIRO_CON_PIN: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/COLPATRIA/COLPATRIA_RETIRO_CON_PIN.svg`,
  COLPATRIA_PIN_DE_PAGO: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/COLPATRIA/COLPATRIA_PIN_DE_PAGO.svg`,
  COLPATRIA_GESTION: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/COLPATRIA/COLPATRIA_GESTION.svg`,
  COLPATRIA_RECAUDO_PSE_MANUAL_EFECTIVO: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/COLPATRIA/COLPATRIA_RECAUSO_PSE_MANUAL_EFECTIVO.svg`,
  COLPATRIA_RECAUDO_PSE_CODIGO_DE_BARRAS_EN_EFECTIVO: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/COLPATRIA/COLPATRIA_RECAUDO_PSE_CODIGO_DE_BARRAS_EN_EFECTIVO.svg`,
  COLPATRIA_LISTA_ERRORES: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/COLPATRIA/COLPATRIA_GESTION.svg`,
  COLPATRIA_CONVENIO_PINES_RECAUDO: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/COLPATRIA/COLPATRIA_GESTION.svg`,
  COLPATRIA_CONVENIO_RECAUDO: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/COLPATRIA/COLPATRIA_GESTION.svg`,

  //CORRESPONSALIA/AVAL
  AVAL: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/AVAL/AVAL.svg`,
  AVAL_TRANSACCIONES_CUENTAS: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/AVAL/AVAL_TRANSACCIONES_CUENTAS.svg`,
  AVAL_RECAUDO_SERVICIOS_PUBLICOS_PRIVADOS: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/AVAL/AVAL_RECAUDO_SERVICIOS_PUBLICOS_PRIVADOS.svg`,
  AVAL_PAGO_DE_TERCEROS: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/AVAL/AVAL_PAGO_DE_TERCEROS.svg`,
  AVAL_PAGO_DE_SUBSIDIOS: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/AVAL/AVAL_PAGO_DE_SUBSIDIOS.svg`,
  AVAL_DEPOSITO: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/AVAL/AVAL_DEPOSITO.svg`,
  AVAL_RETIROS: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/AVAL/AVAL_RETIROS.svg`,
  AVAL_RECAUDO_MANUAL: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/AVAL/AVAL_RECAUDO_MANUAL.svg`,
  AVAL_RECAUDO_CODIGO_DE_BARRAS: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/AVAL/AVAL_RECAUDO_CODIGO_DE_BARRAS.svg`,
  AVAL_CONVENIO_RECAUDO: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/AVAL/AVAL_CONVENIO_RECAUDO.svg`,
  //CORRESPONSALIA/AGRARIO
  AGRARIO: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/AGRARIO/AGRARIO.svg`,
  //CORRESPONSALIA/RECAUDO MULTIPLE
  RECAUDO_MULTIPLE: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/RECAUDO_MULTIPLE/RECAUDO_MULTIPLE.svg`,
  RECAUDO_MULTIPLE_CARGAR: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/RECAUDO_MULTIPLE/RECAUDO_MULTIPLE_CARGAR.svg`,
  RECAUDO_MULTIPLE_CONSULTAR: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/RECAUDO_MULTIPLE/RECAUDO_MULTIPLE_CONSULTAR.svg`,
  RECAUDO_MULTIPLE_CONSULTAR_PAGINADO: `${urlAssets}/assets/svg/recaudo/CORRESPONSALIA/RECAUDO_MULTIPLE/RECAUDO_MULTIPLE_CONSULTAR_PAGINADO.svg`,

  //SMS
  SMS: `${urlAssets}/assets/svg/recaudo/SMS/SMS.svg`,
  SMS_CREAR: `${urlAssets}/assets/svg/recaudo/SMS/SMSCREAR.svg`,
  SMS_REPORTE: `${urlAssets}/assets/svg/recaudo/SMS/SMSREPORTE.svg`,
  SMS_BLOQUEO_DE_NUMEROS: `${urlAssets}/assets/svg/recaudo/SMS/SMSBLOQUEODENUMEROS.svg`,
  SMS_ENVIO_DE_MENSAJE: `${urlAssets}/assets/svg/recaudo/SMS/SMSENVIODEMENSAJE.svg`,

  //TelefoniaMovil
  TELEFONIA_MOVIL: `${urlAssets}/assets/svg/recaudo/TELEFONIA_MOVIL`,
  RECARGA_CELULAR: `${urlAssets}/assets/svg/recaudo/RECARGAS_CELULAR/RECARGASCELULAR.svg`,
  MOVISTAR: `${urlAssets}/assets/svg/recaudo/RECARGAS_CELULAR/MOVISTAR/MOVISTAR.svg`,
  MOVISTAR_RECARGAS: `${urlAssets}/assets/svg/recaudo/RECARGAS_CELULAR/MOVISTAR/MOVISTAR_RECARGAS.svg`,
  MOVISTAR_PAQUETES: `${urlAssets}/assets/svg/recaudo/RECARGAS_CELULAR/MOVISTAR/MOVISTAR_PAQUETES.svg`,
  MOVISTAR_OPERADOR_PDP: `${urlAssets}/assets/svg/recaudo/RECARGAS_CELULAR/MOVISTAR/MOVISTAR_OPERADOR_PDP.svg`,
  MOVISTAR_COMBOS: `${urlAssets}/assets/svg/recaudo/RECARGAS_CELULAR/MOVISTAR/MOVISTAR_COMBOS.svg`,
  MOVISTAR_PAQUETES_DATOS: `${urlAssets}/assets/svg/recaudo/RECARGAS_CELULAR/MOVISTAR/MOVISTAR_PAQUETES.svg`,
  MOVISTAR_PAQUETE_VOZ: `${urlAssets}/assets/svg/recaudo/RECARGAS_CELULAR/MOVISTAR/MOVISTAR_PAQUETE_VOZ.svg`,
  MOVISTAR_TV_PREPAGADA: `${urlAssets}/assets/svg/recaudo/RECARGAS_CELULAR/MOVISTAR/MOVISTAR_TV_PREPAGADA.svg`,
  MOVISTAR_CARGUE_DE_PAQUETES: `${urlAssets}/assets/svg/recaudo/RECARGAS_CELULAR/MOVISTAR/MOVISTAR_CARGUE_DE_PAQUETES.svg`,
  MOVISTAR_CONCILIACION: `${urlAssets}/assets/svg/recaudo/RECARGAS_CELULAR/MOVISTAR/MOVISTAR_CONCILIACION.svg`,

  //PARAMETROS TRANSACCIONALES
  PARAMETROS_TRANSACCIONALES: `${urlAssets}/assets/svg/recaudo/PARAMETROS_TRANSACCIONALES/PARAMETROSTRANSACCIONALES.svg`,

  //Movii
  MOVII: `${urlAssets}/assets/svg/recaudo/MOVII/MOVII.svg`,
  MOVII_RETIRO: `${urlAssets}/assets/svg/recaudo/MOVII/MOVII_RETIRO.svg`,
  MOVII_REVERSO_RETIRO: `${urlAssets}/assets/svg/recaudo/MOVII/MOVII_REVERSO_RETIRO.svg`,

  //COLPENSIONES
  COLPENSIONES: `${urlAssets}/assets/svg/recaudo/COLPENSIONES/COLPENSIONES.svg`,

  //VENTA SEGUROS
  VENTA_SEGUROS: `${urlAssets}/assets/svg/recaudo/VENTA_DE_SEGUROS/SEGUROS.svg`,
  VENTA_SEGUROS_SOAT: `${urlAssets}/assets/svg/recaudo/VENTA_DE_SEGUROS/SOAT.svg`,

  //RECAUDO RETIRO DIRECTO
  RECAUDO_RETIRO_DIRECTO: `${urlAssets}/assets/svg/recaudo/RECAUDORETIRODIRECTO.svg`,

  //POWWI
  POWWI: `${urlAssets}/assets/svg/recaudo/POWWI/POWWI.svg`,
  POWWI_RETIRO: `${urlAssets}/assets/svg/recaudo/POWWI/POWWI_RETIRO.svg`,
  POWWI_DEPOSITO: `${urlAssets}/assets/svg/recaudo/POWWI/POWWI_RECAUDO.svg`,

  //TULLAVE
  RECARGASTULLAVE: `${urlAssets}/assets/svg/recaudo/TULLAVE/TULLAVE_RECARGAS.svg`,
  TULLAVE_GESTION_DATAFONO: `${urlAssets}/assets/svg/recaudo/TULLAVE/TULLAVE_GESTION_DATAFONO.svg`,

  //CREZCAMOS
  CREZCAMOS: `${urlAssets}/assets/svg/recaudo/CREZCAMOS/CREZCAMOS.png`,
  CREZCAMOS_OTRAS_ENTIDADES: `${urlAssets}/assets/svg/recaudo/CREZCAMOS/CREZCAMOS.png`,
  CREZCAMOS_PAGO_CREDITOS: `${urlAssets}/assets/svg/recaudo/CREZCAMOS/CREZCAMOS.png`,

  //MOVILIZA
  MOVILIZA: `${urlAssets}/assets/svg/recaudo/MOVILIZA/Logo_Moviliza.png`,
  // Recaudo Y OTROS
  IMPUESTO: `${urlAssets}/assets/svg/recaudo/IMPUESTO.svg`,
  PRODUCTOS_FINANCIEROS: `${urlAssets}/assets/svg/recaudo/PRODUCTOS_FINANCIEROS.svg`,
  RETIRO: `${urlAssets}/assets/svg/recaudo/RETIROSYDEPOSITOS.svg`,
  DescargarReporte: `${urlAssets}/assets/img/descargar reporte.png`,
};

const banners = {
  BANNER_1: `${urlAssets}/assets/img/banners/BANNER_1.jpg`,
  BANNER_2: `${urlAssets}/assets/img/banners/BANNER_2.jpg`,
  BANNER_3: `${urlAssets}/assets/img/banners/BANNER_3.jpg`,
  BANNER_4: `${urlAssets}/assets/img/banners/BANNER_4.jpg`,
  BANNER_5: `${urlAssets}/assets/img/banners/BANNER_5.jpg`,
};

export { images, svgs, banners };
