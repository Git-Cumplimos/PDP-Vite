import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import useMoney from "../../../../hooks/useMoney";
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
import Fieldset from "../../../../components/Base/Fieldset";
import { notify, notifyError } from "../../../../utils/notify";
import { toPhoneNumber } from "../../../../utils/functions";
import classes from "./FormularioVentaPines.module.css";
import fetchData from "../../../../utils/fetchData";
import {
  postCheckReintentoPines,
  fetchConsultaPinEPM,
  fetchConsultaPinSNR,
} from "../../utils/fetchBackPines";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import { v4 } from "uuid";

const minValor = 1000;
const maxValor = 100000;
const minValorEPM = `${process.env.MIN_VALOR_EPM}`;
const maxValorEPM = `${process.env.MAX_VALOR_EPM}`;
const tipo_operacion = 113;
const url_compra_pines = `${process.env.REACT_APP_PRACTISISTEMAS}/pines`;

const CompraPin = () => {
  const { contenedorbtn, contenedorTitulos } = classes;
  const printDiv = useRef();
  const { roleInfo, userInfo, infoTicket } = useAuth();
  const validNavigate = useNavigate();
  const [inputCelular, setInputCelular] = useState("");
  const [inputContador, setInputContador] = useState("");
  const [inputPlaca, setInputPlaca] = useState("");
  const [inputMatricula, setInputMatricula] = useState("");
  const [inputCirculo, setInputCirculo] = useState("");
  const [inputValor, setInputValor] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [typeInfo, setTypeInfo] = useState("Ninguno");
  const [showLoading, setShowLoading] = useState(false);
  const [numeroPinEPM, setNumeroPinEPM] = useState("");
  const { state } = useLocation();
  //******************* Datos del propietario DatosEPM (Variables) ***************
  const [consultaDatosEPM, setConsultaDatosEPM] = useState({
    nombreClienteEpm: "",
    dniClienteEpm: "",
    direccionClienteEpm: "",
    localidadEpm: "",
    departamentoEpm: "",
    respuesta: "",
  });
  // **************************************************************
  //******************* Datos certificado tradicion y libertad SNR (Variables) ***************
  const [consultaDatosSNR, setConsultaDatosSNR] = useState({
    matricula: "",
    municipio: "",
    direccion: "",
    valorPin: "",
  });
  // **************************************************************
  //******************* MODAL EPM**********************************
  const [modalDatosEPM, showModalDatosEPM] = useState(false);
  // **************************************************************
  //******************* MODAL SNR**********************************
  const [modalDatosSNR, showModalDatosSNR] = useState(false);
  // **************************************************************

  //------------------Funcion Para consultar a practisistemas validarPinEpm -------------------------------
  const ConsultaPinesServicio = (e) => {
    e.preventDefault(e);
    if (state?.op == "cb") {
      fetchConsultaPinSNR({
        idcomercio: roleInfo?.["id_comercio"],
        data: {
          circulo: inputCirculo,
          matricula: inputMatricula,
        },
      })
        .then((res) => {
          if (res?.obj?.respuesta == "Consulta con error") {
            if (res?.obj?.data?.nombre == "Usuario no existe") {
              notifyError("Usuario no existe");
            } else if (
              res?.obj?.data?.reply ==
              "Error consultando Matricula, Posiblemente no existe"
            ) {
              notifyError(
                "Error consultando Matrícula, posiblemente no existe"
              );
            } else if (
              res?.obj?.data?.reply == "Error en el codigo de municipio"
            ) {
              notifyError("Error consultando Círculo, posiblemente no existe");
            }
          } else {
            showModalDatosSNR(true);
            setConsultaDatosSNR((old) => {
              return {
                ...old,
                matricula: inputMatricula,
                municipio: res?.obj?.data?.municipio,
                direccion: res?.obj?.data?.dir,
                valorPin: res?.obj?.data?.valorVenta,
                repuesta: res?.obj?.respuesta,
              };
            });
          }
        })
        .catch((err) => {
          notifyError("Transaccón declinada", err);
        });
    } else if (state?.op == "em") {
      fetchConsultaPinEPM({
        idcomercio: roleInfo?.["id_comercio"],
        data: {
          numeroContador: inputContador,
          cantidadVenta: inputValor,
        },
      })
        .then((res) => {
          if (res?.obj?.respuesta == "Consulta con error") {
            if (res?.obj?.data?.nombre == "Usuario no existe") {
              notifyError("Usuario no existe");
            } else if (res?.obj?.data?.reply) {
              notifyError("Cantidad no puede ser menor de 5000");
            }
          } else {
            showModalDatosEPM(true);
            showModalDatosSNR(true);
            setConsultaDatosEPM((old) => {
              return {
                ...old,
                nombreClienteEpm: res?.obj?.data?.nombreClienteEpm,
                dniClienteEpm: res?.obj?.data?.dniClienteEpm,
                direccionClienteEpm: res?.obj?.data?.direccionClienteEpm,
                localidadEpm: res?.obj?.data?.localidadEpm,
                departamentoEpm: res?.obj?.data?.departamentoEpm,
                respuesta: res?.obj?.respuesta,
              };
            });
          }
        })
        .catch((err) => {
          notifyError("Transaccón declinada", err);
        });
    }
  };

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

  const onChangeMoney = useMoney({
    limits: [minValor, maxValor],
    equalError: false,
  });

  const onChangeMoneyEPM = useMoney({
    limits: [minValorEPM, maxValorEPM],
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

  const onContadorChange = (e, valor) => {
    setInputContador(e.target.value);
  };

  const onPlacaChange = (e, placaVh) => {
    setInputPlaca(e.target.value);
  };

  const onCirculoChange = (e, circulo) => {
    setInputCirculo(e.target.value);
  };

  const onMatriculaChange = (e, matricula) => {
    setInputMatricula(e.target.value);
  };

  const onSubmitCheck = (e) => {
    e.preventDefault();

    if (inputCelular[0] != 3) {
      notifyError(
        "Número inválido, el No. de celular debe comenzar con el número 3"
      );
      setTypeInfo("Ninguno");
      setInputValor("");
    } else if (state?.op != "em" && state?.op != "cb") {
      if (state?.sell || inputValor >= 1000) {
        setShowModal(true);
        setTypeInfo("ResumenVentaPin");
      } else {
        notifyError(
          `El valor de la recarga debe ser mayor o igual a ${formatMoney.format(
            minValor
          )}`
        );
        setTypeInfo("Ninguno");
        setInputValor("");
      }
    } else {
      if (inputMatricula || inputContador) {
        ConsultaPinesServicio(e);
      } else {
        setShowModal(true);
        setTypeInfo("ResumenVentaPin");
      }
    }
  };

  const onSubmitCheck2 = (e) => {
    e.preventDefault();
    setShowModal(true);
    setTypeInfo("ResumenVentaPin");
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

    if (state?.op == "cb") {
      newVoucher["trxInfo"][1] = ["", ""];
      newVoucher["trxInfo"][2] = [
        "Número celular",
        toPhoneNumber(inputCelular),
      ];
      newVoucher["trxInfo"][3] = ["", ""];
      newVoucher["trxInfo"][4] = ["Matrícula", inputMatricula];
      newVoucher["trxInfo"][5] = ["", ""];
      newVoucher["trxInfo"][4] = ["Círculo", inputCirculo];
      newVoucher["trxInfo"][5] = ["", ""];
      newVoucher["trxInfo"][6] = [
        "Valor del Pin",
        formatMoney.format(consultaDatosSNR?.valorPin),
      ];
      newVoucher["trxInfo"][7] = ["", ""];
    } else if (state?.op == "em") {
      newVoucher["trxInfo"][1] = ["", ""];
      newVoucher["trxInfo"][2] = [
        "Número celular",
        toPhoneNumber(inputCelular),
      ];
      newVoucher["trxInfo"][3] = ["", ""];
      newVoucher["trxInfo"][4] = ["Contador", inputContador];
      newVoucher["trxInfo"][5] = ["", ""];
      newVoucher["trxInfo"][6] = [
        "Valor del Pin",
        formatMoney.format(inputValor),
      ];
      newVoucher["trxInfo"][7] = ["", ""];
    } else if (state?.op == "hv") {
      newVoucher["trxInfo"][1] = ["", ""];
      newVoucher["trxInfo"][2] = [
        "Número celular",
        toPhoneNumber(inputCelular),
      ];
      newVoucher["trxInfo"][3] = ["", ""];
      newVoucher["trxInfo"][4] = ["Placa", inputPlaca];
      newVoucher["trxInfo"][5] = ["", ""];
      newVoucher["trxInfo"][6] = [
        "Valor del Pin",
        formatMoney.format(inputValor),
      ];
      newVoucher["trxInfo"][7] = ["", ""];
    } else {
      newVoucher["trxInfo"][1] = ["", ""];
      newVoucher["trxInfo"][2] = [
        "Número celular",
        toPhoneNumber(inputCelular),
      ];
      newVoucher["trxInfo"][3] = ["", ""];
      newVoucher["trxInfo"][4] = [
        "Valor del Pin",
        formatMoney.format(state.sell ? state.sell : inputValor),
      ];
      newVoucher["trxInfo"][5] = ["", ""];
    }
console.log('state?.cod =>', state?.cod)
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
        valor_total_trx:
          state?.op == "cb"
            ? consultaDatosSNR?.valorPin
            : state.sell
            ? state.sell
            : inputValor,
        jsonPines: {
          celular: state?.op == "em" ? inputContador : inputCelular,
          operador: state?.op,
          valor:
            state?.op == "cb"
              ? consultaDatosSNR?.valorPin
              : state.sell
              ? state?.cod // Desde informacionPin
              : inputValor,
          jsonAdicional: {
            nombre_usuario: userInfo?.attributes?.name,
            id_uuid_trx: uniqueId,
            placaVh: inputPlaca,
            telEnvio: inputCelular,
            circulo: inputCirculo,
            matricula: inputMatricula,
          },
        },
        ticket: newVoucher,
      },
      {},
      false,
      29000
    )
      .then((res) => {
        if (res?.status == true) {
            notify("Venta exitosa");
            setShowLoading(false);
            VentaExitosa(res?.obj?.response, fecha, hora);
        } else {
          notifyError(res?.obj?.response?.respuesta ==
            ":Error en el numero telefonico, si crees que el numero esta correcto comunicalo al distribuidor" ? "Error en el número telefónico, si crees que el número está correcto comunícalo al distribuidor" : res?.msg);
          setShowLoading(false);
          showModalDatosEPM(false);
          showModalDatosSNR(false);
          setShowModal(false);
          setInputCelular("");
          setInputValor(0);
        }
      })
      .catch(async (err) => {
        notify("Se está procesando la transacción");
        setShowLoading(true);
        console.error(err);
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
                        showModalDatosEPM(false);
                        showModalDatosSNR(false);
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
        [("", "")],

        state?.op == "cb"
          ? ["Matrícula", inputMatricula]
          : state?.op == "hv"
          ? ["Placa", inputPlaca]
          : state?.op == "em"
          ? ["Contador", inputContador]
          : [],

        state?.op == "em" ? ["", ""] : [],
        state?.op == "em"
          ? ["Numero Pin", result_?.jsonAdicional["Numero Pin"]]
          : [],

        ["", ""],
        [
          "Valor del Pin",
          formatMoney.format(
            state.sell
              ? state.sell
              : consultaDatosSNR.valorPin
              ? consultaDatosSNR.valorPin
              : inputValor
          ),
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
        console.error(resTicket);
      })
      .catch((err) => {
        console.error(err);
        notifyError("Error guardando el ticket");
      });
  };

  const handleClosePin = useCallback(() => {
    setShowModal(false);
    validNavigate("/Pines/PinesContenido");
  }, []);

  const handleClose = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    setInputCelular("");
    setInputCelular("");
    setInputValor("");
    setInputCirculo("");
    setInputContador("");
    setInputPlaca("");
    setInputMatricula("");
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
    validNavigate("/Pines/PinesContenido");
  }, []);

  const handleCloseCancelada = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    notify("Venta cancelada");
    setInputCelular("");
    setInputValor("");
    setInputCirculo("");
    setInputContador("");
    setInputPlaca("");
    setInputMatricula("");
    setInfTicket(null);
    showModalDatosEPM(false);
    showModalDatosSNR(false);
  }, []);

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  return (
    <Fragment>
      <SimpleLoading show={showLoading} />
      <h1 className="text-3xl mt-6">Compra Pin: {state?.desc} </h1>
      <Form onSubmit={onSubmitCheck} grid>
        {state?.op == "cb" ? (
          <>
            <Input
              name="circulo"
              label="Círculo"
              type="text"
              autoComplete="off"
              minLength={"1"}
              maxLength={"20"}
              value={inputCirculo}
              onChange={onCirculoChange}
              required
            />
            <Input
              name="matricula"
              label="Matrícula"
              type="text"
              autoComplete="off"
              minLength={"1"}
              maxLength={"12"}
              value={inputMatricula}
              onChange={onMatriculaChange}
              required
            />
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
              <Button type={"submit"}>Realizar Consulta</Button>
            </ButtonBar>
          </>
        ) : state?.op == "em" ? (
          <>
            <Input
              name="contador"
              label="Número de contador"
              type="num"
              autoComplete="off"
              minLength={"10"}
              maxLength={"20"}
              value={inputContador}
              onChange={onContadorChange}
              required
            />
            <MoneyInput
              name="valor"
              label="Valor"
              autoComplete="off"
              min={minValorEPM}
              max={maxValorEPM}
              minLength={"4"}
              maxLength={"9"}
              value={inputValor}
              onInput={(ev) => setInputValor(onChangeMoneyEPM(ev))}
              required
            />
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
              <Button type={"submit"}>Realizar Consulta</Button>
            </ButtonBar>
          </>
        ) : state?.op == "hv" ? (
          <>
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
              value={inputValor}
              onInput={(ev) => setInputValor(onChangeMoney(ev))}
              required
            />
            <Input
              name="placaVh"
              label="Placa de vehículo"
              type="text"
              autoComplete="off"
              minLength={"6"}
              maxLength={"6"}
              value={inputPlaca}
              onChange={onPlacaChange}
              required
            />
            <ButtonBar className={"lg:col-span-2"}>
              <Button type={"submit"}>Realizar Compra</Button>
            </ButtonBar>
          </>
        ) : (
          <>
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
              onInput={(ev) => setInputValor(onChangeMoney(ev))}
              disabled={state?.sell ? true : false}
              required
            />
            <ButtonBar className={"lg:col-span-2"}>
              <Button type={"submit"}>Realizar Compra</Button>
            </ButtonBar>
          </>
        )}
      </Form>
      {/* ########################### Modal de consulta a SNR ##################################3*/}
      {consultaDatosSNR?.repuesta == "Consulta Correcta" &&
      consultaDatosSNR?.municipio ? (
        <Modal show={modalDatosSNR} handleClose={handleClose}>
          <Fieldset legend="Datos Propietario">
            <Form className="lg:col-span-2">
              <div className="grid gap-4 hover:gap-6">
                <div className={contenedorTitulos}>
                  <label className="content-center font-semibold text-xl">{`Dirección:`}</label>
                  <label className="font-medium ml-20">{`${consultaDatosSNR?.direccion}`}</label>
                </div>
                <div className={contenedorTitulos}>
                  <label className="font-semibold text-xl">{`Matrícula:`}</label>
                  <label className="font-medium ml-20">{`${consultaDatosSNR?.matricula}`}</label>
                </div>
                <div className={contenedorTitulos}>
                  <label className="font-semibold text-xl">{`Municipio:`}</label>
                  <label className="font-medium ml-20">{`${consultaDatosSNR?.municipio}`}</label>
                </div>
                <div className={contenedorTitulos}>
                  <label className="font-semibold text-xl">{`Valor del Pin :`}</label>
                  <label className="font-medium ml-20">{`${formatMoney.format(
                    consultaDatosSNR?.valorPin
                  )}`}</label>
                </div>
              </div>
              <div className={contenedorbtn}>
                <ButtonBar>
                  <Button onClick={handleCloseCancelada}>Cancelar</Button>
                </ButtonBar>
                <ButtonBar className="lg:col-span-2">
                  <Button type="" onClick={onSubmitCheck2}>
                    Realizar Venta Pin
                  </Button>
                </ButtonBar>
              </div>
            </Form>
          </Fieldset>
        </Modal>
      ) : (
        /*************** Compra Exitosa Generación Voucher **********************/
        <Modal show={consultaDatosEPM.showModalError} handleClose={handleClose}>
          <Fieldset legend="Datos Erroneos ">
            <Input
              label={"Respuesta"}
              defaultValue={consultaDatosEPM?.respuestaConsulta}
              placeholder={consultaDatosEPM?.marca}
              disabled></Input>
          </Fieldset>
        </Modal>
      )}
      {/* ############################Termina modal de consulta a SNR ######################3/}
      {/* ************************Modal de consulta a EPM ***********************/}
      {consultaDatosEPM?.respuesta == "Consulta Correcta" &&
      consultaDatosEPM?.nombreClienteEpm ? (
        <Modal show={modalDatosEPM} handleClose={handleClose}>
          <Fieldset legend="Datos Propietario">
            <Form className="lg:col-span-2">
              <div className="grid gap-4 hover:gap-6">
                <div className={contenedorTitulos}>
                  <label className="font-semibold text-xl">{`Nombre del Cliente:`}</label>
                  <label className="font-medium ml-20">{`${consultaDatosEPM?.nombreClienteEpm}`}</label>
                </div>
                <div className={contenedorTitulos}>
                  <label className="font-semibold text-xl">{`Documento:`}</label>
                  <label className="font-medium ml-20">{`${consultaDatosEPM?.dniClienteEpm}`}</label>
                </div>
                <div className={contenedorTitulos}>
                  <label className="content-center font-semibold text-xl">{`Dirección:`}</label>
                  <label className="font-medium ml-20">{`${consultaDatosEPM?.direccionClienteEpm}`}</label>
                </div>
                <div className={contenedorTitulos}>
                  <label className="font-semibold text-xl">{`Localidad :`}</label>
                  <label className="font-medium ml-20">{`${consultaDatosEPM?.localidadEpm}`}</label>
                </div>
                <div className={contenedorTitulos}>
                  <label className="font-semibold text-xl">{`Departamento:`}</label>
                  <label className="font-medium ml-20">{`${consultaDatosEPM?.departamentoEpm}`}</label>
                </div>
              </div>
              <div className={contenedorbtn}>
                <ButtonBar>
                  <Button onClick={handleCloseCancelada}>Cancelar</Button>
                </ButtonBar>
                <ButtonBar className="lg:col-span-2">
                  <Button type="" onClick={onSubmitCheck2}>
                    Realizar Venta Pin
                  </Button>
                </ButtonBar>
              </div>
            </Form>
          </Fieldset>
        </Modal>
      ) : (
        /*************** Compra Exitosa Generación Voucher **********************/
        <Modal show={consultaDatosEPM.showModalError} handleClose={handleClose}>
          <Fieldset legend="Datos Erroneos ">
            <Input
              label={"Respuesta"}
              defaultValue={consultaDatosEPM?.respuestaConsulta}
              placeholder={consultaDatosEPM?.marca}
              disabled></Input>
          </Fieldset>
        </Modal>
      )}
      {/* ************************Termina modal de consulta a EPM */}
      <Modal show={showModal} handleClose={handleClose}>
        {/**************** Resumen de la venta del Pin **********************/}
        {typeInfo == "ResumenVentaPin" &&
          (state?.op == "em" ? (
            <PaymentSummary
              title="¿Está seguro de realizar la transacción?"
              subtitle="Resumen de transacción"
              summaryTrx={{
                "Número De Contador": inputContador,
                Celular: toPhoneNumber(inputCelular),
                Valor: formatMoney.format(inputValor),
              }}>
              <>
                <ButtonBar>
                  <Button onClick={handleCloseCancelada}>Cancelar</Button>
                  <Button type={"submit"} onClick={compraPines}>
                    Aceptar
                  </Button>
                </ButtonBar>
              </>
            </PaymentSummary>
          ) : state?.op == "cb" ? (
            <PaymentSummary
              title="¿Está seguro de realizar la transacción?"
              subtitle="Resumen de transacción"
              summaryTrx={{
                Matricula: inputMatricula,
                Circulo: inputCirculo,
                Celular: toPhoneNumber(inputCelular),
                Valor: formatMoney.format(consultaDatosSNR?.valorPin),
              }}>
              <>
                <ButtonBar>
                  <Button onClick={handleCloseCancelada}>Cancelar</Button>
                  <Button type={"submit"} onClick={compraPines}>
                    Aceptar
                  </Button>
                </ButtonBar>
              </>
            </PaymentSummary>
          ) : state?.op == "hv" ? (
            <PaymentSummary
              title="¿Está seguro de realizar la transacción?"
              subtitle="Resumen de transacción"
              summaryTrx={{
                Placa: inputPlaca,
                Celular: toPhoneNumber(inputCelular),
                Valor: formatMoney.format(inputValor),
              }}>
              <>
                <ButtonBar>
                  <Button onClick={handleCloseCancelada}>Cancelar</Button>
                  <Button type={"submit"} onClick={compraPines}>
                    Aceptar
                  </Button>
                </ButtonBar>
              </>
            </PaymentSummary>
          ) : (
            <PaymentSummary
              title="¿Está seguro de realizar la transacción?"
              subtitle="Resumen de transacción"
              summaryTrx={{
                Celular: toPhoneNumber(inputCelular),
                Valor: formatMoney.format(
                  state?.sell ? state?.sell : inputValor
                ),
              }}>
              <>
                <ButtonBar>
                  <Button onClick={handleCloseCancelada}>Cancelar</Button>
                  <Button type={"submit"} onClick={compraPines}>
                    Aceptar
                  </Button>
                </ButtonBar>
              </>
            </PaymentSummary>
          ))}
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
