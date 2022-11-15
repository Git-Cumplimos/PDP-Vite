import React, {
  Fragment,
  useCallback,
  useRef,
  useState,
  useEffect,
} from "react";
import { useNavigate,useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import Tickets from "../../../../components/Base/Tickets";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../../utils/notify";
import { toPhoneNumber } from "../../../../utils/functions";
import { postEnvioTrans, postCheckReintentoRecargas } from "../../utils/fetchServicioRecargas";
import { v4 } from 'uuid';

const RecargarPaquetes = () => {
  //Variables
  const printDiv = useRef();
  const {roleInfo,userInfo} = useAuth();
  const [inputCelular, setInputCelular] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [respuesta, setRespuesta] = useState(false);
  const [typeInfo, setTypeInfo] = useState("Ninguno");
  const { state } = useLocation();  
  const validNavigate = useNavigate();
  const id_uuid = v4();
  const [infTicket, setInfTicket] = useState({
    title: "Recibo de pago",
    timeInfo: {
      "Fecha de pago": "fecha",
      "Hora": "",
    },
    commerceInfo: [
      ["No. terminal", roleInfo.id_dispositivo],
      ["Id Comercio", roleInfo.id_comercio],
      ["Comercio", roleInfo["nombre comercio"]],
      ["", ""],
      ["Dirección", roleInfo.direccion],
      ["", ""],
    ],
    commerceName: "RECARGAS A CELULAR",
    trxInfo: [
      ["Operador", state?.operador_recargar],
      ["", ""],
    ],
    disclamer:
      "Para quejas o reclamos comuníquese al 3503485532 (Servicio al cliente) o al 3102976460 (Chatbot)",
  });
  const onCelChange = (e) => {
    const valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");

    if (valueInput[0] != 3) {
      if (valueInput.length == 1 && inputCelular == "") {
        notifyError(
          "Número inválido, el No. de celular debe comenzar con el número 3"
        );
        return;
      }
    }
    setInputCelular(valueInput);
  };

  const onSubmitCheck = (e) => {
    e.preventDefault();
    setShowModal(true);
    setTypeInfo("ResumenRecarga");
  };

  const fecthEnvioTransaccion = () => {
    setRespuesta(true)
    const fecha = Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "numeric",
    }).format(new Date());
    /*hora actual */
    const hora = Intl.DateTimeFormat("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date());
    const infTicketFinal = { ...infTicket }; 
    infTicketFinal["timeInfo"]["Fecha de pago"] = fecha;
    infTicketFinal["timeInfo"]["Hora"] = hora;
    infTicketFinal["trxInfo"].push(["Número celular", toPhoneNumber(inputCelular) ?? "0"]);
    infTicketFinal["trxInfo"].push(["", ""]);
    infTicketFinal["trxInfo"].push(["Valor recarga", formatMoney.format(state?.valor_paquete) ?? "0"]);
    infTicketFinal["trxInfo"].push(["", ""]);
    postEnvioTrans({
      comercio: {
        id_comercio:roleInfo.id_comercio,
        id_terminal: roleInfo.id_dispositivo,
        id_usuario: roleInfo.id_usuario,
        id_uuid_trx: id_uuid
      },
      oficina_propia: roleInfo?.tipocomercio === "OFICINAS PROPIAS" ? true : false,
      nombre_comercio: roleInfo["nombre comercio"],
      valor_total_trx: parseInt(state?.valor_paquete),
      ticket: infTicketFinal,

      datosRecargas:{
          celular: inputCelular,
          operador:state?.operador_recargar,
          valor: parseInt(state?.valor_paquete),
          jsonAdicional:{
            "nombre_usuario": userInfo?.attributes?.name
          } 
      }
    })
    .then((res) => {
      if (res?.status === true) {
        notify(res?.msg);
        infTicketFinal["commerceInfo"].push(["Id Trx", res?.obj?.response?.["idtrans"]]);
        infTicketFinal["commerceInfo"].push(["Id Aut", res?.obj?.response?.["codigoauth"]]);
        setInfTicket(infTicketFinal)
        setRespuesta(false);
        setTypeInfo("RecargaExitosa");
      }
      else {
        notifyError(res?.msg);
        setRespuesta(false);
        handleClose();
      }
    })
    .catch(async(err) => {
      notify("Su transacción esta siendo procesada");
      setRespuesta(true);
      for (let i = 0; i <=8; i++) {
        try {
          const prom = await new Promise((resolve, reject) =>
            setTimeout(() => {
              postCheckReintentoRecargas({
                id_uuid_trx: id_uuid,
                idComercio: roleInfo?.id_comercio,
                idDispositivo: roleInfo?.id_dispositivo
              })
              .then((res) => {
                if (res?.msg !== "No ha terminado el reintento") {
                  if (res?.status === true || res?.obj?.response?.estado == "00") {        
                    infTicketFinal["commerceInfo"].push(["Id Trx", res?.obj?.response?.["idtrans"]]);
                    infTicketFinal["commerceInfo"].push(["Id Aut", res?.obj?.response?.["codigoauth"]]);
                    setInfTicket(infTicketFinal)
                    setRespuesta(false);
                    setTypeInfo("RecargaExitosa");
                  }
                  else {
                    notifyError(res?.obj?.response?.respuesta);
                    setRespuesta(true);
                    handleClose();
                    resolve(true);
                  }
                } else {
                  setRespuesta(true);
                  resolve(false);
                }              
              })
              .catch((err) => {
                setRespuesta(false);
                console.error(err);
              });
            }, 11000)
          );
          if (prom === true) {
            setRespuesta(false);
            handleClose();
            break;
          }
        } catch (error) {
          console.error(error);
        }
        notify("Su transacción esta siendo procesada");
      }
    });
  };
  
  const handleClose = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    setInputCelular("");
    setInfTicket((old)=>{
      return {
        ...old,
        commerceInfo: [
          ["No. terminal", roleInfo.id_dispositivo],
          ["Id Comercio", roleInfo.id_comercio],
          ["Comercio", roleInfo["nombre comercio"]],
          ["", ""],
          ["Dirección", roleInfo.direccion],
          ["", ""],
        ],
        trxInfo: [
          ["Operador", state?.operador_recargar],
          ["", ""],
        ],
      };
    });
  }, []);

  const handleCloseRecarga = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    validNavigate("/recargas-paquetes");
    handleClose();
  }, []);

  const handleCloseCancelada = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    notify("Recarga cancelada");
    validNavigate("/recargas-paquetes");
    handleClose();

  }, []);

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  useEffect(() => {
    if (!state?.operador_recargar) {
      validNavigate("../recargas-paquetes");
    } 
  }, [state?.operador_recargar]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Recargas de {state?.operador_recargar}</h1>
      <Form onSubmit={onSubmitCheck} grid>
        <Input
          name="celular"
          label="Número de celular"
          type="tel"
          autoComplete="off"
          minLength={"10"}
          maxLength={"10"}
          value={inputCelular}
          onChange={onCelChange}
          required
        />

        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Realizar venta de paquete</Button>
        </ButtonBar>
      </Form>

      <Modal show={showModal} handleClose={handleClose}>
        {/**************** Resumen de la recarga **********************/}
        {typeInfo ==="ResumenRecarga" && (
          <PaymentSummary
            title="¿Está seguro de realizar la transacción?"
            subtitle="Resumen de transacción"
            summaryTrx={{
              Celular: toPhoneNumber(inputCelular),
              Valor: formatMoney.format(state?.valor_paquete),
            }}
          >
            <>
              <ButtonBar>
                <Button type={"submit"} onClick={fecthEnvioTransaccion}>
                  Aceptar
                </Button>
                <Button onClick={handleCloseCancelada}>Cancelar</Button>
              </ButtonBar>
            </> 
            <SimpleLoading show={respuesta}/>
          </PaymentSummary>
        )}
        {/**************** Recarga Exitosa **********************/}
        {infTicket && typeInfo === "RecargaExitosa" && (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <Tickets refPrint={printDiv} ticket={infTicket} handleClose={handleClose}/>
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={handleCloseRecarga}>Cerrar</Button>
            </ButtonBar>
          </div>
        )}
        {/*************** Recarga Exitosa **********************/}
      </Modal>
    </Fragment>
  );
};

export default RecargarPaquetes;