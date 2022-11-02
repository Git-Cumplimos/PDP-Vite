import CryptoJS from "crypto-js";

export const cifrarAES = (llave, iv, texto) => {
  const derived_key = CryptoJS.enc.Base64.parse(llave);
  iv = CryptoJS.enc.Utf8.parse(iv);
  return CryptoJS.AES.encrypt(texto, derived_key, {
    iv: iv,
  }).toString();
};
// XpAr8ou2/PfVA6gyd9l+MQ==
export const decryptAES = (llave,iv,data) => {
  let dataSin64 = CryptoJS.enc.Base64.parse(data)
  dataSin64 = CryptoJS.enc.Base64.stringify(dataSin64)
  const derived_key = CryptoJS.enc.Base64.parse(llave);
  iv = CryptoJS.enc.Utf8.parse(iv);
  const encrypted = CryptoJS.AES.decrypt(dataSin64, derived_key,{
    iv: iv,
  }).toString(CryptoJS.enc.Utf8)
  return encrypted;
}