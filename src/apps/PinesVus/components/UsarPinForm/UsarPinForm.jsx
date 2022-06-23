import { useRef, useMemo, useState, useEffect } from "react";
import Button from "../../../../components/Base/Button";
import Tickets from "../../../../components/Base/Tickets";
import { useReactToPrint } from "react-to-print";
import ButtonBar from "../../../../components/Base/ButtonBar";
import { useAuth } from "../../../../hooks/AuthHooks";
import Form from "../../../../components/Base/Form";
import { notify, notifyError } from "../../../../utils/notify";
import { usePinesVus } from "../../utils/pinesVusHooks";
import Input from "../../../../components/Base/Input";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const UsarPinForm = ({
  respPin,
  closeModal,
  trx,
  name_tramite,
  valor,
  id_pin,
  tipoPin,
  setActivarNavigate,
}) => {
  const printDiv = useRef();

  const { usarPinVus, con_estado_tipoPin } = usePinesVus();
  const { roleInfo, infoTicket } = useAuth();
  const [respPinUso, setRespPinUso] = useState("");
  const [optionsTipoPines, setOptionsTipoPines] = useState([]);
  const [num_tramite, setNum_tramite] = useState("");

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
        "Id Trx": respPinUso?.transacciones_id_trx?.uso,
      }),
      trxInfo: [
        ["Proceso", "Uso de Pin"],
        ["VALOR", formatMoney.format(0)],
      ],
      disclamer:
        "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
    };
  }, [respPinUso, roleInfo]);

  useEffect(() => {
    infoTicket(
      respPinUso?.transacciones_id_trx?.uso,
      respPinUso?.tipo_trx,
      tickets
    );
  }, [infoTicket, respPinUso, tickets]);

  const onSubmitUsar = (e) => {
    e.preventDefault();
    setDisabledBtn(true);
    usarPinVus(valor*1.19, trx, num_tramite, roleInfo, id_pin) // Pin + IVA
      .then((res) => {
        setNum_tramite("");
        setActivarNavigate(false);
        setDisabledBtn(false);
        if (res?.status == false) {
          notifyError(res?.msg);
        } else {
          notify(res?.msg);
          setActivarNavigate(true);
          setRespPinUso(res?.obj);
        }
      })
      .catch((err) => console.log("error", err));
  };

  return (
    <>
      {respPinUso === "" ? (
        <div className="flex flex-col justify-center items-center">
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
            <div className="flex flex-col justify-center items-center mx-auto container">
              <Input
                id="numTramite"
                label="No. Tramite"
                type="search"
                minLength="3"
                maxLength="10"
                autoComplete="off"
                value={num_tramite}
                onInput={(e) => {
                  if (!isNaN(e.target.value)) {
                    const num = e.target.value;
                    setNum_tramite(num);
                  }
                }}
              />
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
            </div>
          </Form>
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
export default UsarPinForm;
