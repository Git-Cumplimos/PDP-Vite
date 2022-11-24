import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { useReactToPrint } from "react-to-print";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import MoneyInput from "../../../../components/Base/MoneyInput";
import Tickets from "../../../../components/Base/Tickets";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../../utils/notify";
import { toPhoneNumber } from "../../../../utils/functions";
import fetchData from "../../../../utils/fetchData";
import {
  postCheckReintentoPines,
  postRevisarTransaccion,
} from "../../utils/fetchBackPines";
import { useNavigate, useLocation } from "react-router-dom";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import { v4 } from "uuid";

const minValor = 1000;
const maxValor = 100000;
const tipo_operacion = 113;
const url_compra_pines = `${process.env.REACT_APP_PRACTISISTEMAS}/pines`;

const CompraPin = () => {
  const printDiv = useRef();
  const { roleInfo, userInfo, infoTicket } = useAuth();
  const validNavigate = useNavigate();
  const [inputCelular, setInputCelular] = useState("");
  const [inputValor, setInputValor] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [typeInfo, setTypeInfo] = useState("Ninguno");
  const [showLoading, setShowLoading] = useState(false);
  const { state } = useLocation();
  const [infTicket, setInfTicket] = useState({
    title: "Recibo de pago",
    timeInfo: {
      "Fecha de venta": "",
      Hora: "",
    },
    commerceInfo: [
      ["No. terminal", roleInfo.id_dispositivo],
      ["Teléfono", roleInfo.telefono],
      ["Comercio", roleInfo["nombre comercio"]],
      ["", ""],
      ["Dirección", roleInfo.direccion],
      ["", ""],
    ],
    commerceName: "Venta de Pines de Servicio y Contenido",
    trxInfo: [],
    disclamer:
      "Para quejas o reclamos comuníquese al 3503485532 (Servicio al cliente) o al 3102976460 (Chatbot)",
  });

  const onMoneyChange = (e, valor) => {
    setInputValor(valor);
  };

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
    if (String(inputCelular).charAt(0) === "3") {  
        setShowModal(true);
        setTypeInfo("ResumenVentaPin");     
    } else {
      notifyError(
        "Número inválido, el N° de celular debe comenzar con el número 3."
      );
    }
  };

  const compraPines = () => {
    setShowLoading(true);

    const uniqueId = v4();
    const dateActual = new Date();
    const date = dateActual.getDate();
    const mounth = dateActual.getMonth() + 1;
    const year = dateActual.getFullYear();
    const fecha = date + "/" + mounth + "/" + year;

    const hour = dateActual.getHours();
    const minutes = dateActual.getMinutes();
    const seconds = dateActual.getSeconds();
    const hora = hour + ":" + minutes + ":" + seconds;

    const newVoucher = { ...infTicket };

    newVoucher["timeInfo"]["Fecha de venta"] = fecha;
    newVoucher["timeInfo"]["Hora"] = hora;

    newVoucher["trxInfo"][0] = ["Nombre del Pin", state.desc];
    newVoucher["trxInfo"][1] = ["", ""];
    newVoucher["trxInfo"][2] = ["Número celular", toPhoneNumber(inputCelular)];
    newVoucher["trxInfo"][3] = ["", ""];
    newVoucher["trxInfo"][4] = [
      "Valor del Pin",
      formatMoney.format(state.sell ? state.sell : inputValor),
    ];
    newVoucher["trxInfo"][5] = ["", ""];

    fetchData(
      `${url_compra_pines}/transacciones`,
      "POST",
      {},
      {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_terminal: roleInfo?.id_dispositivo,
          id_usuario: roleInfo?.id_usuario,
          id_uuid_trx: uniqueId,
        },
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ? true : false,
        nombre_comercio: roleInfo["nombre comercio"],
        valor_total_trx: state.sell ? state.sell : inputValor,
        jsonPines: {
          celular: inputCelular,
          operador: state?.op,
          valor: state.sell ? state.sell : inputValor,
          jsonAdicional: {
            nombre_usuario: userInfo?.attributes?.name,
            id_uuid_trx: uniqueId,
          },
        },
        ticket: newVoucher,
      },
      {},
      false,
      29000
    )
      .then((res) => {
        if (res?.status === true) {
          notify("Venta exitosa");
          setShowLoading(false);
          VentaExitosa(res?.obj?.response, fecha, hora);
        } else {
          notifyError(res?.msg);
          setShowLoading(false);
          setShowModal(false);
          setInputCelular("");
          setInputValor(0);
        }
      })
      .catch(async (err) => {
        notify("Se está procesando la transacción");
        setShowLoading(true);
        console.error(err);

        console.error("Entrando al catch");

        const today = new Date();
        const formatDate = Intl.DateTimeFormat("es-CO", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(today);

        for (let i = 0; i <= 8; i++) {
          try {
            const promesa = await new Promise((resolve, reject) =>
              setTimeout(() => {
                postCheckReintentoPines({
                  idComercio: roleInfo?.id_comercio,
                  idUsuario: roleInfo?.id_usuario,
                  idTerminal: roleInfo?.id_dispositivo,
                  id_uuid_trx: uniqueId,
                })
                  .then((res) => {
                    if (res?.msg !== "No ha terminado el reintento") {
                      if (
                        res?.status === true ||
                        res?.obj?.response?.estado == "00"
                      ) {
                        notify("Venta exitosa");
                        VentaExitosa(res?.obj?.response, fecha, hora);
                        setShowLoading(false);
                      } else {
                        notifyError(res?.obj?.response?.["respuesta"]);
                        setShowLoading(true);
                        setShowModal(false);
                        setInputCelular("");
                        setInputValor(0);
                        resolve(true);
                      }
                    } else {
                      setShowLoading(true);
                      resolve(false);
                    }
                  })
                  .catch((err) => {
                    console.error("Entró al catch del setTimeOut");
                    setShowLoading(false);
                    console.error(err);
                  });
              }, 11000)
            );
            if (promesa === true) {
              setShowLoading(false);
              handleClose();
              break;
            }
          } catch (error) {
            console.error("Entró al catch del for");

            console.error(error);
          }
        }
      });
  };

  const VentaExitosa = (result_, fecha, hora) => {
    const voucher = {
      title: "Recibo de pago",
      timeInfo: {
        "Fecha de venta": fecha,
        Hora: hora,
      },
      commerceInfo: [
        ["No. terminal", roleInfo.id_dispositivo],
        ["Teléfono", roleInfo.telefono],
        ["Id trx", result_.idtrans],
        ["Id Aut", result_.codigoauth],
        ["Comercio", roleInfo["nombre comercio"]],
        ["", ""],
        ["Dirección", roleInfo.direccion],
        ["", ""],
      ],
      commerceName: "Venta de Pines de Servicio y Contenido",
      trxInfo: [
        ["Nombre del Pin", state.desc],
        ["", ""],
        ["Número celular", toPhoneNumber(inputCelular)],
        ["", ""],
        [
          "Valor del Pin",
          formatMoney.format(state.sell ? state.sell : inputValor),
        ],
        ["", ""],
      ],
      disclamer:
        "Para quejas o reclamos comuníquese al 3503485532 (Servicio al cliente) o al 3102976460 (Chatbot)",
    };
    setTypeInfo("VentaExitosa");
    setInfTicket(voucher);

    infoTicket(result_.idtrans, tipo_operacion, voucher)
      .then((resTicket) => {
        console.log("resTicket ", resTicket);
      })
      .catch((err) => {
        console.error(err);
        notifyError("Error guardando el ticket");
      });
  };

  const handleClosePin = useCallback(() => {
    setShowModal(false);
    validNavigate("/Pines");
  }, []);

  const handleClose = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    setInputCelular("");
    setInputValor("");
    setInfTicket({
      title: "Recibo de pago",
      timeInfo: {
        "Fecha de venta": "",
        Hora: "",
      },
      commerceInfo: [
        ["No. terminal", roleInfo.id_dispositivo],
        ["Teléfono", roleInfo.telefono],
        ["Comercio", roleInfo["nombre comercio"]],
        ["", ""],
        ["Dirección", roleInfo.direccion],
        ["", ""],
      ],
      commerceName: "Venta de Pines de Servicio y Contenido",
      trxInfo: [],
      disclamer:
        "Para quejas o reclamos comuníquese al 3503485532 (Servicio al cliente) o al 3102976460 (Chatbot)",
    });
    validNavigate("/Pines");
  }, []);

  const handleCloseCancelada = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    notify("Venta cancelada");
    setInputCelular("");
    setInputValor("");
    setInfTicket(null);
  }, []);

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  return (
    <Fragment>
      <SimpleLoading show={showLoading} />
      <h1 className="text-3xl mt-6">Compra Pin: {state?.desc} </h1>
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
          label="Valor"
          autoComplete="off"
          min={minValor}
          max={maxValor}
          minLength={"4"}
          maxLength={"9"}
          value={state?.sell ? state?.sell : inputValor}
          onInput={onMoneyChange}
          disabled={state?.sell ? true : false}
          required
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Realizar Compra</Button>
        </ButtonBar>
      </Form>

      <Modal show={showModal} handleClose={handleClose}>
        {/**************** Resumen de la venta del Pin **********************/}
        {typeInfo == "ResumenVentaPin" && (
          <PaymentSummary
            title="¿Está seguro de realizar la transacción?"
            subtitle="Resumen de transacción"
            summaryTrx={{
              Celular: toPhoneNumber(inputCelular),
              Valor: formatMoney.format(state?.sell ? state?.sell : inputValor),
            }}
          >
            <>
              <ButtonBar>
                <Button onClick={handleCloseCancelada}>Cancelar</Button>
                <Button type={"submit"} onClick={compraPines}>
                  Aceptar
                </Button>
              </ButtonBar>
            </>
          </PaymentSummary>
        )}
        {/**************** Resumen de la venta del Pin **********************/}

        {/**************** Venta del Pin Exitosa **********************/}
        {infTicket && typeInfo == "VentaExitosa" && (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <Tickets refPrint={printDiv} ticket={infTicket} />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={handleClosePin}>Cerrar</Button>
            </ButtonBar>
          </div>
        )}
        {/*************** Venta del Pin Exitosa **********************/}
      </Modal>
    </Fragment>
  );
};

export default CompraPin;
