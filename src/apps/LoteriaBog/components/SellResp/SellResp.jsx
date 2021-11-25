import { useRef } from "react";
import Button from "../../../../components/Base/Button/Button";
import Voucher from "../Voucher/Voucher";
import { useReactToPrint } from "react-to-print";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import { useAuth } from "../../../../utils/AuthHooks";

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
    voucherInfo.Id_registro = sellResponse['id registro'];
    voucherInfo["No.terminal"] = roleInfo.id_dispositivo;
  }

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
