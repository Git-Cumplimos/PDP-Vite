import { useRef } from "react";
import Button from "../../../../components/Base/Button/Button";
import Voucher from "../Voucher/Voucher";
import { useReactToPrint } from "react-to-print";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import { useAuth } from "../../../../utils/AuthHooks";
import { useEffect } from "react";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const SellResp = ({ sellResponse, setSellResponse, closeModal, setCustomer }) => {
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
  const { roleInfo } = useAuth();
  const { infoTicket } = useAuth();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
      pageStyle:pageStyle
  });

  const voucherInfo = {};

  if (!("msg" in sellResponse)) {
    sellResponse.fecha_venta = sellResponse.fecha_venta.replace(/-/g, "/");

    voucherInfo["Fecha de venta"] = Intl.DateTimeFormat('es-CO', {
      year: "numeric", month: "numeric", day: "numeric"
    }).format(new Date(sellResponse.fecha_venta));
    voucherInfo["Hora"] = Intl.DateTimeFormat('es-CO', {
      hour: "numeric", minute: "numeric", second: "numeric", hour12: false
    }).format(new Date(sellResponse.fecha_venta));

    voucherInfo["Nombre de loteria"] = sellResponse.nom_loteria;
    voucherInfo.Comercio = roleInfo.id_comercio;
    voucherInfo["Dirección"] = roleInfo.direccion;
    voucherInfo.Fracciones = sellResponse.fracciones;
    voucherInfo["Id Transacción"] = sellResponse.id_Transaccion;
    voucherInfo["Numero de billete"] = sellResponse.num_billete;
    voucherInfo.ciudad = roleInfo.ciudad;
    voucherInfo.Serie = sellResponse.serie;
    voucherInfo["Valor pagado"] = sellResponse.valor_pago;
    voucherInfo.id_trx = sellResponse['id_trx'];
    voucherInfo["No.terminal"] = roleInfo.id_dispositivo;
  }

  const ticket = {
    title: "Recibo de pago",
    timeInfo: { "Fecha de venta": voucherInfo["Fecha de venta"], Hora: voucherInfo["Hora"] },
    commerceInfo: {
      "Id Comercio": roleInfo.id_comercio,
      "No. terminal": roleInfo.id_dispositivo,
      Municipio: roleInfo.ciudad,
      Dirección: roleInfo.direccion,
      "Id Trx": sellResponse['id_trx'],
      "Id Transacción": sellResponse.id_Transaccion,
    },
    commerceName: sellResponse.nom_loteria,
    trxInfo: {
      Billete: sellResponse.num_billete,
      Serie: sellResponse.serie,
      Fracciones: sellResponse.fracciones,
      "Valor pago": formatMoney.format(sellResponse.valor_pago),
    },
    disclamer: "Para quejas o reclamos comuniquese al *num PDP*",
  }

  useEffect(() => {
    infoTicket(sellResponse['id_trx'],12,ticket)
    
  }, [])

  

  return "msg" in sellResponse ? (
    <div className="flex flex-col justify-center items-center">
      <h1>Error: {sellResponse.msg}</h1>
      <Button
        onClick={(e) => {
          setSellResponse(null);
        }}
      >
        Volver
      </Button>
    </div>
  ) : (
    <div className="flex flex-col justify-center items-center">
      <Voucher {...voucherInfo} refPrint={printDiv} pageStyle={pageStyle}/>
      <ButtonBar>
        <Button onClick={handlePrint}>Imprimir</Button>
        <Button
          onClick={() => {
            closeModal();
            setSellResponse(null);
            setCustomer({ fracciones: "", phone: "", doc_id: "" });
            getQuota();
          }}
        >
          Cerrar
        </Button>
      </ButtonBar>
    </div>
  );
};

export default SellResp;
