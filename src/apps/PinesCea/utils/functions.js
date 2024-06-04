import { encrypt3DES, decrypt3DES } from "../../../utils/functions";

/**
 * Encrypt 3DES using Node.js's crypto module
 * @param pin a string
 * @returns {*} a utf8 hex string
 */
export function encryptPin(pin) {
  return encrypt3DES(
    `${pin}`.padStart(16, "0"),
    process.env.REACT_APP_URL_COLPATRIA_3DES_ENCRYPT_K1,
    process.env.REACT_APP_URL_COLPATRIA_3DES_ENCRYPT_K2,
    process.env.REACT_APP_URL_COLPATRIA_3DES_ENCRYPT_K3
  );
}

/**
 * Decrypt 3DES using Node.js's crypto module
 * @param pin_encriptado a hex string
 * @returns {*} a utf8 string
 */
export function decryptPin(pin_encriptado) {
  return Number(
    decrypt3DES(
      pin_encriptado,
      process.env.REACT_APP_URL_COLPATRIA_3DES_DECRYPT_K1,
      process.env.REACT_APP_URL_COLPATRIA_3DES_DECRYPT_K2,
      process.env.REACT_APP_URL_COLPATRIA_3DES_DECRYPT_K3
    )
  );
}

export const buildTicket = (
  roleInfo,
  trx_id,
  codigo_autorizacion,
  commerceName,
  trxInfo
) => ({
  title: "Recibo de pago",
  timeInfo: {
    "Fecha de venta": Intl.DateTimeFormat("es-CO", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date()),
    Hora: Intl.DateTimeFormat("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date()),
  },
  commerceInfo: [
    ["No. Terminal", roleInfo?.id_dispositivo],
    ["Teléfono", roleInfo?.telefono],
    ["Id Trx", trx_id],
    ["Id Aut", codigo_autorizacion],
    ["Comercio", roleInfo?.["nombre comercio"]],
    ["", ""],
    ["Dirección", roleInfo?.direccion],
    ["", ""],
    // ["Id Transacción", res?.obj?.IdTransaccion],
  ],
  commerceName,
  trxInfo,
  disclamer:
    "Para cualquier reclamo es indispensable presentar este recibo o comuníquese a los Tel. en Bogotá 7561616 o gratis en el resto del país 018000-522222.",
});
