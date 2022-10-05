import CryptoJS from "crypto-js";

export const cifrarAES = (llave, iv, texto) => {
  const derived_key = CryptoJS.enc.Base64.parse(llave);
  iv = CryptoJS.enc.Utf8.parse(iv);
  console.log(iv);
  return CryptoJS.AES.encrypt(texto, derived_key, {
    iv: iv,
  }).toString();
};
