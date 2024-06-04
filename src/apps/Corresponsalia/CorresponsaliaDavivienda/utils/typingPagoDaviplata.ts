import { TypeInfTicket } from "../../../../utils/TypingUtils";

export type TypingComercio = {
  id_comercio: number;
  id_usuario: number;
  id_terminal: number;
};

export type TypingDataComercio = {
  comercio: TypingComercio;
  nombre_comercio: string;
  nombre_usuario: string;
  address: string;
  dane_code: string;
  city: string;
  country: string;
  oficina_propia: boolean;
};

export enum NameVar {
  tipoDocumento = "tipoDocumento",
  numeroIdentificacion = "numeroIdentificacion",
  valor_total_trx = "valor_total_trx",
  otp = "otp",
}

export type TypingDataInput = {
  [NameVar.tipoDocumento]: string;
  [NameVar.numeroIdentificacion]: string;
  [NameVar.valor_total_trx]: number;
  [NameVar.otp]: string;
};

//----------------PeticionConsultaOtp------------------
export type TypingDataConsult = {
  idSessionToken?: string; //str-number
  id_trx?: number;
};

//----------------PeticionPago------------------
export type TypingDataPay = {
  ticket: TypeInfTicket;
};
