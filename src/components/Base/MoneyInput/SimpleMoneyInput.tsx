import React, {
  forwardRef,
  ComponentPropsWithoutRef,
  ChangeEvent,
  FormEvent,
} from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import useMoney from "../../../hooks/useMoney";
import {
  makeMoneyFormatter,
  moneyValidator,
  onHandleNegativeNumbers,
} from "../../../utils/functions";

interface Props
  extends Omit<ComponentPropsWithoutRef<"input">, "onInput" | "onChange"> {
  decimalDigits?: number;
  equalError?: boolean;
  equalErrorMin?: boolean;
  negativeValues?: boolean;
  onInput?: (_: FormEvent<HTMLInputElement>, __: number) => void;
  onChange?: (_: ChangeEvent<HTMLInputElement>, __: number) => void;
}

const SimpleMoneyInput = forwardRef<HTMLInputElement, Props>(
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
      const minVal = parseInt(input?.min?.toString() || "0") || 0;
      const maxVal = parseInt(input?.max?.toString() || "10000000") || 10000000;
      delete input.min;
      delete input.max;

      return [minVal, maxVal];
    }, [input?.min, input?.max]);

    const onChangeMoney = useMoney({
      limits: inputLimits,
      decimalDigits,
      equalError,
      equalErrorMin,
    });

    const localFormatMoney = useMemo(
      () => makeMoneyFormatter(decimalDigits),
      [decimalDigits]
    );

    useEffect(() => {
      if (inptRef.current) {
        const moneyFormatter = makeMoneyFormatter(decimalDigits);
        const moneyValue =
          Math.round(
            moneyValidator(inptRef.current.value) * Math.pow(10, decimalDigits)
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
    }, [decimalDigits, equalError, inputLimits, equalErrorMin]);

    const onInput = useCallback(
      (e) => {
        const inpFcn = input?.onInput;
        const value = onChangeMoney(e);
        inpFcn?.(e, value);
      },
      [input?.onInput, onChangeMoney]
    );

    const onChange = useCallback(
      (e) => {
        const chgFcn = input?.onChange;
        const value = onChangeMoney(e);
        chgFcn?.(e, value);
      },
      [input?.onChange, onChangeMoney]
    );

    const dynamicProps = useMemo(() => {
      const _props = new Map([["type", "tel"]]);
      if (input?.value !== undefined) {
        const moneyValue = moneyValidator(`${input?.value ?? ""}`);
        _props.set(
          "value",
          input?.value === "" ? "$ " : localFormatMoney.format(moneyValue)
        );
      }
      if (input?.defaultValue !== undefined) {
        const moneyValue = moneyValidator(`${input?.defaultValue ?? ""}`);
        _props.set(
          "value",
          input?.defaultValue === ""
            ? "$ "
            : localFormatMoney.format(moneyValue)
        );
      }
      return Object.fromEntries(_props);
    }, [input?.value, input?.defaultValue, localFormatMoney]);

    return (
      <input
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
        autoComplete="off"
        onInput={onInput}
        onChange={onChange}
        onKeyDown={negativeValues ? onHandleNegativeNumbers : () => {}}
      />
    );
  }
);

export default SimpleMoneyInput;
