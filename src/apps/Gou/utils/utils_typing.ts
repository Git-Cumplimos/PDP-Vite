import { TypeInfTicket } from "../../../utils/TypingUtils";

export type TypingDataComercioSimple = {
  id_comercio: number;
  id_usuario: number;
  id_terminal: number;
};

export type TypingSummaryTrx = {
  id_log?: number;
  msg?: string;
  summary_trx?: { [key: string]: number | string };
  valor_trx?: number;
};

export type TypingStatusTrx =
  | "Search"
  | "Unidentified"
  | "Pendiente"
  | "Aprobada"
  | "Rechazada";

export type TypingTrx = {
  status: TypingStatusTrx;
  msg: string;
};

export type TypingTypeSettingTime = "origin" | "cross";
export type TypingDataPath = {
  type_setting_time: TypingTypeSettingTime;
  id_unique: string;
};

//------PeticionSettingTime------

export type TypingDataSettingTime = {
  delay_consult_for_pay: number;
  retries_consult_for_pay: number;
};

//------ PeticionConsultForPay----
export type TypingCheckPay = {
  ticket: TypeInfTicket;
  tipo_tramite: string;
};
