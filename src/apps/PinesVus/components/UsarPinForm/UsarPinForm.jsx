import { useRef, useMemo, useState } from "react";
import Button from "../../../../components/Base/Button";
import Voucher from "../Voucher/Tickets";
import { useReactToPrint } from "react-to-print";
import ButtonBar from "../../../../components/Base/ButtonBar";
import { useAuth, infoTicket } from "../../../../hooks/AuthHooks";
import Form from "../../../../components/Base/Form";
import { notify, notifyError } from "../../../../utils/notify";
import { usePinesVus } from "../../utils/pinesVusHooks";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const UsarPinForm = ({ respPin, closeModal, valor }) => {
  const printDiv = useRef();

  const { getQuota, roleInfo } = useAuth();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    // pageStyle: "@page {size: 80mm 160mm; margin: 0; padding: 0;}",
  });

  const { usarPinVus } = usePinesVus();
  const [disabledBtn, setDisabledBtn] = useState(false);
  // const tickets = useMemo(() => {
  //   return {
  //     title: "Recibo de pago(Desembolso)",
  //     timeInfo: {
  //       "Fecha de pago": Intl.DateTimeFormat("es-CO", {
  //         year: "numeric",
  //         month: "numeric",
  //         day: "numeric",
  //       }).format(new Date()),
  //       Hora: Intl.DateTimeFormat("es-CO", {
  //         hour: "numeric",
  //         minute: "numeric",
  //         second: "numeric",
  //         hour12: false,
  //       }).format(new Date()),
  //     },
  //     commerceInfo: Object.entries({
  //       "Id Comercio": roleInfo?.id_comercio,
  //       "No. terminal": roleInfo?.id_dispositivo,
  //       Municipio: roleInfo?.ciudad,
  //       Dirección: roleInfo?.direccion,
  //       "Id Trx": respPago?.id_trx,
  //       "Id Confirmación": "0000",
  //     }),
  //     commerceName: "FUNDACIÓN DE LA MUJER",
  //     trxInfo: [
  //       ["CRÉDITO", "0000"],
  //       ["VALOR", formatMoney.format(respPago?.ValorDesembolso)],
  //       ["Cliente", respPago?.NombresCliente],
  //       ["", ""],
  //       ["Cédula", respPago?.Cedula],
  //       ["", ""],
  //     ],
  //     disclamer:
  //       "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
  //   };
  // }, [
  //   roleInfo?.ciudad,
  //   roleInfo?.direccion,
  //   roleInfo?.id_comercio,
  //   roleInfo?.id_dispositivo,
  //   respPago,
  // ]);
  const onSubmitUsar = (e) => {
    e.preventDefault();
    setDisabledBtn(true);
    usarPinVus(respPin, valor, roleInfo)
      .then((res) => {
        console.log(res);
        setDisabledBtn(false);
        if (res?.status == false) {
          notifyError(res?.msg);
        } else {
          notify(res?.msg);
        }
      })
      .catch((err) => console.log("error", err));
  };

  return (
    <div className="flex flex-col justify-center items-center">
      {/* <Voucher ticket={tickets} refPrint={printDiv} /> */}
      <div className="flex flex-col w-1/2 mx-auto">
        <h1 className="text-3xl mt-3 mx-auto">Usar Pin</h1>
        <br></br>
        {Object.entries(respPin).map(([key, val]) => {
          return (
            <>
              <div
                className="flex flex-row justify-between text-lg font-medium"
                key={key}
              >
                <h1>{key}</h1>
                <h1>{val}</h1>
              </div>
            </>
          );
        })}
      </div>
      <Form onSubmit={onSubmitUsar}>
        <ButtonBar>
          <Button type="submit" disabled={disabledBtn}>
            Usar Pin
          </Button>
          <Button
            onClick={() => {
              closeModal();
              // setrespPago();
              // getQuota();
            }}
          >
            Cancelar
          </Button>
        </ButtonBar>
      </Form>
    </div>
  );
};
export default UsarPinForm;
