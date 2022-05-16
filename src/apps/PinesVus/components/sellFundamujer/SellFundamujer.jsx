import { useRef, useMemo } from "react";
import Button from "../../../../components/Base/Button";
import Voucher from "../Voucher/Tickets";
import { useReactToPrint } from "react-to-print";
import ButtonBar from "../../../../components/Base/ButtonBar";
import { useAuth, infoTicket } from "../../../../hooks/AuthHooks";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const Sellfundamujer = ({
  respPago,
  setRespPago,
  closeModal /* setCustomer */,
}) => {
  const printDiv = useRef();

  const { getQuota, roleInfo } = useAuth();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    // pageStyle: "@page {size: 80mm 160mm; margin: 0; padding: 0;}",
  });

  // const voucherInfo = {};

  // voucherInfo["Fecha de venta"] = Intl.DateTimeFormat("es-CO", {
  //   year: "numeric",
  //   month: "numeric",
  //   day: "numeric",
  // }).format(new Date());
  // voucherInfo["Hora"] = Intl.DateTimeFormat("es-CO", {
  //   hour: "numeric",
  //   minute: "numeric",
  //   second: "numeric",
  //   hour12: false,
  // }).format(new Date());

  // voucherInfo["Estado"] = respPago?.obj.Estado;
  // voucherInfo["Nombre"] = respPago?.obj["Nombres Cliente"];
  // voucherInfo["Documento"] = respPago?.obj.Documento;
  // voucherInfo["pin"] = respPago?.obj.Pin;
  // voucherInfo["Valordesembolso"] = respPago?.obj["Valor desembolso"];
  // voucherInfo["idtrx"] = respPago?.obj["id_trx"];
  const tickets = useMemo(() => {
    return {
      title: "Recibo de pago(Desembolso)",
      timeInfo: {
        "Fecha de pago": Intl.DateTimeFormat("es-CO", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }).format(new Date()),
        Hora: Intl.DateTimeFormat("es-CO", {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
        }).format(new Date()),
      },
      commerceInfo: Object.entries({
        "Id Comercio": roleInfo?.id_comercio,
        "No. terminal": roleInfo?.id_dispositivo,
        Municipio: roleInfo?.ciudad,
        Dirección: roleInfo?.direccion,
        "Id Trx": respPago?.id_trx,
        "Id Confirmación": "0000",
      }),
      commerceName: "FUNDACIÓN DE LA MUJER",
      trxInfo: [
        ["CRÉDITO", "0000"],
        ["VALOR", formatMoney.format(respPago?.ValorDesembolso)],
        ["Cliente", respPago?.NombresCliente],
        ["", ""],
        ["Cédula", respPago?.Cedula],
        ["", ""],
      ],
      disclamer:
        "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
    };
  }, [
    roleInfo?.ciudad,
    roleInfo?.direccion,
    roleInfo?.id_comercio,
    roleInfo?.id_dispositivo,
    respPago,
  ]);
  console.log(respPago);
  return (
    <div className="flex flex-col justify-center items-center">
      <Voucher ticket={tickets} refPrint={printDiv} />
      <ButtonBar>
        <Button onClick={handlePrint}>Imprimir</Button>
        <Button
          onClick={() => {
            closeModal();
            // setrespPago();
            // getQuota();
          }}
        >
          Cerrar
        </Button>
      </ButtonBar>
    </div>
  );
};
export default Sellfundamujer;
