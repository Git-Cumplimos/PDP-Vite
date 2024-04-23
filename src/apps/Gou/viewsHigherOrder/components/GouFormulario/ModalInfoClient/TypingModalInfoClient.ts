import { Dispatch, SetStateAction } from "react";

//FRAGMENT ******************** Typing *******************************
export type TypingConstInfo = any;

export type TypingShowModalInfoClient =
  | "Questions"
  | "Comunication"
  | "AceptarTerminos"
  | null;

export type PropsModalExterno = {
  showModalInfoClient: TypingShowModalInfoClient;
  setShowModalInfoClient: Dispatch<SetStateAction<TypingShowModalInfoClient>>;
  setAcepto: Dispatch<SetStateAction<boolean>>;
};

export type PropsModalInterno = {
  constInfo: TypingConstInfo;
  showModalInfoClient: TypingShowModalInfoClient;
  setShowModalInfoClient: Dispatch<SetStateAction<TypingShowModalInfoClient>>;
};

export type PropsModalInternoAcepto = {
  constInfo: TypingConstInfo;
  showModalInfoClient: TypingShowModalInfoClient;
  setShowModalInfoClient: Dispatch<SetStateAction<TypingShowModalInfoClient>>;
  setAcepto: Dispatch<SetStateAction<boolean>>;
};
