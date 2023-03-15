import { useRef, useMemo, useState, useEffect } from "react";
import Button from "../../../../components/Base/Button";
import TicketsPines from "../TicketsPines";
import { useReactToPrint } from "react-to-print";
import ButtonBar from "../../../../components/Base/ButtonBar";
import { useAuth } from "../../../../hooks/AuthHooks";
import Form from "../../../../components/Base/Form";
import { notify, notifyError } from "../../../../utils/notify";
import { usePinesVus } from "../../utils/pinesVusHooks";
import TextArea from "../../../../components/Base/TextArea";
import Select from "../../../../components/Base/Select";

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
  infoComercioCreacion,
  closeModal,
  setActivarNavigate,
  valores
}) => {
  let posicion=name_tramite.search(",")
  let tramite1
  let tramite2
  if (posicion>0){
   tramite1=name_tramite.slice(0,posicion)
   tramite2=name_tramite.slice(posicion+1)
  }

  const { cancelPinVus, con_estado_tipoPin } = usePinesVus();

  const printDiv = useRef();

  const { roleInfo, infoTicket } = useAuth();

  const [optionsTipoPines, setOptionsTipoPines] = useState([]);

  const [tipCancelacion, setTipCancelacion] = useState("")

  const optionsTipCancelacion = [
    { value: "", label: "" },
    { value: 1, label: "Cancelar pin completo" },
    { value: 2, label: "Cancelar solo comisión premium" },
  ];

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
      ["Comercio", roleInfo?.["nombre comercio"]],
      ["", ""],
      /*direccion*/
      ["Dirección", roleInfo?.direccion ? roleInfo?.direccion : "No hay datos"],
      ["", ""],

    ],
    commerceName: "",
    trxInfo: [
      ["Trámite", "Cancelación de Pin"],
      ["",""],
      ["", ""],
      ["", ""],
      ["",""],
      ["", ""],
      ["", ""], 
    ],
    disclamer: "Para quejas o reclamos comuníquese al 3503485532 (Servicio al cliente) o al 3102976460 (chatbot)",
  });

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
    let tittle
    if(tipoPin==1){
      tittle = "Recibo de pago: Servicio voluntario de impresión premium"
    }else{
      tittle = "Recibo de pago: " + textTipoPin
    }
    return {
      title: tittle,
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
      commerceInfo: [
       ["Id Comercio", roleInfo?.id_comercio],
       [ "No. terminal", roleInfo?.id_dispositivo],
       [ "Id Trx", respPinCancel?.id_trx],
       [ "",""],
       [ "Comercio" , roleInfo?.["nombre comercio"]],
        [ "",""],
        ["Dirección", roleInfo?.direccion],
        [  "",""],

      ],
      trxInfo: tipCancelacion === "1" ? 
      valores[1]?
      [ 
        ["Trámite", "Cancelación de Pin"],
        ["",""],
        ["Detalle trámite_1", tramite1],
        ["",""],
        ["Valor trámite_1", formatMoney.format(valores[0])],
        ["",""],
        ["Detalle trámite_2", tramite2],
        ["",""],
        ["Valor trámite_2", formatMoney.format(valores[1])],
        ["",""],
        ["Valor Pin", formatMoney.format(valor)],
        ["",""],
        ["IVA Pin", formatMoney.format(valor*0.19)],
        ["",""],
        ["Total", formatMoney.format(valor*1.19 + valores[0]+ valores[1] )], // Valor + IVA
        ["",""],
      ] :
      [ 
        ["Trámite", "Cancelación de Pin"],
        ["",""],
        ["Detalle trámite", name_tramite],
        ["",""],
        ["Valor trámite", formatMoney.format(valor_tramite)],
        ["",""],
        ["Valor Pin", formatMoney.format(valor)],
        ["",""],
        ["IVA Pin", formatMoney.format(valor*0.19)],
        ["",""],
        ["Total", formatMoney.format(valor*1.19 + valor_tramite)], // Valor + IVA
        ["",""],
      ]
      : 
      [
        ["Trámite", "Cancelación de Pin"],
        ["",""],
        ["Valor Pin", formatMoney.format(valor)],
        ["",""],
        ["IVA Pin", formatMoney.format(valor*0.19)],
        ["",""],
        ["Total", formatMoney.format(valor*1.19)], // Valor + IVA
        ["",""],
      ] 
      
      ,
      disclamer:
        "Para quejas o reclamos comuníquese al 3503485532 (Servicio al cliente) o al 3102976460 (chatbot)",
    };
  }, [respPinCancel, roleInfo, valor]);

  // useEffect(() => {
  //   infoTicket(respPinCancel?.id_trx, respPinCancel?.tipo_trx, tickets);
  // }, [infoTicket, respPinCancel, tickets]);

  const onSubmitCancel = (e) => {
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
    if(tipoPin==1){
      objTicket["title"] = "Recibo de pago: Servicio voluntario de impresión premium"
    }else{
      objTicket["title"] = "Recibo de pago: " + textTipoPin
    }
    objTicket["timeInfo"]["Fecha de venta"] = fecha;
    objTicket["timeInfo"]["Hora"] = hora;
    objTicket["commerceName"] = textTipoPin
 if( valores[1]){
    objTicket["trxInfo"][2] = ["Detalle trámite_1", tramite1]
    objTicket["trxInfo"][3] = ["",""]
    objTicket["trxInfo"][4] = ["Valor trámite_1", formatMoney.format(valores[0])]
    objTicket["trxInfo"][5] = ["",""]
    objTicket["trxInfo"][6] = ["Detalle trámite_2", tramite2]
    objTicket["trxInfo"][7] = ["",""]
    objTicket["trxInfo"][8] = ["Valor trámite_2",formatMoney.format(valores[1])]
    objTicket["trxInfo"][9] = ["",""]
    objTicket["trxInfo"][10] = ["Valor Pin", formatMoney.format(valor)]
    objTicket["trxInfo"][11] = ["",""]
    objTicket["trxInfo"][12] = ["IVA Pin", formatMoney.format(valor*0.19)]
    objTicket["trxInfo"][13] = ["",""]
    objTicket["trxInfo"][14] = ["Total", formatMoney.format(valor*1.19 + valores[0]+ valores[1])]
    objTicket["trxInfo"][15] = ["",""]
  }
    else{    
      objTicket["trxInfo"][2] = ["Detalle trámite", name_tramite]
      objTicket["trxInfo"][3] = ["",""]
      objTicket["trxInfo"][4] = ["Valor trámite", formatMoney.format(valor_tramite)]
      objTicket["trxInfo"][5] = ["",""]
      objTicket["trxInfo"][6] = ["Valor Pin", formatMoney.format(valor)]
      objTicket["trxInfo"][7] = ["",""]
      objTicket["trxInfo"][8] = ["IVA Pin", formatMoney.format(valor*0.19)]
      objTicket["trxInfo"][9] = ["",""]
      objTicket["trxInfo"][10] = ["Total", formatMoney.format(valor*1.19 + valor_tramite)]
      objTicket["trxInfo"][11] = ["",""]
      objTicket["trxInfo"][12] = ["",""]
      objTicket["trxInfo"][13] = ["",""]
      objTicket["trxInfo"][14] = ["",""]
      //objTicket["trxInfo"][15] = ["",""]
  }

    if (tipCancelacion === '2') {
   
      objTicket["trxInfo"][14] = ["Total", formatMoney.format(valor*1.19)]  
      objTicket["trxInfo"].splice(2,8)
    }

    cancelPinVus(valor*1.19, motivo, trx, roleInfo, id_pin, valor_tramite, tipCancelacion, infoComercioCreacion, objTicket) //// Valor = valor + IVA
      .then((res) => {
        setActivarNavigate(false);
        setDisabledBtn(false);
        if (res?.status === false) {
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
            { tipCancelacion === "1" ?
             !valores[1]?
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
            </>:
            <>
            <div
              className="flex flex-row justify-between text-lg font-medium"
            >
              <h1>Valor Trámite 1: </h1>
              <h1>{formatMoney.format(valores[0])}</h1>
            </div>
            <div
              className="flex flex-row justify-between text-lg font-medium"
            >
              <h1>Valor Trámite 2: </h1>
              <h1>{formatMoney.format(valores[1])}</h1>
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
              <h1>{formatMoney.format(valor*1.19 + valores[0] +  valores[1])}</h1>
            </div>
          </>
            :
            <>
            {tipCancelacion === "2"? 
            <>
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
              <h1>{formatMoney.format(valor*1.19)}</h1>
            </div>
            </>
            :""}
            </>
            }
            <div className="flex flex-col justify-center items-center mx-auto container">
              <Form onSubmit={onSubmitCancel}>
                <Select
                  className="place-self-stretch"
                  id="tramite"
                  label="Tipo de cancelación"
                  options={optionsTipCancelacion}
                  value={tipCancelacion}
                  required={true}
                  onChange={(e) => {
                    setTipCancelacion(e.target.value);
                  }}
                />
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
export default CancelPin;
