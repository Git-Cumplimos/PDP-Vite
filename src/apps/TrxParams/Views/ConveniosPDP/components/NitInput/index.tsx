import React, {
  ChangeEvent,
  forwardRef,
  useCallback,
  useMemo,
  useState,
} from "react";
import Input, {
  CustomInputProps,
} from "../../../../../../components/Base/Input";
import { notifyError } from "../../../../../../utils/notify";

const calcularDigitoVerificacion = (nitString: string) => {
  let vpri, z;

  // Se limpia el Nit
  // Espacios - comas - puntos - guiones
  const nitNumber = nitString.replace(/(\s)|(,)|(\.)|(-)/g, "").substring(0, 9);

  // Se valida el nit
  if (isNaN(parseInt(nitNumber))) {
    notifyError("El nit '" + nitString + "' no es válido(a).");
    return "";
  }

  // Procedimiento
  vpri = [2, 3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  z = nitNumber.length;

  let x = 0;
  let y = 0;
  for (let i = 0; i < z; i++) {
    y = parseInt(nitNumber.substring(i, i + 1));

    x += y * vpri[z - i];
  }
  y = x % 11;

  return y > 1 ? 11 - y : y;
};
const formatNit = (nitInput: string) => {
  nitInput = nitInput.replace(/\s/g, ""); // Espacios
  nitInput = nitInput.replace(/,/g, ""); // Comas
  nitInput = nitInput.replace(/\./g, ""); // Puntos
  // nitInput = nitInput.replace(/-/g, ""); // Guiones

  const matches = nitInput.match(/(\d{3})/g);
  let newStr = "";
  if (matches) {
    if (matches[0]) {
      newStr = `${newStr}${matches[0]}.`;
      if (matches[1]) {
        newStr = `${newStr}${matches[1]}.`;
        if (matches[2] && nitInput.match(/(\d{3}-)/g)) {
          newStr = `${newStr}${matches[2]}-${calcularDigitoVerificacion(
            nitInput
          )}`;
        } else {
          newStr = `${newStr}${nitInput.substring(6, 9)}`;
        }
      } else {
        newStr = `${newStr}${nitInput.substring(3)}`;
      }
    }
    return newStr;
  } else {
    return nitInput;
  }
};

type CustomProps = {
  onChange?: (ev: ChangeEvent<HTMLInputElement>, nit: string) => void;
};
type Props = CustomProps & Omit<CustomInputProps, "onInput" | "onChange">;

const NitInput = forwardRef<HTMLInputElement, Props>(
  ({ onChange, value: origValue, ...props }, ref) => {
    const [backspaceActive, setBackspaceActive] = useState(false);

    const onChangeNit = useCallback(
      (ev: ChangeEvent<HTMLInputElement>) => {
        let nitInput = ev.target.value;

        if (backspaceActive && ev.target.value.at(-1) === "-") {
          nitInput = ev.target.value.slice(0, -1);
        }
        setBackspaceActive(false);

        let caret_pos = ev.target.selectionStart ?? 0;
        const len = ev.target.value.length;

        const newNit = formatNit(
          nitInput
            ?.split("")
            ?.filter(
              (val, ind) =>
                !isNaN(parseInt(val)) || val === "." || (val === "-" && ind === 11)
            )
            ?.join("") ?? ""
        );
        ev.target.value = newNit;
        onChange?.(ev, ev.target.value);
        if (nitInput) {
          if (!newNit.match(/([0-9]{3}.[0-9]{3}.[0-9]{3}-{1}[0-9]{1})/g)) {
            ev.target.setCustomValidity("Nit inválido");
          } else {
            ev.target.setCustomValidity("");
          }
        }

        ev.target.focus();
        caret_pos += ev.target.value.length - len;
        ev.target.setSelectionRange(caret_pos, caret_pos);
      },
      [onChange, backspaceActive]
    );

    const value = useMemo(() => {
      if (origValue !== undefined) {
        return formatNit(`${origValue}`);
      }
      return origValue;
    }, [origValue]);

    return (
      <Input
        {...props}
        ref={(realInput) => {
          if (ref) {
            if (typeof ref === "function") {
              ref(realInput);
            } else {
              ref.current = realInput;
            }
          }
        }}
        minLength={13}
        maxLength={13}
        value={value}
        onChange={onChangeNit}
        onKeyDown={(ev) => {
          if (ev.key === "Backspace" || ev.key === "Delete") {
            setBackspaceActive(true);
          }
        }}
      />
    );
  }
);

export default NitInput;
