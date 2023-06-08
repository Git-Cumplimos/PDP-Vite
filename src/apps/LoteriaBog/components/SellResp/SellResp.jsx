import { useMemo, useRef } from "react";
import Button from "../../../../components/Base/Button";
import Voucher from "../Voucher/Voucher";
import { useReactToPrint } from "react-to-print";
import ButtonBar from "../../../../components/Base/ButtonBar";
import { useAuth } from "../../../../hooks/AuthHooks";
import { useEffect } from "react";
import Tickets from "../../../../components/Base/Tickets";
import { useLoteria } from "../../utils/LoteriaHooks";
import {LineasLot_disclamer} from "../../utils/enum";
import { notify, notifyError } from "../../../../utils/notify";
import TicketsLot from "../TicketsLot/TicketLot"

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const SellResp = ({
  codigos_lot,
  sellResponse,
  setSellResponse,
  closeModal,
  setCustomer,
  selecFrac,
  setSelecFrac,
  fecha_trx
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
    if (!sellResponse?.status) {
      closeModal()
      notifyError(sellResponse?.msg || "Error respuesta PDP: (Fallo al consumir el servicio (loterías) [0010002])")
    }
    else {
      notify("Venta de lotería exitosa")
    }
  }, [sellResponse])

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    pageStyle: pageStyle,
  });

  const ticket = useMemo(() => {
    return {
      title: "VENTA LOTERÍA",
      timeInfo: {
        "Fecha de pago": Intl.DateTimeFormat("es-CO", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(fecha_trx),
        Hora: Intl.DateTimeFormat("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(fecha_trx),
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
      commerceName: sellResponse?.obj?.cod_loteria !== '064' 
      ? sellResponse?.obj?.nom_loteria : sellResponse?.obj?.nom_loteria+" Extraordinario",
      trxInfo: [
        ["Sorteo", sellResponse?.obj?.sorteo],
        ["Fecha del sorteo","Validar"],
        [],
        ["Número",sellResponse?.obj?.num_billete],
        ["Serie", sellResponse?.obj?.serie],
        ["Fracción", sellResponse?.obj?.fisico === true? JSON.stringify(selecFrac).replace(/,/g," - ").replace(/[[]/,"").replace(/]/,"") : JSON.stringify(selecFrac).replace(/[[]/,"").replace(/]/,"")],
        ["Tipo de billete", sellResponse?.obj?.fisico === true ? "Físico" : "Virtual"],
        [],[],
        ["Valor", parseInt(sellResponse?.obj?.tipoPago) ===
        parseInt(operacion?.Venta_Fisica) || 
        parseInt(sellResponse?.obj?.tipoPago) === parseInt(operacion?.Venta_Virtual)
        ? formatMoney.format(sellResponse?.obj?.valor_pago)
        : formatMoney.format(0)],
        [],[],
        ["Forma de pago", parseInt(sellResponse?.obj?.tipoPago) ===
          parseInt(operacion?.Venta_Fisica) || 
          parseInt(sellResponse?.obj?.tipoPago) === parseInt(operacion?.Venta_Virtual)
          ? "Efectivo"
          : "Bono"],
        [],
        [],
    
      ],
      disclamer:
        LineasLot_disclamer[sellResponse?.obj?.nom_loteria],
    };
  }, [roleInfo, sellResponse,operacion,selecFrac,fecha_trx]);
 
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
      <TicketsLot refPrint={printDiv} ticket={ticket} />
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
