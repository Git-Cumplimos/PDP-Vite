import { useCallback } from "react";
import { makeMoneyFormatter, moneyValidator } from "../utils/functions";

const filterExtraDigit = (data, digits = 0) => {
  const arr = data.split(/,/);
  if (arr.length < 2) {
    return data;
  }
  if (arr[1].length < 1) {
    return data;
  }

  return `${arr[0]},${arr[1].substring(0, digits)}`;
};

const useMoney = ({
  limits = [0, 10000000],
  equalError = false,
  equalErrorMin = false,
  decimalDigits = 0,
  negativeValues = false,
}) => {
  const onChangeMoney = useCallback(
    (ev) => {
      const moneyFormatter = makeMoneyFormatter(decimalDigits);

      let caret_pos = ev.target.selectionStart ?? 0;

      const filteredValue = filterExtraDigit(ev.target.value, decimalDigits);
      const len = filteredValue.length;

      const moneyValue =
        Math.round(
          moneyValidator(filteredValue, negativeValues) *
            Math.pow(10, decimalDigits)
        ) / Math.pow(10, decimalDigits);

      const [min, max] = limits;
      if (moneyValue === min && equalErrorMin) {
        ev.target.setCustomValidity(
          `El valor debe ser mayor a ${moneyFormatter.format(min)}`
        );
      } else if (moneyValue < min) {
        ev.target.setCustomValidity(
          `El valor debe ser mayor ${
            !equalErrorMin ? " o igual" : ""
          } a ${moneyFormatter.format(min)}`
        );
      } else if (moneyValue > max) {
        ev.target.setCustomValidity(
          `El valor debe ser menor${
            !equalError ? " o igual" : ""
          } a ${moneyFormatter.format(max)}`
        );
      } else if (moneyValue === max && equalError) {
        ev.target.setCustomValidity(
          `El valor debe ser menor a ${moneyFormatter.format(max)}`
        );
      } else {
        ev.target.setCustomValidity("");
      }

      const toAdd =
        [",", "."].includes(filteredValue.at(-1) ?? "") && decimalDigits
          ? ","
          : "";
      ev.target.value =
        moneyValue === 0 ? "$ " : moneyFormatter.format(moneyValue) + toAdd;

      ev.target.focus();
      caret_pos += ev.target.value.length - len;
      ev.target.setSelectionRange(caret_pos, caret_pos);

      return moneyValue;
    },
    [limits, decimalDigits, equalError, equalErrorMin, negativeValues]
  );
  return onChangeMoney;
};

export default useMoney;
