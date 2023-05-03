import { useCallback, useEffect, useMemo, useRef } from "react";
import useMoney from "../../../hooks/useMoney";
import { makeMoneyFormatter, moneyValidator } from "../../../utils/functions";
import Input from "../Input";

export const formatMoney = makeMoneyFormatter(2);

const MoneyInput = ({ decimalDigits = 0, equalError = true, ...input }) => {
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
  });

  const localFormatMoney = useMemo(
    () => makeMoneyFormatter(decimalDigits),
    [decimalDigits]
  );

  useEffect(
    () => {
      if (inptRef.current) {
        const moneyFormatter = makeMoneyFormatter(decimalDigits);
  
        const moneyValue =
          Math.round(
            moneyValidator(inptRef.current.value) * Math.pow(10, decimalDigits)
          ) / Math.pow(10, decimalDigits);
  
        const [min, max] = inputLimits;
        if (moneyValue < min) {
          inptRef.current.setCustomValidity(
            `El valor debe ser mayor a ${moneyFormatter.format(min)}`
          );
        } else if (moneyValue > max) {
          inptRef.current.setCustomValidity(
            `El valor debe ser menor${
              !equalError ? " o igual" : ""
            } a ${moneyFormatter.format(max)}`
          );
        } else if (moneyValue === max && equalError) {
          inptRef.current.setCustomValidity(
            `El valor debe ser menor a ${moneyFormatter.format(max)}`
          );
        } else {
          inptRef.current.setCustomValidity("");
        }
      }
    },
    [decimalDigits, equalError, inputLimits]
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
    const _props = new Map([
      ["type", "tel"]
    ]);
    if (input?.value !== undefined) {
      const moneyValue = moneyValidator(`${input?.value ?? ""}`);
      _props.set("value", moneyValue === "" ? "$ " : localFormatMoney.format(moneyValue));
    }
    if (input?.defaultValue !== undefined) {
      const moneyValue = moneyValidator(`${input?.value ?? ""}`);
      _props.set("value", moneyValue === "" ? "$ " : localFormatMoney.format(moneyValue));
    }
    return Object.fromEntries(_props)
  }, [input?.value, input?.defaultValue, localFormatMoney])

  return <Input {...input} {...dynamicProps} ref={inptRef} onInput={onInput} />;
};

export default MoneyInput;
