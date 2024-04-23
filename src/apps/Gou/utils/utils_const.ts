export const constMsgTrx: { [key: string]: string } = {
  Search: "Estamos identificando tu transacción, por favor esperar un momento",
  Indefinite:
    "Estado de la transacción desconocido, dirigirse al modulo de transacciones",
  Desconocida:
    "Estado de la transacción desconocido, dirigirse al modulo de transacciones",
  Pendiente: "Transacción pendiente, por favor esperar un momento",
  "Pendiente.":
    "Transacción pendiente, dirigirse al modulo de transacciones para ver su estado final",
  Aprobada: "Su transacción ha sido aprobada",
  Rechazada: "Su transacción ha sido rechazada",
};

export const constOrderSummary = [
  "Tipo de trámite",
  "Num referencia",
  "Id transacción",
  "Estado de la transacción",
  "Fecha",
];

export const constRelationshipSummary = {
  tipo_tramite: constOrderSummary[0],
  referencia: constOrderSummary[1],
  id_trx: constOrderSummary[2],
  status: constOrderSummary[3],
  fecha: constOrderSummary[4],
};
