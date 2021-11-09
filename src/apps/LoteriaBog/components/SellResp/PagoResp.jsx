import { useRef } from "react";
import Button from "../../../../components/Base/Button/Button";
import VoucherPago from "../Voucher/VoucherPago";
import { useReactToPrint } from "react-to-print";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import { useAuth } from "../../../../utils/AuthHooks";

const Pagoresp = ({ pagoresponse, setPagoresponse, closeModal}) => {
  const printDiv = useRef();
  
  const { getQuota } = useAuth();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    // pageStyle: "@page {size: 80mm 160mm; margin: 0; padding: 0;}",
  });

  const voucherPagoInfo = {};
  
  const { roleInfo } = useAuth();

  if (!("msg" in pagoresponse)) {
    // pagoresponse.fecha_venta = pagoresponse.fecha_venta.replace(/-/g, "/");

    voucherPagoInfo["Fecha de pago"] = Intl.DateTimeFormat('es-CO', {
       year: "numeric", month: "numeric", day: "numeric"}).format(new Date());
    voucherPagoInfo["Hora"] = Intl.DateTimeFormat('es-CO', {
       hour: "numeric", minute: "numeric", second: "numeric", hour12: false}).format(new Date());

    
    voucherPagoInfo["Nombre de loteria"] ='Lotería de Bogotá'; //pagoresponse.nom_loteria;
    voucherPagoInfo.Comercio = roleInfo['nombre comercio'];
    voucherPagoInfo["Dirección"] = roleInfo.direccion;
    voucherPagoInfo.telefono = roleInfo.telefono;
    voucherPagoInfo["Id_registro"] = pagoresponse['id registro'];
    voucherPagoInfo["Numero de billete"] = pagoresponse['boleto'];
    voucherPagoInfo.Serie = pagoresponse['serie'];
    voucherPagoInfo["Valor pagado"] = pagoresponse['valor ganado'];
    voucherPagoInfo["Valor 17percent"] = pagoresponse['valor 17percent'];
    voucherPagoInfo["Valor 20percent"] = pagoresponse['valor 20percent'];
    voucherPagoInfo["Valor bruto"] = pagoresponse['valor bruto'];
    voucherPagoInfo["No.terminal"] = roleInfo.id_dispositivo;
    voucherPagoInfo["id_transaccion"] = pagoresponse.id;
  }
  console.log(pagoresponse)
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
