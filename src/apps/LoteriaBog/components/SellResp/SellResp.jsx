import { useMemo, useRef } from "react";
import Button from "../../../../components/Base/Button";
import Voucher from "../Voucher/Voucher";
import { useReactToPrint } from "react-to-print";
import ButtonBar from "../../../../components/Base/ButtonBar";
import { useAuth } from "../../../../hooks/AuthHooks";
import { useEffect } from "react";
import Tickets from "../../../../components/Base/Tickets";
import { useLoteria } from "../../utils/LoteriaHooks";
import { notifyError } from "../../../../utils/notify";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const SellResp = ({
  sellResponse,
  setSellResponse,
  closeModal,
  setCustomer,
}) => {
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
  const { tiposOperaciones } = useLoteria();

  const operacion = useMemo(() => {
    return tiposOperaciones;
  }, [tiposOperaciones]);

  const printDiv = useRef();

  const { getQuota } = useAuth();
  const { roleInfo } = useAuth();
  const { infoTicket } = useAuth();

  useEffect(() => {
    if (!sellResponse?.status){
      closeModal()
      notifyError(sellResponse?.msg || "Error respuesta PDP: (Fallo al consumir el servicio (loterías) [0010002])")
    }
  }, [sellResponse])
  
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    pageStyle: pageStyle,
  });
  const voucherInfo = useMemo(() => {
    const vinfo = {};
    if (sellResponse?.status) {
      sellResponse.obj.fecha_venta = sellResponse?.obj?.fecha_venta.replace(/-/g, "/");

      vinfo["Fecha de venta"] = Intl.DateTimeFormat("es-CO", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).format(new Date(sellResponse?.obj?.fecha_venta));
      vinfo["Hora"] = Intl.DateTimeFormat("es-CO", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
      }).format(new Date(sellResponse?.obj?.fecha_venta));

      vinfo["Nombre de loteria"] = sellResponse?.obj?.nom_loteria;
      vinfo.Comercio = roleInfo.id_comercio;
      vinfo["Dirección"] = roleInfo.direccion;
      vinfo.Fracciones = sellResponse?.obj?.fracciones;
      vinfo["Id Transacción"] = sellResponse?.obj?.id_Transaccion;
      vinfo["Numero de billete"] = sellResponse?.obj?.num_billete;
      vinfo.ciudad = roleInfo.ciudad;
      vinfo.Serie = sellResponse?.obj?.serie;
      vinfo["Valor pagado"] = sellResponse?.obj?.valor_pago;
      vinfo.id_trx = sellResponse?.obj?.["id_trx"];
      vinfo["No.terminal"] = roleInfo.id_dispositivo;

      return vinfo;
    }
  }, [
    roleInfo.ciudad,
    roleInfo.direccion,
    roleInfo.id_comercio,
    roleInfo.id_dispositivo,
    sellResponse,
  ]);

  const ticket = useMemo(() => {
    return {
      title: "Recibo de pago",
      timeInfo: {
        "Fecha de pago": Intl.DateTimeFormat("es-CO", {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date()),
        Hora: Intl.DateTimeFormat("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date()),
      },
      commerceInfo: [
        ["Id Comercio", roleInfo?.id_comercio],
        ["No. terminal", roleInfo?.id_dispositivo],
        ["Id Trx ", sellResponse?.obj?.id_trx],
        ["Id Aut ", sellResponse?.obj?.id_trx],
        ["Comercio", roleInfo?.["nombre comercio"]],
        ["", ""],
        ["Dirección", roleInfo?.direccion],
        ["", ""],
      ],
      commerceName: sellResponse?.obj?.nom_loteria,
      trxInfo: [
        ["Sorteo", sellResponse?.obj?.sorteo],
        ["Billete", sellResponse?.obj?.num_billete],
        ["Serie", sellResponse?.obj?.serie],
        ["Fracción", sellResponse?.obj?.fracciones],
        ["Tipo de Billete", sellResponse?.obj?.fisico === true ? "Físico" : "Virtual"],
        ["", ""],
        ["Valor", formatMoney.format(sellResponse?.obj?.valor_pago)],
        ["", ""],
        ["Forma de Pago", parseInt(sellResponse?.obj?.tipoPago) ===
          parseInt(operacion?.Venta_Fisica) || sellResponse?.obj?.fisico == false
          ? "Efectivo"
          : "Bono"],
        ["", ""],
      ],
      disclamer:
        "Para quejas o reclamos comuníquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
    };
  }, [roleInfo, sellResponse, voucherInfo]);

  return !sellResponse?.status ? (
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
      <Tickets refPrint={printDiv} ticket={ticket} />
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
