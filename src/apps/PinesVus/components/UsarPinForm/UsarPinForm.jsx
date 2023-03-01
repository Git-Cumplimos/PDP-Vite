import { useRef, useMemo, useState, useEffect } from "react";
import Button from "../../../../components/Base/Button";
import TicketsPines from "../TicketsPines";
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
  valor_tramite,
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

  const [objTicketActual, setObjTicketActual] = useState({
    title: "",
    timeInfo: {
      "Fecha de venta": "",
      Hora: "",
    },
    commerceInfo: [
      /*id_comercio*/
      ["Id comercio", roleInfo?.id_comercio ? roleInfo?.id_comercio : 1],
      /*id_dispositivo*/
      ["No. terminal", roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 1],
      ["Id Trx", ""],
      ["", ""],  
      /*ciudad*/
      ["Comercio", roleInfo?.["nombre comercio"]],
      ["", ""],
      /*direccion*/
      ["Dirección", roleInfo?.direccion ? roleInfo?.direccion : "No hay datos"],
      ["", ""],

    ],
    commerceName: "PIN PARA GENERACIÓN DE LICENCIA",
    trxInfo: [
      ["Trámite", "Uso de Pin"],
      ["", ""],

    ],
    disclamer: "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
  });


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
      title: "Recibo de pago: Servicio voluntario de impresión premium",
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
      commerceInfo:    [
        ["Id Comercio", roleInfo?.id_comercio],
        [ "No. terminal", roleInfo?.id_dispositivo],
        [ "Id Trx", respPinUso?.transacciones_id_trx?.uso],
        [ "",""],
        [ "Comercio" , roleInfo?.["nombre comercio"]],
         [ "",""],
         ["Dirección", roleInfo?.direccion],
         [  "",""],
 
       ]
      ,
      trxInfo: [
        ["Trámite", "Uso de Pin"],
        ["Valor", formatMoney.format(0)]

       // ["Valor Pin", formatMoney.format(valor)],
       // ["IVA Pin",formatMoney.format(valor*0.19)],
       // ["Total", formatMoney.format(valor*1.19)]

     

      ],
      disclamer:
        "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
    };
  }, [respPinUso, roleInfo]);

  // useEffect(() => {
  //   infoTicket(
  //     respPinUso?.transacciones_id_trx?.uso,
  //     respPinUso?.tipo_trx,
  //     tickets
  //   );
  // }, [infoTicket, respPinUso, tickets]);

  const onSubmitUsar = (e) => {
    e.preventDefault();
    setDisabledBtn(true);
    const fecha = Intl.DateTimeFormat("es-CO", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    /*hora actual */
    const hora = Intl.DateTimeFormat("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date());

    const objTicket = { ...objTicketActual };
    objTicket["title"] = "Recibo de pago: Servicio voluntario de impresión premium"
    objTicket["timeInfo"]["Fecha de venta"] = fecha;
    objTicket["timeInfo"]["Hora"] = hora;
    objTicket["commerceName"] = textTipoPin
    objTicket["trxInfo"][0] = ["Trámite", "Uso de Pin"]
    objTicket["trxInfo"][1] = ["Valor Trámite", formatMoney.format(0)]
   

    usarPinVus(valor*1.19, trx, num_tramite, roleInfo, id_pin, objTicket) // Pin + IVA
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
          <TicketsPines
              refPrint={null}
              ticket={tickets}
              logo="LogoVus"
          />
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
