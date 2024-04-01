import { TypeInfTicket } from "../../../../utils/TypingUtils";

export type TypingLocation = {
  address: string;
  dane_code: string;
  city: string;
  country: string;
};

export type TypingDataComercio = {
  id_comercio: number;
  id_usuario: number;
  id_terminal: number;
  nombre_comercio: string;
  nombre_usuario: string;
  oficina_propia: boolean;
  location: TypingLocation;
};

export type TypingDataInput = {
  nombre_completo: string;
  correo: string;
  "correo|confirmacion": string;
  celular: string;
  "celular|confirmacion": string;
  documento: string;
  tipo_documento: string;
  referencia: string;
  fecha: string;
  valor_trx: string;
  id_uuid_trx: string;
};

//----------------PeticionCrearSesion------------------
export type TypingDataCrearSesion = {
  id_trx: number;
  processUrl: string;
};

//----------------PeticionPay------------------
export type TypingDataPay = {
  ticket: TypeInfTicket;
};
