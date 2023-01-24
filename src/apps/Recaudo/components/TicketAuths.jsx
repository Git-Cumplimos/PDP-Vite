import { useMemo } from "react";
// import Tickets from "../../../components/Base/Tickets";
// import TicketsPines from "../../PinesVus/components/TicketsPines";
// import TicketColpatria from "../../Colpatria/components/TicketColpatria";
import TicketsDavivienda from "../../Corresponsalia/CorresponsaliaDavivienda/components/TicketsDavivienda";
import { useAuth } from "../../../hooks/AuthHooks";
import { makeMoneyFormatter } from "../../../utils/functions";

const status_trx = true;
const formatMoney = makeMoneyFormatter(2);
const dateFormatter = Intl.DateTimeFormat("es-CO", {
  year: "2-digit",
  month: "2-digit",
  day: "2-digit",
});
const timeFormatter = Intl.DateTimeFormat("es-CO", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/**
 *
 * @param {number} id_autorizador Id del autorizador
 * @param {object} paymentInfo Informacion del resultado de la transaccion
 * @param {object} roleInfo informacion del usuario
 * @param {object} infoConvenio Informacion de la consulta del convenio
 * @param {Array} referencias Referencias del recaudo
 * @returns object de ticket
 */
export const buildTicket = (
  id_autorizador,
  paymentInfo,
  roleInfo,
  infoConvenio,
  referencias
) => {
  let title = "";
  let disclamer = "";
  let commerceName = "";
  const timeInfo = {
    "Fecha de venta": dateFormatter.format(new Date()),
    Hora: timeFormatter.format(new Date()),
  };
  const commerceInfo = [];
  const trxInfo = [];

  switch (id_autorizador) {
    case 13:
      title = "Recibo de Pago de Recaudo de Facturas";
      commerceName = roleInfo?.["nombre comercio"] ?? "Sin datos";
      disclamer =
        "Línea de atención personalizada: #688\nMensaje de texto: 85888";

      commerceInfo.push(
        ["Id comercio", roleInfo?.id_comercio ?? 0],
        [
          "No. terminal",
          paymentInfo?.datos_adicionales?.num_terminal ??
            roleInfo?.id_dispositivo ??
            0,
        ],
        ["Municipio", roleInfo?.ciudad ?? "Sin datos"],
        ["Dirección", roleInfo?.direccion ?? "Sin datos"],
        ["Tipo de operación", "Recaudo de facturas"],
        ["", ""],
        [
          "No. de aprobación Banco",
          paymentInfo?.cod_autorizacion ?? paymentInfo?.id_transaccion,
        ],
        ["", ""]
      );

      trxInfo.push(
        ["Convenio", infoConvenio?.nombre],
        ["", ""],
        ["Código convenio", infoConvenio?.codigo],
        ["", ""],
        ...referencias
          .map(([_, val], ind) => [`Referencia ${ind + 1}`, val])
          .reduce((list, elem, i) => {
            list.push(elem);
            if ((i + 1) % 1 === 0) list.push(["", ""]);
            return list;
          }, []),
        ["Valor", formatMoney.format(paymentInfo?.valor)],
        ["", ""],
        ["Costo transacción", formatMoney.format(0)],
        ["", ""],
        ["Total", formatMoney.format(paymentInfo?.valor)],
        ["", ""]
      );
      break;

    // case 14:
    //   title = "Recibo de pago";
    //   commerceName = "Recaudo PSP";
    //   disclamer =
    //     "Para cualquier reclamo es indispensable presentar este recibo o comuníquese a los Tel. en Bogotá 7561616 o gratis en el resto del país 018000-522222.";

    //   commerceInfo.push(
    //     ["No. Terminal", roleInfo?.id_dispositivo],
    //     ["Teléfono", roleInfo?.telefono],
    //     ["Id Trx", paymentInfo?.id_transaccion ?? 0],
    //     ["Id Aut", paymentInfo?.cod_autorizacion ?? 0],
    //     ["Comercio", roleInfo?.["nombre comercio"]],
    //     ["", ""],
    //     ["Dirección", roleInfo?.direccion],
    //     ["", ""]
    //     // ["Id Transacción", res?.obj?.IdTransaccion],
    //   );
    //   trxInfo.push(
    //     ...[
    //       ["Convenio", infoConvenio?.nombre],
    //       ...referencias
    //         .reduce((list, elem, i) => {
    //           list.push(elem);
    //           if ((i + 1) % 1 === 0) list.push(["", ""]);
    //           return list;
    //         }, []),
    //       ["Valor", formatMoney.format(paymentInfo?.valor)],
    //     ].reduce((list, elem, i) => {
    //       list.push(elem);
    //       if ((i + 1) % 1 === 0) list.push(["", ""]);
    //       return list;
    //     }, [])
    //   );
    //   break;

    // case 17:
    //   title = "Recibo de Pago";
    //   commerceName = "Recaudo de facturas";
    //   disclamer =
    //     "Corresponsal bancario para Banco de Occidente. La impresión de este tiquete implica su aceptación, verifique la información. Este es el unico recibo oficial de pago. Requerimientos 018000 514652.";
    //   commerceInfo.push(
    //     /*id transaccion recarga*/
    //     /*id_dispositivo*/
    //     [
    //       "No. Terminal",
    //       roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 0,
    //     ],
    //     /*telefono*/
    //     ["Teléfono", roleInfo?.telefono ? roleInfo?.telefono : "Sin datos"],
    //     /*Id trx*/
    //     ["Id Trx", paymentInfo?.id_transaccion],
    //     /*Id Aut*/
    //     ["Id Aut", paymentInfo?.cod_autorizacion],
    //     /*comercio*/
    //     [
    //       "Comercio",
    //       roleInfo?.["nombre comercio"]
    //         ? roleInfo?.["nombre comercio"]
    //         : "Sin datos",
    //     ],
    //     ["", ""],
    //     /*direccion*/
    //     ["Dirección", roleInfo?.direccion ? roleInfo?.direccion : "Sin datos"],
    //     ["", ""]
    //   );
    //   trxInfo.push(
    //     ["Convenio", infoConvenio?.nombre],
    //     ["", ""],
    //     // ["Código convenio", convenio.nura],
    //     // ["", ""],
    //     ...referencias
    //       .map(([_, val], ind) => ["Referencia de pago", val])
    //       .reduce((list, elem, i) => {
    //         list.push(elem);
    //         if ((i + 1) % 1 === 0) list.push(["", ""]);
    //         return list;
    //       }, []),
    //     ["Valor", formatMoney.format(paymentInfo?.valor)],
    //     ["", ""]
    //   );
    //   break;

    // case 16:
    //   title = "Recibo de Pago";
    //   commerceName = "Recaudo de facturas";
    //   disclamer =
    //     "En caso de reclamo o inquietud favor comunicarse en Bogota al Tel 594-8500 o gratis en el resto del pais al 01800-915000 o la pagina web http://www.bancoagrario.gov.co";
    //   commerceInfo.push(
    //     /*id transaccion recarga*/
    //     /*comercio*/
    //     [
    //       "Comercio",
    //       roleInfo?.["nombre comercio"]
    //         ? roleInfo?.["nombre comercio"]
    //         : "Sin datos",
    //     ],
    //     /*id_dispositivo*/
    //     [
    //       "No. Terminal",
    //       roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 0,
    //     ],
    //     /*direccion*/
    //     ["Dirección", roleInfo?.direccion ? roleInfo?.direccion : "Sin datos"],
    //     /*telefono*/
    //     ["Teléfono", roleInfo?.telefono ? roleInfo?.telefono : "Sin datos"],
    //     ["Id Trx", paymentInfo?.id_transaccion],
    //     ["Id Aut", paymentInfo?.cod_autorizacion],
    //     ["", ""]
    //   );

    //   trxInfo
    //     .push(
    //     ["Convenio", infoConvenio?.nombre],
    //     ["", ""],
    //     // ["Código convenio", convenio.nura],
    //     // ["", ""],
    //     ...referencias
    //       .map(([_, val], ind) => [`Referencia de pago ${ind + 1}`, val])
    //       .reduce((list, elem, i) => {
    //         list.push(elem);
    //         if ((i + 1) % 1 === 0) list.push(["", ""]);
    //         return list;
    //       }, []),
    //     [
    //       "Valor",
    //       formatMoney.format(paymentInfo?.valor),
    //     ],
    //     ["", ""]
    //     );
    //   break;

    // case 43:
    //   break;

    default:
      throw new Error("Autorizador no configurado, para ceacion de ticket");
  }
  return {
    title,
    timeInfo,
    commerceInfo,
    commerceName,
    trxInfo,
    disclamer,
  };
};

const TicketAuths = ({
  id_autorizador,
  printDiv,
  paymentInfo,
  infoConvenio,
  referencias,
}) => {
  const { roleInfo } = useAuth();

  const ticket = useMemo(
    () =>
      buildTicket(
        id_autorizador,
        paymentInfo,
        roleInfo,
        infoConvenio,
        referencias
      ),
    [id_autorizador, paymentInfo, roleInfo, infoConvenio, referencias]
  );

  switch (id_autorizador) {
    case 13:
      return (
        <TicketsDavivienda
          refPrint={printDiv}
          ticket={ticket}
          stateTrx={status_trx}
        />
      );
    // case 14:
    //   return (
    //     <TicketColpatria
    //       refPrint={printDiv}
    //       ticket={ticket}
    //       stateTrx={status_trx}
    //     />
    //   );
    // case 17:
    //   return (
    //     <TicketsAval
    //       refPrint={printDiv}
    //       ticket={ticket}
    //       stateTrx={status_trx}
    //     />
    //   );
    // case 16:
    //   return (
    //     <TicketsAgrario
    //       refPrint={printDiv}
    //       ticket={ticket}
    //       stateTrx={status_trx}
    //     />
    //   );
    // case 43:
    //   return (
    //     <div ref={printDiv}>
    //       {ticket?.ticket2 ? (
    //         <>
    //           <TicketsPines
    //             refPrint={null}
    //             ticket={ticket?.ticket1}
    //             stateTrx={status_trx}
    //             logo="LogoMiLicensia"
    //           />
    //           <TicketsPines
    //             refPrint={null}
    //             ticket={ticket?.ticket2}
    //             stateTrx={status_trx}
    //             logo="LogoVus"
    //           />
    //         </>
    //       ) : (
    //         <Tickets refPrint={null} ticket={ticket} stateTrx={status_trx} />
    //       )}
    //     </div>
    //   );
    default:
      throw new Error("Autorizador no configurado, para ceacion de ticket");
    // return (
    //   <Tickets refPrint={printDiv} ticket={ticket} stateTrx={status_trx} />
    // );
  }
};

export default TicketAuths;
