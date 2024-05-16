import {
  useCallback,
  useEffect,
  useRef,
  forwardRef,
  FormEvent,
  ChangeEvent,
  useState,
  useMemo,
} from "react";
import Input, { CustomInputProps } from "../Input";
import {
  TypingDominioSchema,
  TypingDominioSchemaInd,
  TypingIsGuiaDominio,
  TypingIsGuiaUser,
  TypingMsgInvalid,
} from "./EmailTyping";

export interface CustomPropsInputEmail {
  msgInvalidSimple?: string;
  msgInvalidComplejo?: string;
  isGuiaUser?: TypingIsGuiaUser;
  isGuiaDominio?: TypingIsGuiaDominio;
  onInput?: (ev: FormEvent<HTMLInputElement>, valor: number) => void;
  onChange?: (ev: ChangeEvent<HTMLInputElement>, valor: number) => void;
  required?: boolean;
}

type PropsInputEmail = CustomPropsInputEmail &
  Omit<CustomInputProps, "onInput" | "onChange">;

const getMsgInvalid = (msgInvalidReal: string, example_?: string): string => {
  console.log(msgInvalidReal);
  const _example_ = example_ ? ` Ejemplo: ${example_}` : "";
  return msgInvalidReal + _example_;
};

const guiaDominioInd = (
  valueInd_: string,
  dominioSchemaInd_: TypingDominioSchemaInd
): TypingMsgInvalid => {
  let msgInvalid: TypingMsgInvalid = null;
  switch (typeof dominioSchemaInd_) {
    case "string":
      const regex = [/^[0-9]*$/, /^[a-z]*$/, /^[A-Z]*$/, /^[A-Z]+$/i];
      let typeRegexIndex = -1;
      const typeRegex = regex.find((regex_, index_) => {
        typeRegexIndex = index_;
        return regex_.test(dominioSchemaInd_) === true;
      });

      switch (typeRegexIndex) {
        case 0:
          if (typeRegex?.test(valueInd_) === false) {
            msgInvalid = `La dirección de correo electrónico no tiene una estructura válida ('${valueInd_}' debe ser númerico).`;
          }
          break;
        case 1:
          if (typeRegex?.test(valueInd_) === false) {
            msgInvalid = `La dirección de correo electrónico no tiene una estructura válida ('${valueInd_}' debe ser letras y minúsculas).`;
          }
          break;
        case 2:
          if (typeRegex?.test(valueInd_) === false) {
            msgInvalid = `La dirección de correo electrónico no tiene una estructura válida ('${valueInd_}' debe ser letras y mayúscula).`;
          }
          break;
        case 3:
          if (typeRegex?.test(valueInd_) === false) {
            msgInvalid = `La dirección de correo electrónico no tiene una estructura válida ('${valueInd_}' debe ser letras).`;
          }
          break;
      }
      break;
    case "object":
      switch (Object.prototype.toString.call(dominioSchemaInd_)) {
        case "[object Array]":
          const findGuia = dominioSchemaInd_?.find(
            (elemento) => elemento.toLowerCase() === valueInd_.toLowerCase()
          );
          if (findGuia) {
            const regex = [/^[a-z]*$/, /^[A-Z]*$/];
            let typeRegexIndex = -1;
            const typeRegex = regex.find((regex_, index_) => {
              typeRegexIndex = index_;
              return regex_.test(findGuia) === true;
            });
            switch (typeRegexIndex) {
              case 0:
                if (typeRegex?.test(valueInd_) === false) {
                  msgInvalid = `La dirección de correo electrónico no tiene una estructura válida ('${valueInd_}' debe ser minúsculas).`;
                }
                break;
              case 1:
                if (typeRegex?.test(valueInd_) === false) {
                  msgInvalid = `La dirección de correo electrónico no tiene una estructura válida ('${valueInd_}' debe ser mayúsculas).`;
                }
                break;
            }
          } else {
            msgInvalid = `La dirección de correo electrónico no tiene una estructura válida ('${valueInd_}' no es permitido).`;
          }
          break;
      }
      break;
  }
  return msgInvalid;
};

