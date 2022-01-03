import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import { useReactToPrint } from "react-to-print";
import VoucherMarket from "../Voucher/VoucherMarket";
import { useMarketPlace } from "../utils/MarketPlaceHooks";
//import { useAuth } from "../../../../hooks/AuthHooks";

const PayForm = ({ selected }) => {
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
    // pageStyle: "@page {size: 80mm 160mm; margin: 0; padding: 0;}",
  });

  const { payOrder } = useMarketPlace();
  const params = useParams();

  const [showVoucher, setShowVoucher] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const closeModal = () => {
    setShowModal(false);
  };

  const fetchOrder = () => {
    payOrder(params.orden).then((res) => {
      console.log(res);
    });
    setShowVoucher(true);
  };
  console.log(selected);
  return (
    <div>
      {!showVoucher ? (
        <Form onSubmit={(e) => e.preventDefault()}>
          <div>
            {"Id de transacción:" + " " + selected?.obj?.Id_Trx}
            <br />
            {"Estado:" + " " + selected?.EstadoTrx}
            <br />
            {"Valor de la transacción:" + " " + selected?.obj?.valor}
            <Button type="submit" onClick={fetchOrder}>
              Pagar
            </Button>
          </div>
        </Form>
      ) : (
        <div className="flex flex-col justify-center items-center">
          <VoucherMarket refPrint={printDiv} pageStyle={pageStyle} />
          <ButtonBar>
            <Button onClick={handlePrint}>Imprimir</Button>
            <a href="http://localhost:3001">
              <Button onClick={closeModal}>Cerrar</Button>
            </a>
          </ButtonBar>
        </div>
      )}
    </div>
  );
};

export default PayForm;
