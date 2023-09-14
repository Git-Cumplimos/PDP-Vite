import React, {
  Fragment,
  useCallback,
  useRef,
  useState,
  useEffect,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import {
  postEnvioTrans,
  postCheckReintentoRecargas,
} from "../../utils/fetchServicioRecargas";
import { v4 } from "uuid";

const RecargarPaquetes = () => {
  //Variables
  const printDiv = useRef();
  const { roleInfo, pdpUser } = useAuth();
  const [inputCelular, setInputCelular] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [respuesta, setRespuesta] = useState(false);
  const [typeInfo, setTypeInfo] = useState("Ninguno");
  const { state } = useLocation();
  const validNavigate = useNavigate();
  const id_uuid = v4();
  const [infTicket, setInfTicket] = useState("");
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
    if (inputCelular[0] != 3) {
      notifyError(
        "Número inválido, el No. de celular debe comenzar con el número 3"
      );
      handleClose();
    }
  };
  const fecthEnvioTransaccion = () => {
    setRespuesta(true);
    postEnvioTrans({
      comercio: {
        id_comercio: roleInfo.id_comercio,
        id_terminal: roleInfo.id_dispositivo,
        id_usuario: roleInfo.id_usuario,
        id_uuid_trx: id_uuid,
      },
      oficina_propia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" || roleInfo?.tipo_comercio === "KIOSCO" ? true : false,
      nombre_comercio: roleInfo["nombre comercio"],
      valor_total_trx: parseInt(state?.valor_paquete),
      address: roleInfo?.direccion,
      nombre_usuario: pdpUser?.uname ?? "",
      datos_recargas: {
        celular: inputCelular,
        operador: state?.operador,
        jsonAdicional: {
          operador: state?.operadorPaquete,
          operador_paquete: state?.operador_recargar,
          descripcion: state?.descripcion,
        },
      },
    })
      .then(async (res) => {
        if (res?.status === true) {
          notify("Compra de paquete exitosa");
          setInfTicket(res?.obj?.ticket);
          setRespuesta(false);
          setTypeInfo("RecargaExitosa");
        } else {
          if (res?.message === "Endpoint request timed out") {
            notify("Su transacción esta siendo procesada");
            setRespuesta(true);
            for (let i = 0; i <= 7; i++) {
              try {
                const prom = await new Promise((resolve, reject) =>
                  setTimeout(() => {
                    postCheckReintentoRecargas({
                      id_uuid_trx: id_uuid,
                      id_comercio: roleInfo?.id_comercio,
                      id_terminal: roleInfo?.id_dispositivo,
                    })
                      .then((res) => {
                        if (res?.msg !== "Error respuesta PDP: (No ha terminado la transacción)") {
                          if (
                            res?.status === true ||
                            res?.obj?.response?.estado === "00"
                          ) {
                            setInfTicket(res?.obj?.ticket);
                            setRespuesta(false);
                            setTypeInfo("RecargaExitosa");
                          } else {
                            notifyError(
                              typeof res?.msg == typeof {}
                                ? "Error respuesta Practisistemas:(Transacción invalida [" + res?.msg?.estado + "])"
                                : res?.msg === "Error respuesta PDP: (Fallo al consumir el servicio (recarga) [0010002]) -> list index out of range" ? "Error respuesta PDP: (Fallo al consumir el servicio (recarga) [0010002])" : res?.msg === "Error respuesta PDP: (Fallo en aplicaci\u00f3n del cupo [0020001]) -> <<Exception>> El servicio respondio con un codigo: 404, 404 Not Found" ? "Error respuesta PDP: (Fallo en aplicación del cupo [0020001])" : res?.msg
                            );
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
                  }, 15000)
                );
                if (prom === true) {
                  setRespuesta(false);
                  handleClose();
                  break;
                }
                if (i >= 3) {
                  notify(
                    "Su transacción quedó en estado pendiente, por favor consulte el estado de la transacción en aproximadamente 1 minuto"
                  );
                  setRespuesta(false);
                  handleClose();
                  break;
                }
              } catch (error) {
                console.error(error);
              }
              if (i <= 3) {
                notify(
                  "Su transacción esta siendo procesada, no recargue la página"
                );
              }
            }
            validNavigate("/recargas-paquetes");
          } else {
            notifyError(
              typeof res?.msg == typeof {}
                ? "Error respuesta Practisistemas:(Transacción invalida [" + res?.msg?.estado + "])"
                : res?.msg === "Error respuesta PDP: (Fallo al consumir el servicio (recarga) [0010002]) -> list index out of range" ? "Error respuesta PDP: (Fallo al consumir el servicio (recarga) [0010002])" : res?.msg == "Error respuesta PDP: (Fallo en aplicaci\u00f3n del cupo [0020001]) -> <<Exception>> El servicio respondio con un codigo: 404, 404 Not Found" ? "Error respuesta PDP: (Fallo en aplicación del cupo [0020001])" : res?.msg
            );
            setRespuesta(false);
            handleClose();
          }
        }
      })
      .catch(async (err) => {
        setRespuesta(false);
        notifyError("Error respuesta PDP: Fallo de conexión con autorizador [0010004]");
        console.error(err);
        handleClose();
      });
  };

  const handleClose = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    setInputCelular("");
    setInfTicket("");
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
      <h1 className="text-3xl mt-6">{state?.operador_recargar}</h1>
      <p> {state?.descripcion} </p>
      <p> Valor: {formatMoney.format(state?.valor_paquete)} </p>
      <Form onSubmit={onSubmitCheck} >
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
        {typeInfo === "ResumenRecarga" && (
          <PaymentSummary
            title="¿Está seguro de realizar la transacción?"
            subtitle="Resumen de transacción"
            summaryTrx={{
              Celular: toPhoneNumber(inputCelular),
              Valor: formatMoney.format(state?.valor_paquete),
              Descripción: (
                <div className="absolute text-left">{state?.descripcion}</div>
              ),
            }}>
            <>
              <ButtonBar>
                <Button onClick={handleCloseCancelada}>Cancelar</Button>
                <Button type={"submit"} onClick={fecthEnvioTransaccion}>
                  Aceptar
                </Button>
              </ButtonBar>
            </>
            <SimpleLoading show={respuesta} />
          </PaymentSummary>
        )}
        {/**************** Recarga Exitosa **********************/}
        {infTicket && typeInfo === "RecargaExitosa" && (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <Tickets
              refPrint={printDiv}
              ticket={infTicket}
              handleClose={handleClose}
            />
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
