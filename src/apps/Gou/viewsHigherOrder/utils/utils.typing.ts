import { ChangeEvent } from "react";
import {
  TypeInfTicket,
  TypingDataComercio,
} from "../../../../utils/TypingUtils";
import {
  TypingDataSetting,
  TypingOutputCheckPay,
  TypingSummaryTrx,
  TypingTrx,
  TypingTypeSettingTime,
} from "../../utils/utils_typing";

export type TypingDataInputOrigin = {
  valor_trx: string;
};
export type TypingDataInputOriginAuto = {
  fecha: string;
  id_uuid_trx: string;
};
export type TypingDataInputRequired = {
  tipo_tramite: string;
  id_unico_form: string;
  id_unico_modal: string;
  referencia: string;
};
export type TypingDataInputAdd = { [key: string]: string };
export type TypingDataInputAddAuto = { [key: string]: string };
export type TypingDataModalAdd = Array<{ [key: string]: string }> | undefined;
export type TypingOnChangeDataInputAdd = (
  ev: ChangeEvent<HTMLFormElement>
) => void;
export type TypingOnSubmitSchema = () => [boolean, TypingDataModalAdd];

export type TypingPeticionPayBase = (
  dataComercio: TypingDataComercio,
  dataInput: TypingDataInput
) => Promise<TypingDataPay>;

export type TypingUseHookGouFormularioAdd = (
  dataComercio: TypingDataComercio,
  dataInputOriginAuto: TypingDataInputOriginAuto
) => TypingOutputUseHookGouFormularioAdd;

export type TypingOutputUseHookGouFormularioAdd = {
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

//FRAGMENT *************** FOR HOOK UseHookWithGouPay **************************
//? UseHookWithGouPay
export type TypingUseHookWithGouPay = (
  type_operation: number,
  PeticionPayBase: TypingPeticionPayBase
) => TypingOutputUseHookWithGouPay;

export type TypingOutputUseHookWithGouPay = {
  loadingPeticion: boolean;
  loadingPeticionBlocking: boolean;
  PeticionSetting: TypingPeticionSetting;
  PeticionCheckPay: TypingPeticionCheckPay;
  summaryTrx: TypingSummaryTrx;
  trx: TypingTrx;
};

//? PeticionSetting
export type TypingPeticionSetting = () => Promise<TypingDataSettingValor>;
export type TypingDataSettingValor = {
  valor_costo_trx: number;
  valor_trx_maximo?: number;
  valor_trx_minimo?: number;
  valor_trx_maximo_exacto?: number;
  valor_trx_minimo_exacto?: number;
  cant_valor_trx_maximo: number;
};

//? PeticionCheckUrlProcessBase
export type TypingOutputCheckUrlProcessBase = {
  url_process: string;
  id_trx: number;
};

//? PeticionCheckUrlProcess
export type TypingDataSettingTimeCheckUrlProcess = {
  delay: number;
  timeout: number;
};
export type TypingPeticionCheckUrlProcessOutput = {
  url_process: string;
  what_service: string;
};

//? PeticionPay
export type TypingDataInput = TypingDataInputOrigin &
  TypingDataInputOriginAuto &
  TypingDataInputAdd &
  TypingDataInputRequired &
  TypingDataInputAddAuto;

export type TypingDataPay = {
  ticket: TypeInfTicket;
};

//? PeticionCheckPay
export type TypingPeticionCheckPay = (
  dataComercio: TypingDataComercio,
  dataInput: TypingDataInput,
  dataModalAdd: TypingDataModalAdd
) => Promise<TypingOutputCheckPay>;
