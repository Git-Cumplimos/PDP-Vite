import { TypeInfTicket } from "../../../utils/TypingUtils";

export type TypingDataComercioSimple = {
  id_comercio: number;
  id_usuario: number;
  id_terminal: number;
};

export type TypingDataInputAuto = {
  id_unique?: string;
};

//------PeticionSettingTime------
export type TypingTypeSettingTime = "origin" | "cross";

export type TypingDataSettingTime = {
  delay_consult_for_pay: number;
  retries_consult_for_pay: number;
};

//------ PeticionConsultForPay----
export type TypingDataTrx = {
  "Num referencia": string;
};
export type TypingCheckPay = {
  ticket: TypeInfTicket;
  valor_trx: number;
  delay_consult_for_pay: number;
  retries_consult_for_pay: number;
};
