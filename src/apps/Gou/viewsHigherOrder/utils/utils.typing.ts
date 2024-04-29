import { ChangeEvent, Dispatch, SetStateAction } from "react";
import {
  TypeInfTicket,
  TypingDataComercio,
} from "../../../../utils/TypingUtils";

export type TypingDataInputOrigin = {
  valor_trx: string;
};
export type TypingDataInputOriginAuto = {
  fecha: string;
  id_uuid_trx: string;
};
export type TypingDataInputAdd = { [key: string]: string };
export type TypingDataInputRequired = {
  tipo_tramite: string;
  id_unico_form: string;
  id_unico_modal: string;
  referencia: string;
};
export type TypingDataInputAddAuto = { [key: string]: string };
export type TypingDataModalAdd = Array<{ [key: string]: string }> | undefined;
export type TypingOnChangeDataInputAdd = (
  ev: ChangeEvent<HTMLFormElement>
) => void;
export type TypingOnSubmitSchema = () => [boolean, TypingDataModalAdd];

export type TypingDataPay = {
  ticket: TypeInfTicket;
};

export type TypingPeticionPayBase = (
  dataComercio: TypingDataComercio,
  dataInput: TypingDataInput
) => Promise<TypingDataPay>;

export type TypeUseHookGouFormularioAdd = (
  dataComercio: TypingDataComercio,
  dataInputOriginAuto: TypingDataInputOriginAuto
) => {
  dataInputRequired: TypingDataInputRequired;
  dataInputAdd: TypingDataInputAdd;
  dataInputAddAuto: TypingDataInputAddAuto;
  onChangeDataInputAdd: TypingOnChangeDataInputAdd;
  onSubmitSchema: TypingOnSubmitSchema;
  PeticionPayBase: TypingPeticionPayBase;
  others: { [key: string]: any };
};

export type PropsGouFormularioAdd = {
  dataInputAdd: TypingDataInputAdd;
  others: { [key: string]: any };
};

//FRAGMENT ******************** FOR HOOK *******************************
//? PeticionPay
export type TypingDataInput = TypingDataInputOrigin &
  TypingDataInputOriginAuto &
  TypingDataInputAdd &
  TypingDataInputRequired &
  TypingDataInputAddAuto;

//? PeticionUrlProcess
export type TypingPeticionUrlProcessBaseOutput = {
  url_process: string;
  id_trx: number;
};

export type TypingPeticionCheckUrlProcessOutput = {
  url_process: string;
  what_service: string;
};
