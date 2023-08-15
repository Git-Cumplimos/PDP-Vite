import { useCallback, useEffect, useMemo, useRef } from "react";
import useMoney from "../../../hooks/useMoney";
import {
  makeMoneyFormatter,
  moneyValidator,
  onHandleNegativeNumbers,
} from "../../../utils/functions";
import Input from "../Input";

export const formatMoney = makeMoneyFormatter(2);

const MoneyInput = ({
  decimalDigits = 0,
  equalError = true,
  equalErrorMin = true,
  negativeValues = false,
  ...input
}) => {
  const inptRef = useRef(null);

  const inputLimits = useMemo(() => {
    const minVal = parseInt(input?.min) || 0;
    const maxVal = parseInt(input?.max) || 10000000;
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

  const onInput = useCallback(
    (e) => {
      const inpFcn = input?.onInput;
      const chgFcn = input?.onChange;
      const value = onChangeMoney(e);
      inpFcn?.(e, value);
      chgFcn?.(e, value);
    },
    [input?.onChange, input?.onInput, onChangeMoney]
  );

  const dynamicProps = useMemo(() => {
    const _props = new Map([["type", "tel"]]);
    if (input?.value !== undefined) {
      const moneyValue = moneyValidator(`${input?.value ?? ""}`);
      _props.set(
        "value",
        moneyValue === "" ? "$ " : localFormatMoney.format(moneyValue)
      );
    }
    if (input?.defaultValue !== undefined) {
      const moneyValue = moneyValidator(`${input?.value ?? ""}`);
      _props.set(
        "value",
        moneyValue === "" ? "$ " : localFormatMoney.format(moneyValue)
      );
    }
    return Object.fromEntries(_props);
  }, [input?.value, input?.defaultValue, localFormatMoney]);

  useEffect(() => {
    if (inptRef.current) {
      const moneyFormatter = makeMoneyFormatter(decimalDigits);
      const moneyValue =
        Math.round(
          moneyValidator(dynamicProps?.value ?? inptRef.current.value) *
            Math.pow(10, decimalDigits)
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
    dynamicProps?.value,
  ]);

  return (
    <Input
      {...input}
      {...dynamicProps}
      ref={inptRef}
      onInput={onInput}
      onKeyDown={negativeValues ? onHandleNegativeNumbers : () => {}}
    />
  );
};

export default MoneyInput;
