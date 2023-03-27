import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import useMoney from "../../../../hooks/useMoney";
import Modal from "../../../../components/Base/Modal";
import MoneyInput from "../../../../components/Base/MoneyInput";
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

const minValor = 1000;
const maxValor = 500000;

const RecargasOperadores = () => {
  //Variables
  const [inputCelular, setInputCelular] = useState("");
  const [inputValor, setInputValor] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [respuesta, setRespuesta] = useState(false);
  const [typeInfo, setTypeInfo] = useState("Ninguno");
  const { roleInfo, userInfo } = useAuth();
  const { state } = useLocation();
  const printDiv = useRef();
  const validNavigate = useNavigate();
  const id_uuid = v4();
  const [infTicket, setInfTicket] = useState({
    title: "Recibo de pago",
    timeInfo: {
      "Fecha de pago": "fecha",
      Hora: "",
    },
    commerceInfo: [
      ["Id Comercio", roleInfo.id_comercio],
      ["No. terminal", roleInfo.id_dispositivo],
      ["Comercio", roleInfo["nombre comercio"]],
      ["", ""],
      ["Dirección", roleInfo.direccion],
      ["", ""],
    ],
    commerceName: "RECARGA",
    trxInfo: [
      ["Operador", state?.operador_recargar],
      ["", ""],
    ],
    disclamer:
      "Para cualquier reclamo es indispensable presentar este recibo o comunicarse al teléfono en Bogotá 756 0417.",
  });

  const onChangeMoney = useMoney({
    limits: [minValor, maxValor],
    equalError: false,
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
    if (inputValor != 0) {
      setShowModal(true);
      setTypeInfo("ResumenRecarga");
    } else {
      notify(
        `El valor de la recarga debe ser mayor a ${formatMoney.format(
          minValor
        )}`
      );
    }
    if (inputCelular[0] != 3) {
      notifyError(
        "Número inválido, el No. de celular debe comenzar con el número 3"
      );
      handleClose();
    }
  };

  const fecthEnvioTransaccion = () => {
    setRespuesta(true);
    const fecha = Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    /*hora actual */
    const hora = Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date());
    const infTicketFinal = { ...infTicket };
    infTicketFinal["timeInfo"]["Fecha de pago"] = fecha;
    infTicketFinal["timeInfo"]["Hora"] = hora;
    infTicketFinal["trxInfo"].push([
      "Número celular",
      toPhoneNumber(inputCelular) ?? "0",
    ]);
    infTicketFinal["trxInfo"].push(["", ""]);
    infTicketFinal["trxInfo"].push([
      "Valor recarga",
      formatMoney.format(inputValor) ?? "0",
    ]);
    infTicketFinal["trxInfo"].push(["", ""]);
    postEnvioTrans({
      comercio: {
        id_comercio: roleInfo.id_comercio,
        id_terminal: roleInfo.id_dispositivo,
        id_usuario: roleInfo.id_usuario,
        id_uuid_trx: id_uuid,
      },
      oficina_propia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ? true : false,
      nombre_comercio: roleInfo["nombre comercio"],
      valor_total_trx: parseInt(inputValor),
      ticket: infTicketFinal,

      datosRecargas: {
        celular: inputCelular,
        operador: state?.producto,
        valor: parseInt(inputValor),
        jsonAdicional: {
          nombre_usuario: userInfo?.attributes?.name,
          operador: state?.operador_recargar,
        },
      },
    })
      .then(async (res) => {
        if (res?.status === true) {
          notify("Recarga exitosa");
          infTicketFinal["commerceInfo"].splice(2, 0, ["Id Trx", res?.obj?.response?.["idtrans"],]);
          infTicketFinal["commerceInfo"].splice(3, 0, ["Id Aut", res?.obj?.response?.["codigoauth"],]);
          setInfTicket(infTicketFinal);
          setRespuesta(false);
          setTypeInfo("RecargaExitosa");
        } else {
          if (res?.message === "Endpoint request timed out") {
            notify("Su transacción esta siendo procesada");
            for (let i = 0; i <= 3; i++) {
              try {
                const prom = await new Promise((resolve, reject) =>
                  setTimeout(() => {
                    postCheckReintentoRecargas({
                      id_uuid_trx: id_uuid,
                      idComercio: roleInfo?.id_comercio,
                      idDispositivo: roleInfo?.id_dispositivo,
                    })
                      .then((res) => {
                        if (res?.msg !== "No ha terminado el reintento") {
                          if (
                            res?.status === true ||
                            res?.obj?.response?.estado == "00"
                          ) {
                            notify("Recarga exitosa");
                            infTicketFinal["commerceInfo"].splice(2, 0, ["Id Trx", res?.obj?.response?.["idtrans"],]);
                            infTicketFinal["commerceInfo"].splice(3, 0, ["Id Aut", res?.obj?.response?.["codigoauth"],]);
                            setInfTicket(infTicketFinal);
                            setRespuesta(false);
                            setTypeInfo("RecargaExitosa");
                          } else {
                            notifyError(
                              typeof res?.msg == typeof {}
                                ? "Error respuesta Practisistemas:(Transacción invalida [" + res?.msg?.estado + "])"
                                : res?.msg == "Error respuesta PDP: (Fallo al consumir el servicio (recarga) [0010002]) -> list index out of range" ? "Error respuesta PDP: (Fallo al consumir el servicio (recarga) [0010002])" : res?.msg == "Error respuesta PDP: (Fallo en aplicaci\u00f3n del cupo [0020001]) -> <<Exception>> El servicio respondio con un codigo: 404, 404 Not Found" ? "Error respuesta PDP: (Fallo en aplicación del cupo [0020001])" : res?.msg
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
              if (i <= 2) {
                notify(
                  "Su transacción esta siendo procesada, no recargue la página"
                );
              }
            }
            notifyError("Error respuesta practisistemas: No se recibió respuesta del autorizador en el tiempo esperado [0010003]");
            validNavigate("/recargas-paquetes");
          }
          else {
            notifyError(
              typeof res?.msg == typeof {}
                ? "Error respuesta Practisistemas:(Transacción invalida [" + res?.msg?.estado + "])"
                : res?.msg == "Error respuesta PDP: (Fallo al consumir el servicio (recarga) [0010002]) -> list index out of range" ? "Error respuesta PDP: (Fallo al consumir el servicio (recarga) [0010002])" : res?.msg == "Error respuesta PDP: (Fallo en aplicaci\u00f3n del cupo [0020001]) -> <<Exception>> El servicio respondio con un codigo: 404, 404 Not Found" ? "Error respuesta PDP: (Fallo en aplicación del cupo [0020001])" : res?.msg
            );
            setRespuesta(false);
            handleClose();
          }
        }
      })
      .catch((err) => {
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
    setInputValor("");
    setInfTicket((old) => {
      return {
        ...old,
        commerceInfo: [
          ["Id Comercio", roleInfo.id_comercio],
          ["No. terminal", roleInfo.id_dispositivo],
          ["Comercio", roleInfo["nombre comercio"]],
          ["", ""],
          ["Dirección", roleInfo.direccion],
          ["", ""],
        ],
        commerceName: "RECARGA",
        trxInfo: [],
      };
    });
    validNavigate("/recargas-paquetes");
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
      <h1 className="text-3xl mt-6">Recargas a {state?.operador_recargar}</h1>
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

        <MoneyInput
          name="valor"
          label="Valor de la recarga"
          autoComplete="off"
          min={minValor}
          max={maxValor}
          minLength={"4"}
          maxLength={"9"}
          value={inputValor}
          onInput={(ev) => setInputValor(onChangeMoney(ev))}
          required
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Realizar Recarga</Button>
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
              Valor: formatMoney.format(inputValor),
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
            <Tickets refPrint={printDiv} ticket={infTicket} />
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

export default RecargasOperadores;
