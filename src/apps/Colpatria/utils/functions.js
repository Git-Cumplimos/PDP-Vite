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
