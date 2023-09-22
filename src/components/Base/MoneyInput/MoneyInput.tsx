import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  forwardRef,
  FormEvent,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import useMoney from "../../../hooks/useMoney";
import {
  makeMoneyFormatter,
  moneyValidator,
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
        inpFcn?.(ev, onChangeMoney(ev));
      },
      [input?.onInput, onChangeMoney]
    );

    const onChange = useCallback(
      (ev: ChangeEvent<HTMLInputElement>) => {
        const chgFcn = input?.onChange;
        chgFcn?.(ev, onChangeMoney(ev));
      },
      [input?.onChange, onChangeMoney]
    );

    const value = useMemo(() => {
      if (origValue !== undefined) {
        const moneyValue = moneyValidator(`${origValue ?? ""}`, negativeValues);
        return !moneyValue ? "$ " : localFormatMoney.format(moneyValue);
      }
      return origValue;
    }, [origValue, localFormatMoney, negativeValues]);

    const defaultValue = useMemo(() => {
      if (origdefaultValue !== undefined) {
        const moneyValue = moneyValidator(
          `${origdefaultValue ?? ""}`,
          negativeValues
        );
        return !moneyValue ? "$ " : localFormatMoney.format(moneyValue);
      }
      return origdefaultValue;
    }, [origdefaultValue, localFormatMoney, negativeValues]);

    useEffect(() => {
      if (inptRef.current) {
        const moneyFormatter = makeMoneyFormatter(decimalDigits);
        const moneyValue =
          Math.round(
            moneyValidator(
              (value || defaultValue) ?? inptRef.current.value,
              negativeValues
            ) * Math.pow(10, decimalDigits)
          ) / Math.pow(10, decimalDigits);

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
      }
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
