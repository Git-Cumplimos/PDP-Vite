import { useRef } from "react";
import Button from "../../../../components/Base/Button/Button";
import Voucher from "../Voucher/Voucherreimpresion";
import { useReactToPrint } from "react-to-print";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import { useAuth } from "../../../../utils/AuthHooks";

const Sellfundamujerrecaudo = ({ respuestamujer, setRespuestamujer, closeModal,}) => {
  const printDiv = useRef();

  const { getQuota } = useAuth();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
 
  const voucherInfo = {};
  

  console.log(respuestamujer)
  
  voucherInfo["Fecha de venta"] = Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).format(new Date());
    voucherInfo["Hora"] = Intl.DateTimeFormat("es-CO", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    }).format(new Date());  
  

    voucherInfo["Nombre"] =  respuestamujer["Nombre"]; 
    voucherInfo["Documento"] =  respuestamujer["Documento"];  
    voucherInfo["Documento"] =  respuestamujer["Documento"];  
    voucherInfo["label"] =  respuestamujer["label"];  
    voucherInfo["operacion"] =  respuestamujer["operacion"];  
    voucherInfo["value"] =  respuestamujer["value"];  
    voucherInfo["id"] =  respuestamujer["id"];  

  return "msg" ? (
    <div className="flex flex-col justify-center items-center">
      <Voucher {...voucherInfo} refPrint={printDiv} />
      <ButtonBar>
        <Button onClick={handlePrint}>Imprimir</Button>
        <Button
          onClick={() => {
            closeModal();
            setRespuestamujer()
            getQuota();
          }}
        >
          Cerrar
        </Button>
      </ButtonBar>
    </div>
  ) : (
    <div className="flex flex-col justify-center items-center">
      <Voucher {...voucherInfo} refPrint={printDiv} />
      <ButtonBar>
        <Button onClick={handlePrint}>Imprimir</Button>
        <Button
          onClick={() => {
            closeModal();
            setRespuestamujer();
            getQuota();
          
          }}
        >
          Cerrar
        </Button>
      </ButtonBar>
    </div>
  );
};
export default Sellfundamujerrecaudo;
