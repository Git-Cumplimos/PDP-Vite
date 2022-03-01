import { useState, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../components/Base/Form/Form";
import { useReactToPrint } from "react-to-print";
import Tickets from "../../../components/Base/Tickets/Tickets";
import PaymentSummary from "../../../components/Compound/PaymentSummary/PaymentSummary";
import { useMarketPlace } from "../utils/MarketPlaceHooks";
import { useAuth, infoTicket } from "../../../hooks/AuthHooks";
import Products from "../Products";
import { notifyError } from "../../../utils/notify";

const PayForm = ({ selected, summary }) => {
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

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const {
    infoMarket: { consulta },
    payOrder,
  } = useMarketPlace();
  const params = useParams();

  const [showVoucher, setShowVoucher] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [resOrder, setResOrder] = useState("");
  const { roleInfo, infoTicket } = useAuth();

  const closeModal = () => {
    setShowModal(false);
  };

  const fetchOrder = () => {
    payOrder(params.orden)
      .then((res) => {
        console.log(res);
        setResOrder(res);
        infoTicket(summary?.Trx, 10, tickets);
        setShowVoucher(true);
      })
      .catch((err) => {
        notifyError("Se ha presentado un error, intente mas tarde", err);
      });
  };

  const tickets = useMemo(() => {
    return {
      title: "Recibo de compra",
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
        "Id Trx": summary?.Trx,
      }),
      commerceName: "MARKETPLACE PUNTO DE COMPRA",
      trxInfo: [
        ["Articulos", <Products />],
        ["", ""],
        ["Total compra", summary?.Valor],
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
  ]);

  return (
    <div>
      {!showVoucher ? (
        <Form onSubmit={(e) => e.preventDefault()}>
          <>
            <PaymentSummary summaryTrx={summary}></PaymentSummary>
            <Button type="submit" onClick={fetchOrder}>
              Pagar
            </Button>
          </>
        </Form>
      ) : resOrder?.obj?.status ? (
        <div className="flex flex-col justify-center items-center">
          <Tickets refPrint={printDiv} ticket={tickets} />
          <ButtonBar>
            <Button onClick={handlePrint}>Imprimir</Button>
            <a href={selected?.obj?.redirecciones?.success}>
              <Button onClick={closeModal}>Cerrar</Button>
            </a>
          </ButtonBar>
        </div>
      ) : (
        resOrder?.obj?.status === false && (
          <div className="flex flex-col justify-center items-center">
            <h1>Esta transacción no se pudo realizar</h1>
            <ButtonBar>
              <a href={selected?.obj?.redirecciones?.failed}>
                <Button onClick={closeModal}>Cerrar</Button>
              </a>
            </ButtonBar>
          </div>
        )
      )}
    </div>
  );
};

export default PayForm;
