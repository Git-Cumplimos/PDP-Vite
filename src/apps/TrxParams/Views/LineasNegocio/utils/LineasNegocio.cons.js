// Labels
export const LABEL_AUTHORIZER = "Autorizador";
export const LABEL_BUSINESS_LINE = "L\u00ednea de Negocio";
export const LABEL_CANCEL = "Cancelar";
export const LABEL_CREATE_BUSINESS_LINE = "Crear L\u00ednea de Negocio";
export const LABEL_DETAILED_LINE = "L\u00ednea Detallada";
export const LABEL_ITEMS_PER_PAGE = "items por p\u00e1gina";
export const LABEL_LOADING = "Cargando";
export const LABEL_SAVE = "Guardar";
export const LABEL_UPDATE = "Actualizar";
export const LABEL_TRANSACTION_TYPE = "Tipo de Transacción";

// Messages
export const MESSAGE_BAD_FORMAT_TABLE = `Bad "data" format, wrong count columns in data row`;
export const MESSAGE_BUSINESS_LINES_EMPTY = "No se encontraron l\u00edneas de Negocio.";
export const MESSAGE_DETAILED_LINES_EMPTY = "No se encontraron l\u00edneas Detalladas.";
export const MESSAGE_ERROR = "Hubo un error, vuelva a intentar.";
export const MESSAGE_FAILURE_CREATED = "La L\u00ednea de Negocio ya existe.";
export const MESSAGE_NO_DATA = "No hay datos";
export const MESSAGE_SUCCESS_CREATED = "L\u00ednea de Negocio {} guardado con \u00e9xito.";
export const MESSAGE_TRANSACTION_TYPES_EMPTY = "No se encontraron tipos de transacci\u00f3n.";
export const MESSAGE_VALIDATE = "Debe llenar los campos.";
export const MESSAGE_VALIDATE_AUTHORIZER = "El autorizador seleccionado no existe.";
export const MESSAGE_VALIDATE_EMPTY_PARAMS = "La informaci\u00f3n esta incompleta.";

// Objects
export const OBJECT_BUSINESS_LINE = {
  idLineaDetalle: 0,
  idTipoTransaccion: 0,
  idLineaNegocio: 0,
  lineaNegocio: "",
  lineaDetalle: "",
  autorizador: "",
  tipoTransaccion: "",
};
export const OBJECT_PAGE_DATA = {
  page: 1,
  limit: 10,
};

// Paths
export const PATH_BUSINESS_LINES = "/lineas-negocio";
export const PATH_DETAILED_LINES = "/lineas-negocio/linea";
export const PATH_TRANSACTION_TYPES = "/lineas-negocio/tipo-transaccion";

// Responses
export const RESPONSE_CODE_EMPTY = 422;
export const RESPONSE_CODE_FAILURE = 404;
export const RESPONSE_CODE_SUCCESS = 200;
export const RESPONSE_MESSAGE_SUCCESS = "SUCCESS";

// Tag
export const TAG_AUTHORIZER = "autorizador";
export const TAG_AUTHORIZER_LIST = "autorizadorLista";
export const TAG_BUSINESS_LINE = "lineaNegocio";
export const TAG_BUSINESS_LINE_ID = "idLineaNegocio";
export const TAG_DETAILED_FILTER_LINE = "lineaDetalleFiltro";
export const TAG_DETAILED_FILTER_LINE_LIST = "lineaDetalleFiltroLista";
export const TAG_DETAILED_LINE = "lineaDetalle";
export const TAG_DETAILED_LINE_LIST = "lineaDetalleLista";
export const TAG_DETAILED_LINE_ID = "idLineaDetalle";
export const TAG_TRANSACTION_TYPE = "tipoTransaccion";
export const TAG_TRANSACTION_TYPE_ID = "idTipoTransaccion";
export const TAG_TRANSACTION_TYPE_LIST = "tipoTransaccionLista";

// Title
export const TITLE_BUSINESS_LINES = "L\u00edneas de Negocio";