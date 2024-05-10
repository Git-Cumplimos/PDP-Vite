import { ChangeEvent, Dispatch, ReactNode, SetStateAction } from "react";
import {
  TypeInfTicket,
  TypingDataComercio,
} from "../../../../utils/TypingUtils";
import {
  TypingDataPay,
  TypingSummaryTrx,
  TypingTrx,
} from "../../utils/utils_typing";

export type TypingFormClientInputs = {
  nombres?: string | null | boolean;
  apellidos?: string | null | boolean;
  correo?: string | null | boolean;
  celular?: string | null | boolean;
  documento?: string | null | boolean;
  tipo_documento?: string | null | boolean;
  "correo|confirmacion"?: null;
  "celular|confirmacion"?: null;
};

export type TypingFormClientDataInput = {
  nombres: string;
  apellidos: string;
  correo: string;
  celular: string;
  documento: string;
  tipo_documento: string;
};

export type TypingFormTrxInputs = {
  tipo_tramite: string | null | boolean;
  id_unico: string | null | boolean;
  referencia: string | null | boolean;
  fecha: string | null | boolean;
  valor_trx: string | null | boolean;
};

export type TypingFormTrxDataInput = {
  tipo_tramite: string;
  id_unico: string;
  referencia: string;
  fecha: string;
  valor_trx: string;
};
export type TypingFormAddDataInput = { [key: string]: string };

export type TypingFormDataInput = {
  formClientDataInput: TypingFormClientDataInput;
  setFormClientDataInput: Dispatch<SetStateAction<TypingFormClientDataInput>>;
  formTrxDataInput: TypingFormTrxDataInput;
  setFormTrxDataInput: Dispatch<SetStateAction<TypingFormTrxDataInput>>;
  formAddDataInput: TypingFormAddDataInput;
  setFormAddDataInput: Dispatch<SetStateAction<TypingFormAddDataInput>>;
};

export type TypingDataModalAdd = Array<{ [key: string]: string }> | undefined;
export type TypingOnChangeDataInputSon = (
  ev: ChangeEvent<HTMLFormElement>,
  formDataInput_: TypingFormDataInput
) => void;
export type TypingOnSubmitSchema = () => [string, boolean, TypingDataModalAdd];

export type TypingOutputErrorPrePayBase = {
  id_log?: number;
  id_trx?: number;
  fecha?: string;
  asterisk?: TypingDataModalAdd;
};
export type TypingOutputPrePayBase = {
  url_process: string;
  id_log: number;
  id_trx: number;
  fecha: string;
  asterisk: TypingDataModalAdd;
};

export type TypingOutputPrePay = {
  url_process: string;
};

export type TypingPeticionPrePayBase = (
  dataComercio: TypingDataComercio,
  dataInput: TypingDataInput
) => Promise<TypingOutputPrePayBase>;

export type TypingUseHookPasarelaSon = (
  destino: string,
  url_backend: string,
  dataComercio: TypingDataComercio,
  dataInitialAdd: { [key: string]: any } | undefined,
  formClientDataInput: TypingFormClientDataInput,
  setFormClientDataInput: Dispatch<SetStateAction<TypingFormClientDataInput>>,
  formTrxDataInput: TypingFormTrxDataInput,
  setFormTrxDataInput: Dispatch<SetStateAction<TypingFormTrxDataInput>>,
  formAddDataInput: TypingFormAddDataInput,
  setFormAddDataInput: Dispatch<SetStateAction<TypingFormAddDataInput>>
) => TypingOutputUseHookPasarelaSon;

export type TypingOutputUseHookPasarelaSon = {
  formClientInputs: TypingFormClientInputs;
  formTrxInputs: TypingFormTrxInputs;
  onChangeDataInputSon?: TypingOnChangeDataInputSon;
  onSubmitSchema: TypingOnSubmitSchema;
  PeticionPrePayBase: TypingPeticionPrePayBase;
  others: { [key: string]: any };
};

export type PropsFormAdd = {
  others: { [key: string]: any };
};

export type TypingShowModalInfoClient =
  | "Questions"
  | "Comunication"
  | "AceptarTerminos"
  | null;

export type PropsModalInfoClient = {
  infoClient: TypingInfoClient;
};

export type TypingInfoClientConst = { [key: string | number]: any };

export type PropsModalInterno = {
  showModalInfoClient: TypingShowModalInfoClient;
  setShowModalInfoClient: Dispatch<SetStateAction<TypingShowModalInfoClient>>;
  infoClientConst?: TypingInfoClientConst;
  children?: ReactNode;
};

export type PropsModalInternoAcepto = {
  showModalInfoClient: TypingShowModalInfoClient;
  setShowModalInfoClient: Dispatch<SetStateAction<TypingShowModalInfoClient>>;
  setAcepto: Dispatch<SetStateAction<boolean>>;
  infoClientConst?: TypingInfoClientConst;
  children?: ReactNode;
};

export type TypingInfoClientInd = {
  const?: TypingInfoClientConst;
  modal?: ReactNode;
};

export type TypingInfoClient = {
  comunication: TypingInfoClientInd;
  question: TypingInfoClientInd;
  aceptarTerminos: TypingInfoClientInd;
};

//FRAGMENT *************** FOR HOOK useHookWithPasarelaPay **************************
//? useHookWithPasarelaPay
export type TypingUseHookWithPasarelaPay = (
  type_operation: number,
  PeticionPrePayBase: TypingPeticionPrePayBase
) => TypingOutputUseHookWithPasarelaPay;

export type TypingOutputUseHookWithPasarelaPay = {
  loadingPeticion: boolean;
  loadingPeticionBlocking: boolean;
  PeticionSetting: TypingPeticionSetting;
  PeticionCheckPrePay: TypingPeticionCheckPay;
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
export type TypingDataInput = TypingFormClientDataInput &
  TypingFormTrxDataInput &
  TypingFormAddDataInput;

//? PeticionCheckPay
export type TypingPeticionCheckPay = (
  id_unico_modal: string,
  dataComercio: TypingDataComercio,
  dataInput: TypingDataInput,
  dataModalAdd: TypingDataModalAdd
) => Promise<TypingOutputPrePay>;