const guiaDominio = (
  correo_: string,
  dominio_: string,
  limitsIsGuiaDominioSchema_: number[],
  dominioSchema_: TypingDominioSchema
): TypingMsgInvalid => {
  let msgInvalid: TypingMsgInvalid = null;
  const dominiosPunto = dominio_.split(".");
  const msgInvalidEmpty = dominiosPunto.find(
    (elemento) => elemento.trim() === ""
  );
  if (msgInvalidEmpty === "") {
    msgInvalid =
      "La dirección de correo electrónico no tiene una estructura válida.";
    return msgInvalid;
  }
  const regex1 = /^[^\s@]+@[^\s@]+/;
  const regex2 = /\.[^\s@]+/;
  const regexVector = Array(limitsIsGuiaDominioSchema_[0] - 1).fill(
    regex2.source
  );
  const regexString = regex1.source + regexVector.join("") + "$";
  const regexAll = new RegExp(regexString);
  const check = regexAll.test(correo_);
  if (!check) {
    msgInvalid =
      dominiosPunto.length < limitsIsGuiaDominioSchema_[0]
        ? "La dirección de correo electrónico no tiene la estructura completa."
        : "La dirección de correo electrónico no tiene una estructura válida.";
    return msgInvalid;
  }

  if (dominiosPunto.length < limitsIsGuiaDominioSchema_[0]) {
    msgInvalid =
      "La dirección de correo electrónico no tiene la estructura completa.";
    return msgInvalid;
  }

  if (limitsIsGuiaDominioSchema_[1]) {
    if (dominiosPunto.length > limitsIsGuiaDominioSchema_[1]) {
      msgInvalid =
        "La dirección de correo electrónico no tiene una estructura válida.";
      return msgInvalid;
    }
  }

  if (dominioSchema_.length === 0) return msgInvalid;

  const msgInvalidDominioInd = dominioSchema_.find((elemento, index) => {
    msgInvalid = guiaDominioInd(dominiosPunto[index], elemento);
    return msgInvalid;
  });
  if (msgInvalidDominioInd) {
    return msgInvalid;
  }
  return msgInvalid;
};

const guiaCorreo = (
  correo_: string,
  limitsIsGuiaDominioSchema_: number[],
  isGuiaDominio_: TypingIsGuiaDominio,
  isGuiaUser_?: TypingIsGuiaUser
): TypingMsgInvalid => {
  let msgInvalid: TypingMsgInvalid = null;
  if (/^\S*$/.test(correo_) === false) {
    //validar que no tenga espacios en blanco
    msgInvalid =
      "La dirección de correo electrónico no tiene una estructura válida.";
    return msgInvalid;
  }
  if (/^[^\s@]+@[^\s@]+$/.test(correo_) === false) {
    //validar que sea un correo asi sea simple
    msgInvalid =
      "La dirección de correo electrónico no tiene una estructura válida.";
    return msgInvalid;
  }
  const user_dominio = correo_.split("@");
  if (isGuiaDominio_) {
    switch (typeof isGuiaDominio_) {
      case "object":
        const msgInvalidDominio1 = guiaDominio(
          correo_,
          user_dominio[1],
          limitsIsGuiaDominioSchema_,
          isGuiaDominio_.schema
        );
        if (msgInvalidDominio1) return msgInvalidDominio1;
        if (isGuiaDominio_?.func) {
          const msgInvalidDominio2 = isGuiaDominio_.func(
            correo_,
            user_dominio[1]
          );
          if (msgInvalidDominio2) return msgInvalidDominio2;
        }
        break;
      case "function":
        const msgInvalidDominio3 = isGuiaDominio_(correo_);
        if (msgInvalidDominio3) return msgInvalidDominio3;
        break;
    }
  }

  if (isGuiaUser_) {
    if (isGuiaUser_ instanceof RegExp) {
      if (isGuiaUser_.test(user_dominio[0]) === false) {
        msgInvalid =
          "La dirección de correo electrónico no tiene una estructura válida.";
        return msgInvalid;
      }
    } else if (typeof isGuiaDominio_ === "function") {
      return isGuiaUser_(correo_, user_dominio[0]);
    }
  }
  return msgInvalid;
};

