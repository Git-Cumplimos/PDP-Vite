import { Auth } from "aws-amplify";

const CryptoJS = require("crypto-js");

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

  ev.target.value = ((ev.target.value ?? "").match(/\d/g) ?? []).join("");

  if (ev.target.value.length < ev.target.minLength && ev.target.required) {
    ev.target.setCustomValidity(
      `Aumenta la longitud del texto a ${ev.target.minLength} caracteres como minimo (actualmente, el texto tiene ${ev.target.value.length} caracteres)`
    );
  } else {
    ev.target.setCustomValidity("");
  }

  ev.target.focus();
  caret_pos += ev.target.value.length - len;
  ev.target.setSelectionRange(caret_pos, caret_pos);

  return ev.target.value;
};

export const toPhoneNumber = (num = "") => {
  let reg = /(\d{1,3}[-.\s]?)?(\d{1,3}[-.\s]?)?(\d{1,4})/;
  return (
    num
      .match(reg)
      ?.filter((val, ind) => ind > 0 && val !== undefined)
      .map((val) => val.trim().replace("-", ""))
      .join(" ") ?? num
  );
};

/**
 * On change for just number inputs
 * ! to fix pattern
 * @param {*} ev
 * @returns digits in text
 */
export const onChangePhoneNumber = (ev) => {
  let caret_pos = ev.target.selectionStart ?? 0;
  const len = ev.target.value.length;

  ev.target.value = toPhoneNumber(ev.target.value ?? "");
  if (ev.target.value.length > 0 && ev.target.value[0] !== "3") {
    ev.target.setCustomValidity(
      "Número inválido, el No. de celular debe comenzar con el número 3"
    );
  } else {
    ev.target.setCustomValidity("");
  }

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

  if (temp.length < ev.target.minLength - Math.floor(ev.target.minLength / 5)) {
    ev.target.setCustomValidity(
      `Aumenta la longitud del texto a ${
        ev.target.minLength - Math.floor(ev.target.minLength / 5)
      } caracteres como minimo (actualmente, el texto tiene ${
        temp.length
      } caracteres)`
    );
  } else {
    ev.target.setCustomValidity("");
  }

  ev.target.value = toAccountNumber(temp);

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

export const onUpdateSW = (registration) => {
  console.log("Recargando la pagina para usar una nueva version");
  registration.waiting.postMessage({ type: "SKIP_WAITING" });
  registration.update().then(() => {
    window.location.reload();
  });
};

/**
 * Encrypt 3DES using Node.js's crypto module
 * @param data a string
 * @returns {*} a utf8 hex string
 */
export function encrypt3DES(data, k1, k2, k3) {
  const key3des = CryptoJS.enc.Hex.parse(`${k1}${k2}${k3}`);
  const hex_data = CryptoJS.enc.Hex.parse(data);
  const encrypted = CryptoJS.TripleDES.encrypt(hex_data, key3des, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  }).toString();
  return Buffer.from(encrypted, "base64").toString("hex").toUpperCase();
}

/**
 * Decrypt 3DES using Node.js's crypto module
 * @param data a hex string
 * @returns {*} a utf8 string
 */
export function decrypt3DES(data, k1, k2, k3) {
  const key3des = CryptoJS.enc.Hex.parse(`${k1}${k2}${k3}`);
  const b64_data = Buffer.from(data, "hex").toString("base64");
  const decrypted = CryptoJS.TripleDES.decrypt(b64_data, key3des, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  }).toString();
  return decrypted;
}
