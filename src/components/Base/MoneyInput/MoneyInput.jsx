import { useEffect, useMemo, useState } from "react";
import Input from "../Input/Input";

const moneyValidator = (value) => {
  const floatMoney = value.replace(/[($\s).,\s]+/g, "");
  // .replace(/,+/g, ".");
  const val = parseInt(floatMoney);
  return isNaN(val) ? "" : val;
};

export const formatMoney = Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

// const clampValue = (val, min, max) => {
//   return val === "" ? val : Math.min(Math.max(val, min), max);
// };

const MoneyInput = ({ ...input }) => {
  const onInput = useMemo(() => {
    const inpFcn = input?.onInput;
    const chgFcn = input?.onChange;
    const newCallback = (e, value) => {
      inpFcn?.(e, value);
      chgFcn?.(e, value);
    };
    return newCallback;
  }, [input?.onChange, input?.onInput]);

  const inputLimits = useMemo(() => {
    const minVal = parseInt(input?.min) || 0;
    const maxVal = parseInt(input?.max) || 10000000;
    delete input.min;
    delete input.max;

    return [minVal, maxVal];
  }, [input?.min, input?.max]);

  const [invalid, setInvalid] = useState("");

  useEffect(() => {
    delete input.type;
  }, [input.type]);

  return (
    <Input
      {...input}
      type={"text"}
      onInput={(e) => {
        let caret_pos = e.target.selectionStart;
        const len = e.target.value.length;
        const moneyValue = moneyValidator(e.target.value);
        const [min, max] = inputLimits;
        if (moneyValue < min) {
          setInvalid(`El valor debe ser mayor a ${formatMoney.format(min)}`);
        } else if (moneyValue > max) {
          setInvalid(`El valor debe ser menor a ${formatMoney.format(max)}`);
        } else {
          setInvalid(e.target.validationMessage);
        }
        e.target.value =
          moneyValue === "" ? "$ " : formatMoney.format(moneyValue);
        e.target.focus();
        caret_pos += e.target.value.length - len;
        e.target.setSelectionRange(caret_pos, caret_pos);
        onInput?.(e, moneyValue);
      }}
      invalid={invalid}
      defaultValue=""
    />
  );
};

export default MoneyInput;