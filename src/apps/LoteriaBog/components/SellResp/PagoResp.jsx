import { useMemo, useRef } from "react";
import Button from "../../../../components/Base/Button/Button";
import VoucherPago from "../Voucher/VoucherPago";
import { useReactToPrint } from "react-to-print";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import { useEffect } from "react";
import { useAuth } from "../../../../utils/AuthHooks";
import Tickets from "../../../../components/Base/Tickets/Tickets";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const Pagoresp = ({ pagoresponse, setPagoresponse, closeModal}) => {
  const pageStyle = `
  @page {
    size: 80mm 50mm;
  }

  @media all {
    .pagebreak {
      display: none;
    }
  }

  @media print {
    .pagebreak {
      page-break-before: always;
    }
  }
`;
  const printDiv = useRef();
  
  const { getQuota } = useAuth();

  const { infoTicket } = useAuth();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    pageStyle: pageStyle,
  });

  //const voucherPagoInfo = {};
  
  const { roleInfo } = useAuth();

  const voucherInfo = useMemo(() => {
    const vinfo = {};
    if (!("msg" in pagoresponse)) {
      pagoresponse.fecha_pago = pagoresponse.fecha_pago.replace(/-/g, "/");

      vinfo["Fecha de pago"] = Intl.DateTimeFormat("es-CO", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).format(new Date(pagoresponse.fecha_pago));
      vinfo["Hora"] = Intl.DateTimeFormat("es-CO", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
      }).format(new Date(pagoresponse.fecha_pago));

      vinfo["Nombre de loteria"] = "Lotería de Bogotá";
      vinfo.Comercio = roleInfo.id_comercio;
      vinfo["Dirección"] = roleInfo.direccion;
      vinfo.Fracciones = pagoresponse.fracciones;
      vinfo["Id Transacción"] = pagoresponse.id_Transaccion;
      vinfo["Numero de billete"] = pagoresponse.num_billete;
      vinfo.ciudad = roleInfo.ciudad;
      vinfo.Serie = pagoresponse.serie;          
      vinfo["valor ganado"]=formatMoney.format(pagoresponse["valor bruto"]);
      vinfo["valor 17percent"]=formatMoney.format(pagoresponse["valor 17percent"]);
      vinfo["valor 20percent"]=formatMoney.format(pagoresponse["valor 20percent"]);
      vinfo["Total"]= formatMoney.format(pagoresponse["valor ganado"]);
      vinfo.id_trx = pagoresponse["id_trx"];
      vinfo["No.terminal"] = roleInfo.id_dispositivo;

      return vinfo;
    }
  }, [
    roleInfo.ciudad,
    roleInfo.direccion,
    roleInfo.id_comercio,
    roleInfo.id_dispositivo,
    pagoresponse,
  ]);

  // if (!("msg" in pagoresponse)) {
  //   // pagoresponse.fecha_venta = pagoresponse.fecha_venta.replace(/-/g, "/");

  //   voucherPagoInfo["Fecha de pago"] = Intl.DateTimeFormat('es-CO', {
  //      year: "numeric", month: "numeric", day: "numeric"}).format(new Date());
  //   voucherPagoInfo["Hora"] = Intl.DateTimeFormat('es-CO', {
  //      hour: "numeric", minute: "numeric", second: "numeric", hour12: false}).format(new Date());

    
  //   voucherPagoInfo["Nombre de loteria"] ='Lotería de Bogotá'; //pagoresponse.nom_loteria;
  //   voucherPagoInfo.Comercio = roleInfo['nombre comercio'];
  //   voucherPagoInfo["Dirección"] = roleInfo.direccion;
  //   voucherPagoInfo.telefono = roleInfo.telefono;
  //   voucherPagoInfo["Id_registro"] = pagoresponse['id registro'];
  //   voucherPagoInfo["Numero de billete"] = pagoresponse['boleto'];
  //   voucherPagoInfo.Serie = pagoresponse['serie'];
  //   voucherPagoInfo["Valor pagado"] = pagoresponse['valor ganado'];
  //   voucherPagoInfo["Valor 17percent"] = pagoresponse['valor 17percent'];
  //   voucherPagoInfo["Valor 20percent"] = pagoresponse['valor 20percent'];
  //   voucherPagoInfo["Valor bruto"] = pagoresponse['valor bruto'];
  //   voucherPagoInfo["No.terminal"] = roleInfo.id_dispositivo;
  //   voucherPagoInfo["id_transaccion"] = pagoresponse.id;
  // }

  /////////////////////////////####//////////////////////
  const ticket = useMemo(() => {
    return {
      title: "Recibo de pago",
      timeInfo: {
        "Fecha de pago": voucherInfo["Fecha de pago"],
        Hora: voucherInfo["Hora"],
      },
      commerceInfo: Object.entries({
        "Id Comercio": roleInfo.id_comercio,
        "No. terminal": roleInfo.id_dispositivo,
        Municipio: roleInfo.ciudad,
        Dirección: roleInfo.direccion,
        "Id Trx": pagoresponse["id_trx"],
        "Id Transacción": pagoresponse.id_Transaccion,
      }),
      commerceName: pagoresponse.nom_loteria,
      trxInfo: Object.entries({
        Sorteo:pagoresponse["Numero sorteo"],
        Billete: pagoresponse.num_billete,
        Serie: pagoresponse.serie,
        Fracciones: pagoresponse.fracciones,           
        "Premio": formatMoney.format(pagoresponse["valor bruto"]),
        "valor 17%":formatMoney.format(pagoresponse["valor 17percent"]),
        "valor 20%":formatMoney.format(pagoresponse["valor 20percent"]),
        "Total": formatMoney.format(pagoresponse["valor ganado"]),   
      }),
      disclamer: "Para quejas o reclamos comuniquese al *num PDP*",
    };
  }, [
    roleInfo.ciudad,
    roleInfo.direccion,
    roleInfo.id_comercio,
    roleInfo.id_dispositivo,
    pagoresponse,
    voucherInfo,
  ]);
  useEffect(() => {
    infoTicket(pagoresponse["id_trx"],13,ticket);
  }, [infoTicket, pagoresponse, ticket]);
  console.log(pagoresponse)
  //////////////////////////////////////////
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
      <Tickets
              refPrint={printDiv}
              ticket={ticket}
            />      
      {/* <VoucherPago {...voucherPagoInfo} refPrint={printDiv} /> */}
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
