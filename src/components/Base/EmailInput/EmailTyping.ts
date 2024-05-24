export type TypingMsgInvalid = string | null;
export type TypingIsGuiaUserFunc = (
  correo_: string,
  first_: string
) => TypingMsgInvalid;
export type TypingIsGuiaUser = TypingIsGuiaUserFunc | RegExp;

export type TypingDominioSchemaInd = Array<string> | string | null;
export type TypingDominioSchema = Array<TypingDominioSchemaInd>;
export type TypingDominioSchemaFunc = (
  correo_: string,
  dominio_: string
) => TypingMsgInvalid;
export type TypingIsGuiaDominioSchema = {
  schema: TypingDominioSchema;
  func?: TypingDominioSchemaFunc;
};
export type TypingIsGuiaDominioFunc = (correo_: string) => TypingMsgInvalid;
export type TypingIsGuiaDominio =
  | TypingIsGuiaDominioSchema
  | TypingIsGuiaDominioFunc;
