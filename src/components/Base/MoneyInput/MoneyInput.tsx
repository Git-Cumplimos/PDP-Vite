import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  forwardRef,
  FormEvent,
  ChangeEvent,
  KeyboardEvent,
  useState,
} from "react";
import useMoney, { moneyValidatorDecimal } from "../../../hooks/useMoney";
import {
  makeMoneyFormatter,
  onHandleNegativeNumbers,
} from "../../../utils/functions";
import Input, { CustomInputProps } from "../Input";

export const formatMoney = makeMoneyFormatter(2);

const handleBlockNegativeSign = (ev: KeyboardEvent<HTMLInputElement>) => {
  if (ev.key === "-") {
    ev.preventDefault();
    return;
  }
};

export interface CustomProps {
  decimalDigits?: number;
  equalError?: boolean;
  equalErrorMin?: boolean;
  negativeValues?: boolean;
  onInput?: (ev: FormEvent<HTMLInputElement>, valor: number) => void;
  onChange?: (ev: ChangeEvent<HTMLInputElement>, valor: number) => void;
}

type Props = CustomProps & Omit<CustomInputProps, "onInput" | "onChange">;

const MoneyInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      decimalDigits = 0,
      equalError = true,
      equalErrorMin = true,
      negativeValues = false,
      value: origValue,
      defaultValue: origdefaultValue,
      ...input
    },
    ref
  ) => {
    const inptRef = useRef<HTMLInputElement | null>(null);
    const [, setDidRun] = useState(false);

    const inputLimits = useMemo(() => {
      const minVal =
        typeof input?.min === "string" ? parseInt(input?.min) : input?.min ?? 0;
      const maxVal =
        typeof input?.max === "string"
          ? parseInt(input?.max)
          : input?.max ?? 10000000;
      delete input.min;
      delete input.max;

      return [minVal, maxVal];
    }, [input?.min, input?.max]);

    const onChangeMoney = useMoney({
      limits: inputLimits,
      decimalDigits,
      equalError,
      equalErrorMin,
      negativeValues,
    });

    const localFormatMoney = useMemo(
      () => makeMoneyFormatter(decimalDigits),
      [decimalDigits]
    );

    const onInput = useCallback(
      (ev: FormEvent<HTMLInputElement>) => {
        const inpFcn = input?.onInput;
        const _valor = onChangeMoney(ev);
        inpFcn?.(ev, _valor);
      },
      [input?.onInput, onChangeMoney]
    );

    const onChange = useCallback(
      (ev: ChangeEvent<HTMLInputElement>) => {
        const chgFcn = input?.onChange;
        const _valor = onChangeMoney(ev);
        chgFcn?.(ev, _valor);
      },
      [input?.onChange, onChangeMoney]
    );

    const value = useMemo(() => {
      if (origValue !== undefined) {
        const moneyValue = moneyValidatorDecimal(
          `${origValue ?? ""}`.replace(/\./, ","),
          {
            negativeValues,
            decimalDigits,
          }
        );
        return !moneyValue ? "$ " : localFormatMoney.format(moneyValue);
      }
      return origValue;
    }, [origValue, localFormatMoney, negativeValues, decimalDigits]);

    const defaultValue = useMemo(() => {
      if (origdefaultValue !== undefined) {
        const moneyValue = moneyValidatorDecimal(
          `${origdefaultValue ?? ""}`.replace(/\./, ","),
          {
            negativeValues,
            decimalDigits,
          }
        );
        return !moneyValue ? "$ " : localFormatMoney.format(moneyValue);
      }
      return origdefaultValue;
    }, [origdefaultValue, localFormatMoney, negativeValues, decimalDigits]);

    useEffect(() => {
      setDidRun((old) => {
        if (old) return old;
        if (inptRef.current) {
          const moneyFormatter = makeMoneyFormatter(decimalDigits);

          const moneyValue = moneyValidatorDecimal(
            (value || defaultValue) ?? inptRef.current.value,
            { negativeValues, decimalDigits }
          );

          const [min, max] = inputLimits;
          if (moneyValue === min && equalErrorMin) {
            inptRef.current.setCustomValidity(
              `El valor debe ser mayor ${
                !equalErrorMin ? " o igual" : ""
              } a ${moneyFormatter.format(min)}`
            );
          } else if (moneyValue < min) {
            inptRef.current.setCustomValidity(
              `El valor debe ser mayor  ${
                !equalErrorMin ? " o igual" : ""
              } a ${moneyFormatter.format(min)}`
            );
          } else if (moneyValue > max) {
            inptRef.current.setCustomValidity(
              `El valor debe ser menor${
                !equalError ? " o igual" : ""
              } a ${moneyFormatter.format(max)}`
            );
          } else if (moneyValue === max && equalError) {
            inptRef.current.setCustomValidity(
              `El valor debe ser menor ${
                !equalError ? " o igual" : ""
              } a ${moneyFormatter.format(max)}`
            );
          } else {
            inptRef.current.setCustomValidity("");
          }
          return true;
        }
        return old;
      });
    }, [
      decimalDigits,
      equalError,
      inputLimits,
      equalErrorMin,
      negativeValues,
      value,
      defaultValue,
    ]);

    return (
      <Input
        {...input}
        type="tel"
        value={value}
        defaultValue={defaultValue}
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
        onKeyDown={
          negativeValues ? onHandleNegativeNumbers : handleBlockNegativeSign
        }
      />
    );
  }
);

export default MoneyInput;
