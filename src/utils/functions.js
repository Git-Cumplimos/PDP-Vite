import { Auth } from "aws-amplify";

export const makeMoneyFormatter = (fractionDigits) => {
  return Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 0,
  });
};

export const makeDateFormatter = (usetime = false) => {
  if (usetime) {
    return Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
  return Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const moneyValidator = (value) => {
  const floatMoney = (value.match(/\d|,/g) || []).join("").replace(/,/i, ".");
  // .replace(/,+/g, ".");
  const val = parseFloat(floatMoney);
  return isNaN(val) ? 0 : val;
};

/**
 * On change for just number inputs
 * @param {*} ev
 * @returns digits in text
 */
export const onChangeNumber = (ev) => {
  let caret_pos = ev.target.selectionStart ?? 0;
  const len = ev.target.value.length;

  ev.target.setAttribute("value", ((ev.target.value ?? "").match(/\d/g) ?? []).join(""));

  ev.target.focus();
  caret_pos += ev.target.value.length - len;
  ev.target.setSelectionRange(caret_pos, caret_pos);

  return ev.target.value;
};

export const toAccountNumber = (num = "") =>
  num.replace(/(.{4})/g, "$1 ").trim();

/**
 * On change for account number inputs
 * @param {*} ev
 * @returns digits in text
 */
export const onChangeAccountNumber = (ev) => {
  let caret_pos = ev.target.selectionStart ?? 0;
  const len = ev.target.value.length;

  const temp = ((ev.target.value ?? "").match(/\d/g) ?? []).join("");
  ev.target.setAttribute("value", toAccountNumber(temp));

  ev.target.focus();
  caret_pos += ev.target.value.length - len;
  ev.target.setSelectionRange(caret_pos, caret_pos);

  return temp;
};

export const fetchSecure = async (input, init) => {
  const _session = await Auth.currentSession();

  const newinit = init ?? { headers: {} };

  newinit.headers = {
    ...newinit.headers,
    Authorization: `Bearer ${_session?.getIdToken().getJwtToken()}`,
  };

  return await fetch(input, newinit);
};
