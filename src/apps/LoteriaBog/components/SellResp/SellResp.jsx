import { useRef } from "react";
import Button from "../../../../components/Base/Button/Button";
import Voucher from "../Voucher/Voucher";
import { useReactToPrint } from "react-to-print";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";

const SellResp = ({ sellResponse, setSellResponse, closeModal, setCustomer }) => {
  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    // pageStyle: "@page {size: 80mm 160mm; margin: 0; padding: 0;}",
  });

  const voucherInfo = {};

  if (!("msg" in sellResponse)) {
    voucherInfo.Comercio = sellResponse.Comercio;
    voucherInfo["Dirección"] = sellResponse.Direccion;
    voucherInfo["Fecha de venta"] = Intl.DateTimeFormat('es-CO', {
      year: "numeric", month: "numeric", day: "numeric"
    }).format(new Date(sellResponse.fecha_venta));
    voucherInfo["Hora de venta"] = Intl.DateTimeFormat('es-CO', {
      hour: "numeric", minute: "numeric"
    }).format(new Date(sellResponse.fecha_venta));
    voucherInfo.Fracciones = sellResponse.fracciones;
    // voucherInfo.Hash = sellResponse.;
    voucherInfo["Id Transacción"] = sellResponse.id_Transaccion;
    voucherInfo["Numero de billete"] = sellResponse.num_loteria;
    voucherInfo.Serie = sellResponse.serie;
    voucherInfo["Valor pagado"] = sellResponse.valor_pago;
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
      <Voucher {...voucherInfo} refPrint={printDiv} />
      <ButtonBar>
        <Button onClick={handlePrint}>Imprimir</Button>
        <Button
          onClick={() => {
            closeModal();
            setSellResponse(null);
            setCustomer({ fracciones: "", phone: "", doc_id: "" });
          }}
        >
          Cerrar
        </Button>
      </ButtonBar>
    </div>
  );
};

export default SellResp;
