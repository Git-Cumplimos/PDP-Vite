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
  if (ev.keyCode === 189) {
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

    const dynamicProps = useMemo(() => {
      const _props = new Map([["type", "tel"]]);
      if (input?.value !== undefined) {
        const moneyValue = moneyValidator(
          `${input?.value ?? ""}`,
          negativeValues
        );
        _props.set(
          "value",
          !moneyValue ? "$ " : localFormatMoney.format(moneyValue)
        );
      }
      if (input?.defaultValue !== undefined) {
        const moneyValue = moneyValidator(
          `${input?.value ?? ""}`,
          negativeValues
        );
        _props.set(
          "value",
          !moneyValue ? "$ " : localFormatMoney.format(moneyValue)
        );
      }
      return Object.fromEntries(_props);
    }, [input?.value, input?.defaultValue, localFormatMoney, negativeValues]);

    useEffect(() => {
      if (inptRef.current) {
        const moneyFormatter = makeMoneyFormatter(decimalDigits);
        const moneyValue =
          Math.round(
            moneyValidator(
              dynamicProps?.value ?? inptRef.current.value,
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
      dynamicProps?.value,
    ]);

    return (
      <Input
        {...input}
        {...dynamicProps}
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
