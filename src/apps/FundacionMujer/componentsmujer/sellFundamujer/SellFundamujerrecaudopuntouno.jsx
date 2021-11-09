import { useRef } from "react";
import Button from "../../../../components/Base/Button/Button";
import Voucher from "../Voucher/Voucherrecaudopuntouno";
import { useReactToPrint } from "react-to-print";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import { useAuth } from "../../../../utils/AuthHooks";

const Sellfundamujerrecaudo = ({
  respuestamujer,
  setRespuestamujer,
  closeModal,
}) => {
  const printDiv = useRef();

  const { getQuota } = useAuth();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
const urls ={
  ticket:"http:transacciones-pdp-dev.us-east-2.elasticbeanstalk.com/transaciones-view?"
}

/* 
const ticket  = useCallback(async () => {
  try {
    const res = await fetchData(urls.ticket, "GET", {
      id_trx:2,
      Tipo_operacion=3,
      Ticket: {} 
    });

    console.log(res);
    return res;
  } catch (err) {
    console.error(err);
  }
}, []);

 */
const voucherInfo = {};



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

  voucherInfo["Mensaje"] = respuestamujer["Mensaje"];
  voucherInfo["Estado"] = respuestamujer["Confirmacion"];
  voucherInfo["Referencia"] = respuestamujer["Referencia"];




  return "msg" ? (
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
