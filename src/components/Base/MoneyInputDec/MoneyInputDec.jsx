import { useEffect, useMemo, useState } from "react";
import Input from "../Input";

const moneyValidator = (value) => {
  const floatMoney = value.replace(/[($\s).,\s]+/g, "");
  // .replace(/,+/g, ".");
  let val = 0;
  if (value.includes(",") || value.includes(".")) {
    val = parseFloat(value);
  } else {
    val = parseInt(value);
  }
  return isNaN(val) ? "" : val;
};

export const formatMoney = Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 6,
  minimumFractionDigits: 0,
});

// const clampValue = (val, min, max) => {
//   return val === "" ? val : Math.min(Math.max(val, min), max);
// };

const MoneyInputDec = ({ ...input }) => {
  const [invalid, setInvalid] = useState("");

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

  const newValue = useMemo(() => {
    const moneyValue = moneyValidator(`${input?.value ?? ""}`);
    return moneyValue === "" ? "$ " : formatMoney.format(moneyValue);
  }, [input?.value]);

  const newDefaultValue = useMemo(() => {
    const moneyValue = moneyValidator(`${input?.defaultValue ?? ""}`);
    return moneyValue === "" ? "$ " : formatMoney.format(moneyValue);
  }, [input?.defaultValue]);

  useEffect(() => {
    delete input.type;
  }, [input.type]);

  return "value" in input ? (
    <Input
      {...input}
      value={newValue}
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
    />
  ) : (
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
      defaultValue={newDefaultValue}
    />
  );
};

export default MoneyInputDec;
