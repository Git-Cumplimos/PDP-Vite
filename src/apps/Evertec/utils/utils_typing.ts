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

export type TypingDataSettingTimeCheckPay = {
  delay: number;
  retries: number;
};

export type TypingDataSettingTimeCheckUrlProcess = {
  delay: number;
  timeout: number;
};

//------ PeticionConsultForPay----
export type TypingCheckPay = {
  ticket: TypeInfTicket;
  tipo_tramite: string;
};
