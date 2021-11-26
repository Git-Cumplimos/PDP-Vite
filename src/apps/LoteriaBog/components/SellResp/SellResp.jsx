import { useMemo, useRef } from "react";
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
  const printDiv = useRef();

  const { getQuota } = useAuth();
  const { roleInfo } = useAuth();
  const { infoTicket } = useAuth();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    pageStyle: pageStyle,
  });

  const voucherInfo = useMemo(() => {
    const vinfo = {};
    if (!("msg" in sellResponse)) {
      sellResponse.fecha_venta = sellResponse.fecha_venta.replace(/-/g, "/");

      vinfo["Fecha de venta"] = Intl.DateTimeFormat("es-CO", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).format(new Date(sellResponse.fecha_venta));
      vinfo["Hora"] = Intl.DateTimeFormat("es-CO", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
      }).format(new Date(sellResponse.fecha_venta));

      vinfo["Nombre de loteria"] = sellResponse.nom_loteria;
      vinfo.Comercio = roleInfo.id_comercio;
      vinfo["Dirección"] = roleInfo.direccion;
      vinfo.Fracciones = sellResponse.fracciones;
      vinfo["Id Transacción"] = sellResponse.id_Transaccion;
      vinfo["Numero de billete"] = sellResponse.num_billete;
      vinfo.ciudad = roleInfo.ciudad;
      vinfo.Serie = sellResponse.serie;
      vinfo["Valor pagado"] = sellResponse.valor_pago;
      vinfo.id_trx = sellResponse["id_trx"];
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
        "Fecha de venta": voucherInfo["Fecha de venta"],
        Hora: voucherInfo["Hora"],
      },
      commerceInfo: Object.entries({
        "Id Comercio": roleInfo.id_comercio,
        "No. terminal": roleInfo.id_dispositivo,
        Municipio: roleInfo.ciudad,
        Dirección: roleInfo.direccion,
        "Id Trx": sellResponse["id_trx"],
        "Id Transacción": sellResponse.id_Transaccion,
      }),
      commerceName: sellResponse.nom_loteria,
      trxInfo: Object.entries({
        Billete: sellResponse.num_billete,
        Serie: sellResponse.serie,
        Fracciones: sellResponse.fracciones,
        "Valor pago": formatMoney.format(sellResponse.valor_pago),
      }),
      disclamer: "Para quejas o reclamos comuniquese al *num PDP*",
    };
  }, [
    roleInfo.ciudad,
    roleInfo.direccion,
    roleInfo.id_comercio,
    roleInfo.id_dispositivo,
    sellResponse,
    voucherInfo,
  ]);

  useEffect(() => {
    infoTicket(sellResponse["id_trx"], 12, ticket);
  }, [infoTicket, sellResponse, ticket]);

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
      <Voucher {...voucherInfo} refPrint={printDiv} pageStyle={pageStyle} />
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
