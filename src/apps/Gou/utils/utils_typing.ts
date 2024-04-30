import { TypeInfTicket } from "../../../utils/TypingUtils";

export type TypingDataComercioSimple = {
  id_comercio: number;
  id_usuario: number;
  id_terminal: number;
};

export type TypingSummaryTrxOwn = {
  tipo_tramite?: string;
  referencia?: string;
  fecha?: string;
};

export type TypingSummaryTrx = {
  id_log?: number;
  id_unico?: string;
  id_trx?: number;
  msg?: string;
  summary_trx_asterisk?: Array<{ [key: string]: any }>;
  summary_trx_own?: TypingSummaryTrxOwn;
  valor_trx?: number;
};

export type TypingStatusTrx =
  | "Search"
  | "Indefinite"
  | "Desconocida"
  | "Pendiente"
  | "Pendiente."
  | "Aprobada"
  | "Rechazada";

export type TypingTrx = {
  status: TypingStatusTrx;
  msg: string;
};

export type TypingTypeSettingTime = "origin" | "cross";
export type TypingDataPath = {
  id_hash: string;
};

//------PeticionSettingTime------

export type TypingDataSetting = {
  valor_costo_trx: number;
  valor_trx_maximo?: number;
  valor_trx_minimo?: number;
  valor_trx_maximo_exacto?: number;
  valor_trx_minimo_exacto?: number;
  cant_valor_trx_maximo: number;
  check_pay__delay: number;
  check_pay__retries: number;
  check_url_process__delay: number;
  check_url_process__timeout: number;
};

//------ PeticionConsultForPay----
export type TypingOutputCheckPay = {
  ticket: TypeInfTicket;
  tipo_tramite: string;
};
