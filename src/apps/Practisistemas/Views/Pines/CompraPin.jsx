import React, { Fragment, useCallback, useEffect, useRef, useState, } from "react";
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
import { notify, notifyError, notifyPending } from "../../../../utils/notify";
import { toPhoneNumber } from "../../../../utils/functions";
import classes from "./FormularioVentaPines.module.css";
import { fetchConsultaPinEPM, fetchConsultaPinSNR } from "../../utils/fetchBackPines";
import { useNavigate, useLocation } from "react-router-dom";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import { v4 } from "uuid";
import { enumLimiteApuestas } from "../enumLimiteApuestas";
import { useFetchPractisistemas } from "../../hooks/fetchPractisistemasHook";

const minValor = enumLimiteApuestas.minPines;
const maxValor = enumLimiteApuestas.maxPines;
const minValorEPM = enumLimiteApuestas.minPinesEPM;
const maxValorEPM = enumLimiteApuestas.maxPinesEPM;

const URL_PINES = `${process.env.REACT_APP_PRACTISISTEMAS}/pines/transacciones`;
const URL_CONSULTA_PINES = `${process.env.REACT_APP_PRACTISISTEMAS}/pines/consulta-estado-trx`;


const CompraPin = () => {
  const { contenedorbtn, contenedorTitulos } = classes;
  const { roleInfo,  pdpUser } = useAuth();
  const [inputCelular, setInputCelular] = useState("");
  const [inputContador, setInputContador] = useState("");
  const [inputPlaca, setInputPlaca] = useState("");
  const [inputMatricula, setInputMatricula] = useState("");
  const [inputCirculo, setInputCirculo] = useState("");
  const [inputValor, setInputValor] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [typeInfo, setTypeInfo] = useState("Ninguno");
  const [showLoading, setShowLoading] = useState(false);
  const validNavigate = useNavigate();
  const { state } = useLocation();
  const printDiv = useRef();
  const id_uuid = v4();
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
  
  const ConsultaPinEPM = (e) => {
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
          setShowLoading(false);
          if (!res?.status) {
            notifyError(res?.msg);
            validNavigate("/Pines/PinesContenido");
          } else{
            if (res?.obj?.respuesta == "Consulta con error") {
              if (res?.obj?.data?.nombre == "Usuario no existe") {
                notifyError("Error respuesta Practisistemas:(Consulta invalida[Usuario no existe])")
              } else if (
                res?.obj?.data?.reply ==
                "Error consultando Matricula, Posiblemente no existe"
              ) {
                notifyError("Error respuesta Practisistemas:(Consulta invalida [Error consultando Matrícula, posiblemente no existe])")
              } else if (
                res?.obj?.data?.reply == "Error en el codigo de municipio"
              ) {
                notifyError("Error respuesta Practisistemas:(Consulta invalida[Error consultando Círculo, posiblemente no existe])")
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
          }
        })
        .catch((err) => {
          notifyError("Error respuesta PDP:Transaccón declinada", err)
          setShowLoading(false);
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
          setShowLoading(false);
          if (!res?.status) {
            notifyError(res?.msg);
            validNavigate("/Pines/PinesContenido");
          } else{
            if (res?.obj?.respuesta == "Consulta con error") {
              if (res?.obj?.data?.nombre == "Usuario no existe") {
                notifyError("Error respuesta Practisistemas:(Consulta invalida[Usuario no existe])");
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
            }}
        })
        .catch((err) => {
          notifyError("Error respuesta PDP:Transaccón declinada", err)
          setShowLoading(false);
        });
    }
  };
 const [infTicket, setInfTicket] = useState({});
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

  const handleKeyPress = (event) => {
    const pattern = /^[a-zA-Z0-9 ]*$/; // Patrón para aceptar solo letras, números y espacios en blanco
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault(); // Prevenir que se ingrese el caracter especial
    }
  };
  const onPlacaChange = (e, placaVh) => {
    const input = e.target.value.toUpperCase(); // Convertir a mayúsculas
    setInputPlaca(input);
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
        setShowLoading(true);
        ConsultaPinEPM(e);
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

  const [loadingPeticionPines, peticionPines] = useFetchPractisistemas(
    URL_PINES,
    URL_CONSULTA_PINES,
    "Realizar compra pines practisistemas"
  );

  const compraPines = useCallback(
    (ev) => {
      ev.preventDefault();
      setShowLoading(true);
      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_terminal: roleInfo?.id_dispositivo,
          id_usuario: roleInfo?.id_usuario,
          id_uuid_trx: id_uuid,
        },
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" || roleInfo?.tipo_comercio === "KIOSCO" ? true : false,
        nombre_comercio: roleInfo["nombre comercio"],
        valor_total_trx:
          state?.op == "cb"
            ? consultaDatosSNR?.valorPin
            : state.sell
              ? state.sell
              : inputValor,
        celular: state?.op == "em" ? inputContador.toString() : inputCelular,
        operador: state?.op,
        address: roleInfo?.direccion,
        jsonAdicional: 
        state?.op == "hv" ? {placaVh: inputPlaca} 
        : state?.op == "em" ? {telEnvio: inputCelular} 
        : state?.op == "cb" ? {
          circulo: inputCirculo,
          matricula: inputMatricula,
        } 
        : {},
        convenio: state?.desc,
        num_celular_original: inputCelular,
        trx_inf_ticket: state?.op === "hv" ? inputPlaca
         : state?.op === "em" ? inputCelular
         : state?.op === "cb" ? inputMatricula
        : ""
      };
      const dataAditional = {
        id_uuid_trx: id_uuid,
      };
      notifyPending(
        peticionPines(data, dataAditional),
        {
          render: () => {
            return "Procesando compra de pin";
          },
        },
        {
          render: ({ data: res }) => {
            setInfTicket(res?.obj?.ticket);
            setTypeInfo("VentaExitosa");
            setShowLoading(false);
            return "Compra de pin satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            validNavigate("/Pines/PinesContenido");
            return error?.message ?? "Compra de pin fallida";
          },
        }
      );
    },
    [roleInfo, pdpUser, id_uuid, state, inputCelular, inputValor, validNavigate]
  );
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
    setInfTicket({});
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
    setInfTicket({});
    showModalDatosEPM(false);
    showModalDatosSNR(false);
  }, []);

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  useEffect(() => {
    if (!state?.op) {
      validNavigate("/Pines/PinesContenido");
    }
  }, [state?.op]);
  return (
    <Fragment>
      <SimpleLoading show={showLoading} />
      <h1 className="text-3xl mt-6">Compra Pin: {state?.desc == "Certificado TL" ? "Certificado de Tradición y Libertad (SNR)" : state?.desc == "Historico Vehicular" ? "Histórico Vehicular" : state?.desc} </h1>
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
              onKeyPress={handleKeyPress}
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
              onKeyPress={handleKeyPress}
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
              type="text"
              autoComplete="off"
              minLength={"10"}
              maxLength={"20"}
              value={inputContador}
              onChange={onContadorChange}
              onKeyPress={handleKeyPress}
              required
            />
            <MoneyInput
              name="valor"
              label="Valor"
              autoComplete="off"
              min={minValorEPM}
              max={maxValorEPM}
              equalError={false}
              equalErrorMin={false}
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
              equalError={false}
              equalErrorMin={false}
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
              onKeyPress={handleKeyPress}
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
              equalError={false}
              equalErrorMin={false}
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
            <Form className="lg:col-span-2">
              <PaymentSummary 
                title="Datos del propietario"
                subtitle=""
                summaryTrx={{
                  "Matrícula": consultaDatosSNR?.matricula,
                  "Círculo": inputCirculo,
                  "Municipio": consultaDatosSNR?.municipio,
                  "Valor": formatMoney.format(
                    consultaDatosSNR?.valorPin),
                  "Dirección": consultaDatosSNR?.direccion,
                }}
                className="text-center">
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
              </PaymentSummary>
            </Form>
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
            <Form className="lg:col-span-2">
            <PaymentSummary 
              title="Datos del propietario"
              subtitle=""
              summaryTrx={{
                "Nombre del Cliente": consultaDatosEPM?.nombreClienteEpm,
                "Documento": consultaDatosEPM?.dniClienteEpm,
                "Dirección": consultaDatosEPM?.direccionClienteEpm,
                "Localidad": consultaDatosEPM?.localidadEpm,
                "Departamento": consultaDatosEPM?.departamentoEpm,
              }}>
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
            </PaymentSummary>
            </Form>
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
                Descripción: state?.desc,
                Celular: toPhoneNumber(inputCelular),
                Pin: "EPM",
                Valor: formatMoney.format(inputValor),
              }}>
              <>
                <ButtonBar>
                  <Button 
                    onClick={handleCloseCancelada}
                    disabled= {loadingPeticionPines}>
                    Cancelar
                  </Button>
                  <Button 
                    type={"submit"} 
                    onClick={compraPines}
                    disabled= {loadingPeticionPines}>
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
                Descripción: "Certificado de tradición y libertad",
                Matricula: inputMatricula,
                Circulo: inputCirculo,
                Celular: toPhoneNumber(inputCelular),
                Pin: state?.desc,
                Valor: formatMoney.format(consultaDatosSNR?.valorPin),
              }}>
              <>
                <ButtonBar>
                  <Button 
                    onClick={handleCloseCancelada}
                    disabled= {loadingPeticionPines}>
                    Cancelar
                  </Button>
                  <Button 
                    type={"submit"} 
                    onClick={compraPines}
                    disabled= {loadingPeticionPines}>
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
                Descripción: "Histórico Vehicular",
                Celular: toPhoneNumber(inputCelular),
                Placa: inputPlaca,
                Valor: formatMoney.format(inputValor),
              }}>
              <>
                <ButtonBar>
                  <Button 
                    onClick={handleCloseCancelada}
                    disabled= {loadingPeticionPines}>
                    Cancelar
                  </Button>
                  <Button 
                    type={"submit"} 
                    onClick={compraPines}
                    disabled= {loadingPeticionPines}>
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
                Descripción:state?.desc,
                Celular: toPhoneNumber(inputCelular),
                Pin: state?.op === "nx" ? "Netflix" : state?.op === "sf" ? "Spotify" : state?.op === "xb" ? "Xbox" : state?.op === "of" ? "Microsoft Office" : state?.op === "pt" ? "Play Station" : state?.op === "ka" ? "Kaspersky" : state?.op === "ra" ? "Razer GOLD" : state?.op === "iu" ? "Imvu" : state?.op === "ws" ? "WinSports" : state?.op === "j4" ? "J4 Infinity" : state?.op === "pp" ? "Paramount+" : state?.op === "dz" ? "Deezer" : state?.op === "cr" ? "Crunchyroll" : state?.op === "dg" ? "Directv GO" : state?.op,
                Valor: formatMoney.format(
                  state?.sell ? state?.sell : inputValor
                ),
              }}>
              <>
                <ButtonBar>
                  <Button 
                    onClick={handleCloseCancelada}
                    disabled= {loadingPeticionPines}>
                    Cancelar
                  </Button>
                  <Button 
                    type={"submit"} 
                    onClick={compraPines}
                    disabled= {loadingPeticionPines}>
                    Aceptar
                  </Button>
                </ButtonBar>
              </>
            </PaymentSummary>
          ))}
        {/**************** Resumen de la venta del Pin **********************/}
        {/**************** Venta del Pin Exitosa **********************/}
        {infTicket && (typeInfo == "VentaExitosa" &&
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