const EmailInput = forwardRef<HTMLInputElement, PropsInputEmail>(
  (
    {
      msgInvalidSimple,
      msgInvalidComplejo,
      isGuiaUser,
      isGuiaDominio,
      value,
      required = true,
      ...input
    },
    ref
  ) => {
    const inptRef = useRef<HTMLInputElement | null>(null);
    const [, setDidRun] = useState(false);

    const limitsIsGuiaDominioSchema: number[] = useMemo(() => {
      const limitsIsGuiaDominioSchema_: number[] = [1];
      if (input?.min) {
        const min = (input?.min ?? 0).toString();
        if (/^[0-9]*$/.test(min) === true)
          if (parseInt(min) > 0) limitsIsGuiaDominioSchema_[0] = parseInt(min);
      }
      if (input?.max) {
        const max = (input?.max ?? 0).toString();
        if (/^[0-9]*$/.test(max) === true)
          if (parseInt(max) >= limitsIsGuiaDominioSchema_[0])
            limitsIsGuiaDominioSchema_.push(parseInt(max));
      }
      delete input.min;
      delete input.max;
      return limitsIsGuiaDominioSchema_;
    }, [input?.min, input?.max]);

    const onClickInvalid = useCallback(
      (ev) => {
        if (isGuiaDominio) {
          let msgInvalid: TypingMsgInvalid = null;
          msgInvalid = guiaCorreo(
            ev.target.value,
            limitsIsGuiaDominioSchema,
            isGuiaDominio,
            isGuiaUser
          );
          if (msgInvalid) {
            ev.target.setCustomValidity(
              msgInvalidSimple
                ? getMsgInvalid(msgInvalidSimple, input?.placeholder)
                : getMsgInvalid(msgInvalid, input?.placeholder)
            );
          } else {
            if (ev.target?.validity?.typeMismatch === true) {
              ev.target.setCustomValidity(
                msgInvalidComplejo
                  ? getMsgInvalid(msgInvalidComplejo, input?.placeholder)
                  : ""
              );
            } else {
              ev.target.setCustomValidity("");
            }
          }
        }
        return ev.target.value;
      },
      [
        input?.placeholder,
        isGuiaDominio,
        isGuiaUser,
        msgInvalidSimple,
        msgInvalidComplejo,
        limitsIsGuiaDominioSchema,
      ]
    );

    const onInput = useCallback(
      (ev: FormEvent<HTMLInputElement>) => {
        const inpFcn = input?.onInput;
        const _valor = onClickInvalid(ev);
        inpFcn?.(ev, _valor);
      },
      [input?.onInput, onClickInvalid]
    );

    const onChange = useCallback(
      (ev: ChangeEvent<HTMLInputElement>) => {
        const chgFcn = input?.onChange;
        const _valor = onClickInvalid(ev);
        chgFcn?.(ev, _valor);
      },
      [input?.onChange, onClickInvalid]
    );

    useEffect(() => {
      setDidRun((old) => {
        if (old && input?.onChange) return old;
        if (inptRef.current) {
          if (isGuiaDominio) {
            // let msgInvalid: TypingMsgInvalid = null;
            // msgInvalid = guiaCorreo(
            //   inptRef.current.value,
            //   limitsIsGuiaDominioSchema,
            //   isGuiaDominio,
            //   input?.placeholder,
            //   isGuiaUser
            // );
            // if (msgInvalidSimple) {
            //   inptRef.current.setCustomValidity(
            //     msgInvalid ? msgInvalidSimple : ""
            //   );
            // } else {
            //   inptRef.current.setCustomValidity(msgInvalid ? msgInvalid : "");
            // }
          }
          return true;
        }
        return old;
      });
    }, [
      input?.placeholder,
      input?.onChange,
      isGuiaUser,
      isGuiaDominio,
      limitsIsGuiaDominioSchema,
      msgInvalidSimple,
      msgInvalidComplejo,
    ]);

    return (
      <Input
        {...input}
        type="email"
        value={value}
        ref={(realInput) => {
          inptRef.current = realInput;
          if (ref) {
            if (typeof ref === "function") {
              ref(realInput);
            } else {
              ref.current = realInput;
            }
          }
        }}
        onInput={onInput}
        onChange={onChange}
        required={required}
      />
    );
  }
);

export default EmailInput;
