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
}) => {
  const onChangeMoney = useCallback(
    (ev) => {
      const moneyFormatter = makeMoneyFormatter(decimalDigits);

      let caret_pos = ev.target.selectionStart ?? 0;

      const len = filterExtraDigit(ev.target.value, decimalDigits).length;

      const moneyValue =
        Math.round(
          moneyValidator(ev.target.value) * Math.pow(10, decimalDigits)
        ) / Math.pow(10, decimalDigits);

      const [min, max] = limits;
      if (moneyValue === min && equalErrorMin) {
        ev.target.setCustomValidity(
          `El valor debe ser mayor a ${moneyFormatter.format(
            min
          )}`
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
          `El valor debe ser menor a ${moneyFormatter.format(
            max
          )}`
        );
      } else {
        ev.target.setCustomValidity("");
      }

      const toAdd =
        [",", "."].includes(ev.target.value.at(-1) ?? "") && decimalDigits
          ? ","
          : "";
      ev.target.value =
        moneyValue === 0 ? "$ " : moneyFormatter.format(moneyValue) + toAdd;

      ev.target.focus();
      caret_pos += ev.target.value.length - len;
      ev.target.setSelectionRange(caret_pos, caret_pos);

      return moneyValue;
    },
    [limits, decimalDigits, equalError, equalErrorMin]
  );
  return onChangeMoney;
};

export default useMoney;
