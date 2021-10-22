import { useRef } from "react";
import Button from "../../../../components/Base/Button/Button";
import VoucherPago from "../Voucher/VoucherPago";
import { useReactToPrint } from "react-to-print";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import { useAuth } from "../../../../utils/AuthHooks";

const Pagoresp = ({ pagoresponse, setPagoresponse, closeModal, setCustomer }) => {
  const printDiv = useRef();

  const { getQuota } = useAuth();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    // pageStyle: "@page {size: 80mm 160mm; margin: 0; padding: 0;}",
  });

  const voucherPagoInfo = {};
  console.log(pagoresponse)

  if (2===2) {
    // pagoresponse.fecha_venta = pagoresponse.fecha_venta.replace(/-/g, "/");

    voucherPagoInfo["Fecha de pago"] = Intl.DateTimeFormat('es-CO', {
       year: "numeric", month: "numeric", day: "numeric"}).format(new Date());
    voucherPagoInfo["Hora"] = Intl.DateTimeFormat('es-CO', {
       hour: "numeric", minute: "numeric", second: "numeric", hour12: false}).format(new Date());

    // voucherPagoInfo["Nombre de loteria"] = pagoresponse.nom_loteria;
    // voucherPagoInfo.Comercio = pagoresponse.Comercio;
    // voucherPagoInfo["Dirección"] = pagoresponse.Direccion;
    // voucherPagoInfo.Fracciones = pagoresponse.fracciones;
    // voucherPagoInfo["Id Transacción"] = pagoresponse.id_Transaccion;
    voucherPagoInfo["Numero de billete"] = pagoresponse['boleto:'];
    voucherPagoInfo.Serie = pagoresponse['serie:'];
    voucherPagoInfo["Valor pagado"] = pagoresponse['valor ganado:'];
  }

  return "msg" in pagoresponse ? (
    <div className="flex flex-col justify-center items-center">
      <h1>Error: {pagoresponse.msg}</h1>
      <Button
        onClick={(e) => {
          setPagoresponse(null);
        }}
      >
        Volver
      </Button>
    </div>
  ) : (
    <div className="flex flex-col justify-center items-center">
      <VoucherPago {...voucherPagoInfo} refPrint={printDiv} />
      <ButtonBar>
        <Button onClick={handlePrint}>Imprimir</Button>
        <Button
          onClick={() => {
            closeModal();
            setPagoresponse(null);
            //setCustomer({ fracciones: "", phone: "", doc_id: "" });
            getQuota();
          }}
        >
          Cerrar
        </Button>
      </ButtonBar>
    </div>
  );
};

export default Pagoresp;
