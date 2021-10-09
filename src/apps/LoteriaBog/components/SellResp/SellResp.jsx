import { useRef } from "react";
import Button from "../../../../components/Base/Button/Button";
import Voucher from "../Voucher/Voucher";
import { useReactToPrint } from "react-to-print";

const SellResp = ({ sellResponse, setSellResponse, setShowModal, setCustomer }) => {
  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    // pageStyle: "@page {size: 80mm 160mm; margin: 0; padding: 0;}",
  });

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
      <Voucher {...sellResponse} refPrint={printDiv} />
      <div className="flex flex-row justify-around">
        <Button onClick={handlePrint}>Imprimir</Button>
        <Button
          onClick={() => {
            setShowModal(false);
            setSellResponse(null);
            setCustomer({ fracciones: "", phone: "" });
          }}
        >
          Cerrar
        </Button>
      </div>
    </div>
  );
};

export default SellResp;
