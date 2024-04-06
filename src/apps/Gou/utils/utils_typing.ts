import { TypeInfTicket } from "../../../utils/TypingUtils";

export type TypingDataComercioSimple = {
  id_comercio: number;
  id_usuario: number;
  id_terminal: number;
};

export type TypingSummaryTrx = {
  msg?: string;
  summary_trx?: { [key: string]: number | string };
  valor_trx?: number;
};

//------PeticionSettingTime------
export type TypingTypeSettingTime = "origin" | "cross";

export type TypingDataSettingTime = {
  delay_consult_for_pay: number;
  retries_consult_for_pay: number;
};

//------ PeticionConsultForPay----
export type TypingCheckPay = {
  ticket: TypeInfTicket;
};
