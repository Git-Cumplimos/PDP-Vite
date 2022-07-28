import { useRef, useMemo, useState, useEffect } from "react";
import Button from "../../../../components/Base/Button";
import Tickets from "../../../../components/Base/Tickets";
import { useReactToPrint } from "react-to-print";
import ButtonBar from "../../../../components/Base/ButtonBar";
import { useAuth } from "../../../../hooks/AuthHooks";
import Form from "../../../../components/Base/Form";
import { notify, notifyError } from "../../../../utils/notify";
import { usePinesVus } from "../../utils/pinesVusHooks";
import TextArea from "../../../../components/Base/TextArea";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const CancelPin = ({
  respPin,
  valor,
  valor_tramite,
  name_tramite,
  id_pin,
  trx,
  tipoPin,
  closeModal,
  setActivarNavigate,
}) => {
  const { cancelPinVus, con_estado_tipoPin } = usePinesVus();

  const printDiv = useRef();

  const { roleInfo, infoTicket } = useAuth();

  const [optionsTipoPines, setOptionsTipoPines] = useState([]);

  useEffect(() => {
    con_estado_tipoPin("tipo_pines_vus")
      .then((res) => {

        if (!res?.status) {
          notifyError(res?.msg);
        } else {
          setOptionsTipoPines(res?.obj?.results);
        }
      })
      .catch((err) => console.log("error", err));
  }, []);

  const textTipoPin = useMemo(() => {
    const resp = optionsTipoPines?.filter((id) => id.id === tipoPin);
    return resp[0]?.descripcion.toUpperCase();
  }, [optionsTipoPines, tipoPin]);

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    // pageStyle: "@page {size: 80mm 160mm; margin: 0; padding: 0;}",
  });

  const [disabledBtn, setDisabledBtn] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [respPinCancel, setRespPinCancel] = useState("");

  const tickets = useMemo(() => {
    return {
      title: "Recibo de pago: " + name_tramite,
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
      commerceName: textTipoPin,
      commerceInfo: Object.entries({
        "Id Comercio": roleInfo?.id_comercio,
        "No. terminal": roleInfo?.id_dispositivo,
        Municipio: roleInfo?.ciudad,
        Dirección: roleInfo?.direccion,
        "Id Trx": respPinCancel?.id_trx,
      }),
      trxInfo: [
        ["Proceso", "Cancelación de Pin"],
        ["Valor Trámite", formatMoney.format(valor_tramite)],
        ["IVA Trámite",formatMoney.format(0)],
        ["Valor Pin", formatMoney.format(valor)],
        ["IVA Pin", formatMoney.format(valor*0.19)],
        ["Total", formatMoney.format(valor*1.19 + valor_tramite)], // Valor + IVA
      ],
      disclamer:
        "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
    };
  }, [respPinCancel, roleInfo, valor]);

  useEffect(() => {
    infoTicket(respPinCancel?.id_trx, respPinCancel?.tipo_trx, tickets);
  }, [infoTicket, respPinCancel, tickets]);

  const onSubmitCancel = (e) => {
    e.preventDefault();
    setDisabledBtn(true);
    cancelPinVus(valor*1.19, motivo, trx, roleInfo, id_pin, valor_tramite) //// Valor = valor + IVA
      .then((res) => {
        setActivarNavigate(false);
        setDisabledBtn(false);
        if (res?.status == false) {
          notifyError(res?.msg);
        } else {
          setActivarNavigate(true);
          setRespPinCancel(res?.obj);
          notify(res?.msg);
        }
      })
      .catch((err) => console.log("error", err));
  };

  return (
    <>
      {respPinCancel === "" ? (
        <div className="flex flex-col justify-center items-center">
          <div className="flex flex-col w-1/2 mx-auto">
            <h1 className="text-3xl mt-3 mx-auto">Cancelar Pin</h1>
            <br></br>
            <h1 className="flex flex-row justify-center text-lg font-medium">{name_tramite}</h1>
            <br></br>
            <>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Valor Trámite</h1>
                <h1>{formatMoney.format(valor_tramite)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>IVA Trámite</h1>
                <h1>{formatMoney.format(0)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Valor Pin</h1>
                <h1>{formatMoney.format(valor)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>IVA Pin</h1>
                <h1>{formatMoney.format(valor*0.19)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Total</h1>
                <h1>{formatMoney.format(valor*1.19 + valor_tramite)}</h1>
              </div>
            </>
            {/* {Object.entries(respPin).map(([key, val]) => {
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
            })} */}
            <div className="flex flex-col justify-center items-center mx-auto container">
              <Form onSubmit={onSubmitCancel}>
                <TextArea
                  id="motivo"
                  label="Motivo"
                  type="input"
                  minLength="1"
                  maxLength="160"
                  autoComplete="off"
                  value={motivo}
                  required
                  onInput={(e) => {
                    setMotivo(e.target.value);
                  }}
                />
                <ButtonBar>
                  <Button type="submit" disabled={disabledBtn}>
                    Cancelar Pin
                  </Button>
                  <Button
                    onClick={() => {
                      closeModal();
                      // setrespPago();
                      // getQuota();
                    }}
                  >
                    Cerrar
                  </Button>
                </ButtonBar>
              </Form>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center">
          <Tickets refPrint={printDiv} ticket={tickets} />
          <ButtonBar>
            <Button
              onClick={() => {
                handlePrint();
              }}
            >
              Imprimir
            </Button>
            <Button
              onClick={() => {
                closeModal();
              }}
            >
              Cerrar
            </Button>
          </ButtonBar>
        </div>
      )}
    </>
  );
};
export default CancelPin;
