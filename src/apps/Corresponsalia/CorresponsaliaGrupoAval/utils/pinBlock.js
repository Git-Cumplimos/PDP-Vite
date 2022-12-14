const CryptoJS = require("crypto-js");

// /**
//  * Encrypt AES using Node.js's crypto module *
//  * @param data A utf8 string
//  * @param key Key would be hashed by md5 and shorten to maximum of 192 bits,
//  * @returns {*} A base64 string
//  */

// function encryptAES(data, key) {

//     key = CryptoJS.enc.Hex.parse(key);
//     const encrypted = CryptoJS.TripleDES.encrypt(data, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding }).toString();
//     console.log(encrypted)
//     return encrypted;
// }

function encryptAES(data, key) {
  console.log("data", data);
  console.log("key", key);
  key = CryptoJS.enc.Hex.parse(key);
  console.log("key2", key.toString());
  data = CryptoJS.enc.Hex.parse(data);
  const encrypted = CryptoJS.TripleDES.encrypt(data, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  }).toString();
  console.log(Buffer.from(encrypted, "base64").toString("hex"));
  return Buffer.from(encrypted, "base64").toString("hex");
}

function hexToBytes(hex) {
  let bytes = "";
  for (let c = 0; c < hex.length; c += 2)
    bytes =
      bytes +
      ("00000000" + parseInt(hex.substr(c, 2), 16).toString(2)).substr(-8);
  return bytes;
}

function XOR(hex1, hex2) {
  let bytes = "";
  for (let c = 0; c < hex1.length; c += 1)
    bytes = bytes + (hex1.substr(c, 1) ^ hex2.substr(c, 1));
  return bytes;
}

function bytesToHex(bytes) {
  let hex = "";
  for (let i = 0; i < bytes.length; i += 4) {
    let bytes2 = bytes.substr(i, 4);
    // console.log(bytes2)
    let num = 0;
    for (var j = 0; j < bytes2.length; j++) {
      // console.log(num,j,bytes2[j],bytes2[j]*(2**(bytes2.length-1-j)))
      num += bytes2[j] * 2 ** (bytes2.length - 1 - j);
    }
    // console.log(num)
    if (num === 15) {
      hex = hex + "F";
    } else if (num === 14) {
      hex = hex + "E";
    } else if (num === 13) {
      hex = hex + "D";
    } else if (num === 12) {
      hex = hex + "C";
    } else if (num === 11) {
      hex = hex + "B";
    } else if (num === 10) {
      hex = hex + "A";
    } else {
      hex = hex + String(num);
    }
  }
  return hex;
}

export const pinBlock = (pinX) => {
  let pin = pinX;
  let pan = process.env.REACT_APP_PAN_AVAL; /////// Verificar en donde poner el PAN
  const L = pin.length;

  pin = `0${L}${pin}ffffffffffffffff`;
  const pinHexa = pin.slice(0, 16);
  const pinBytes = hexToBytes(pinHexa);

  pan = pan.slice(-13, -1);
  const panHexa = `0000000000000000${pan}`.slice(-16);
  const panBytes = hexToBytes(panHexa);

  const resultBytes = XOR(pinBytes, panBytes);

  const result = bytesToHex(resultBytes);

  const key = process.env.REACT_APP_KEY_ENCRIP_AVAL;
  const resultEncrip = encryptAES(result, key);

  return resultEncrip;
};
