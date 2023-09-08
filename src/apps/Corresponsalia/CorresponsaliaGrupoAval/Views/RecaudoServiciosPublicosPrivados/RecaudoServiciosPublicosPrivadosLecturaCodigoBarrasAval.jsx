import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import Modal from "../../../../../components/Base/Modal";
import MoneyInputDec from "../../../../../components/Base/MoneyInputDec";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import TextArea from "../../../../../components/Base/TextArea";
import { useAuth } from "../../../../../hooks/AuthHooks";
import useMoney from "../../../../../hooks/useMoney";
import { makeMoneyFormatter } from "../../../../../utils/functions";
import { notify, notifyError } from "../../../../../utils/notify";
import TicketsAval from "../../components/TicketsAval";
import {
  postConsultaCodigoBarrasConveniosEspecifico,
  postConsultaConveniosAval,
  postRecaudoConveniosAval,
} from "../../utils/fetchRecaudoServiciosPublicosPrivados";
import MoneyInput from "../../../../../components/Base/MoneyInput/MoneyInput";
import { enumParametrosGrupoAval } from "../../utils/enumParametrosGrupoAval";

const RecaudoServiciosPublicosPrivadosLecturaCodigoBarrasAval = () => {
  const { roleInfo, pdpUser } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [peticion, setPeticion] = useState(0);
  const [validacionPago, setValidacionPago] = useState({
    validacion: 0,
    estado: true,
  });
  const formatMoney = makeMoneyFormatter(2);
  const [objTicketActual, setObjTicketActual] = useState({
    title: "RECIBO DE PAGO",
    timeInfo: {
      "Fecha de pago": "",
      Hora: "",
    },
    commerceInfo: [
      /*id_comercio*/
      ["Id comercio", roleInfo?.id_comercio ? roleInfo?.id_comercio : 0],
      /*id_dispositivo*/
      ["No. terminal", roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 0],
      /*Id trx*/
      ["Id Trx", ""],
      /*Id Aut*/
      ["Id Aut", ""],
      /*comercio*/
      [
        "Comercio",
        roleInfo?.["nombre comercio"]
          ? roleInfo?.["nombre comercio"]
          : "Sin datos",
      ],
      ["", ""],
      /*direccion*/
      ["Dirección", roleInfo?.direccion ? roleInfo?.direccion : "Sin datos"],
      ["", ""],
    ],
    commerceName: "Recaudo de facturas",
    trxInfo: [],
    disclamer:
      "Corresponsal bancario para Banco de Occidente. La impresión de este tiquete implica su aceptación, verifique la información. Este es el unico recibo oficial de pago. Requerimientos 018000 514652.",
  });
  const [datosTrans, setDatosTrans] = useState({
    codBarras: "",
  });
  const [datosEnvio, setDatosEnvio] = useState({
    datosCodigoBarras: {},
    datosConvenio: {},
    estadoConsulta: false,
    estadoFecha: false,
  });
  const [datosTransaccion, setDatosTransaccion] = useState({
    ref1: "",
    ref2: "",
    valor: "",
    showValor: "",
    showValor2: "",
    valorSinModificar: "",
    valorSinModificar2: "",
    data: "",
  });
  const [datosConsulta, setDatosConsulta] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const onChangeFormat = useCallback(
    (ev) => {
      const valor = ev.target.value;
      if (valor.length > datosTrans.codBarras.length) {
        setDatosTrans((old) => {
          return { ...old, [ev.target.name]: valor };
        });
      }
    },
    [datosTrans]
  );
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const fetchTablaConveniosEspecificoFunc = useCallback((codigoBar) => {
    postConsultaCodigoBarrasConveniosEspecifico({
      codigoBarras: codigoBar,
    })
      .then((autoArr) => {
        if (autoArr?.status) {
          notify(autoArr?.msg);
          let dateStatus = false;
          if (
            datosEnvio?.datosCodigoBarras?.fechaCaducidad?.length &&
            datosEnvio?.datosCodigoBarras?.fechaCaducidad?.length > 0
          ) {
            const dateVenc = new Date(
              datosEnvio?.datosCodigoBarras?.fechaCaducidad[0]
            );
            dateVenc.setHours(dateVenc.getHours() + 5);
            const dateActual = new Date();
            if (dateActual.getTime() > dateVenc.getTime()) {
              dateStatus = true;
              notifyError("Se ha vencido el pago");
            }
          }
          setDatosEnvio({
            datosCodigoBarras: autoArr?.obj.datosCodigoBarras,
            datosConvenio: autoArr?.obj.datosConvenio[0],
            estadoConsulta: true,
            estadoFecha: dateStatus,
          });
          let valorTrx = autoArr?.obj.datosCodigoBarras.pago[0] ?? 0;
          setDatosTransaccion((old) => {
            return {
              ...old,
              ref1: autoArr?.obj.datosCodigoBarras.codigosReferencia[0] ?? "",
              ref2: autoArr?.obj.datosCodigoBarras.codigosReferencia[1] ?? "",
              showValor: formatMoney.format(valorTrx) ?? "",
              valor: valorTrx ?? "",
              valorSinModificar: valorTrx ?? "",
            };
          });
        } else {
          notifyError(autoArr?.msg);
          setDatosTrans((old) => ({ codBarras: "" }));
        }
        setIsUploading(false);
      })
      .catch((err) => {
        setIsUploading(false);
        notifyError("No se ha podido conectar al servidor");
        console.error(err);
        setDatosTrans((old) => ({ codBarras: "" }));
      });
  }, []);
  const onSubmit = (e) => {
    e.preventDefault();
    if (datosTrans?.codBarras.includes("415")) {
      setIsUploading(true);
      fetchTablaConveniosEspecificoFunc(datosTrans?.codBarras);
    } else {
      notifyError("El código de barras no tiene el formato correcto");
    }
  };
  const habilitarModal = () => {
    setShowModal(true);
  };

  const hideModal = () => {
    setPeticion(0);
    setShowModal(false);
    setObjTicketActual((old) => {
      return {
        ...old,
        commerceInfo: [
          /*id transaccion recarga*/
          /*id_dispositivo*/
          [
            "No. Terminal",
            roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 0,
          ],
          /*telefono*/
          ["Teléfono", roleInfo?.telefono ? roleInfo?.telefono : "Sin datos"],
          /*Id trx*/
          ["Id Trx", ""],
          /*Id Aut*/
          ["Id Aut", ""],
          /*comercio*/
          [
            "Comercio",
            roleInfo?.["nombre comercio"]
              ? roleInfo?.["nombre comercio"]
              : "Sin datos",
          ],
          ["", ""],
          /*direccion*/
          [
            "Dirección",
            roleInfo?.direccion ? roleInfo?.direccion : "Sin datos",
          ],
          ["", ""],
        ],
        trxInfo: [],
      };
    });
  };
  const hideModalReset = () => {
    setDatosEnvio({
      datosCodigoBarras: {},
      datosConvenio: {},
      estadoConsulta: false,
      estadoFecha: false,
    });
    setDatosTrans({ codBarras: "" });
    setDatosTransaccion({
      ref1: "",
      ref2: "",
      valor: "",
      showValor: "",
      valorSinModificar: "",
      data: "",
    });
    setShowModal(false);
    setPeticion(0);
    setObjTicketActual((old) => {
      return {
        ...old,
        commerceInfo: [
          /*id transaccion recarga*/
          /*id_dispositivo*/
          [
            "No. Terminal",
            roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 0,
          ],
          /*telefono*/
          ["Teléfono", roleInfo?.telefono ? roleInfo?.telefono : "Sin datos"],
          /*Id trx*/
          ["Id Trx", ""],
          /*Id Aut*/
          ["Id Aut", ""],
          /*comercio*/
          [
            "Comercio",
            roleInfo?.["nombre comercio"]
              ? roleInfo?.["nombre comercio"]
              : "Sin datos",
          ],
          ["", ""],
          /*direccion*/
          [
            "Dirección",
            roleInfo?.direccion ? roleInfo?.direccion : "Sin datos",
          ],
          ["", ""],
        ],
        trxInfo: [],
      };
    });
  };
  const onSubmitConfirm = (e) => {
    e.preventDefault();
    for (
      let i = 0;
      i < datosEnvio.datosCodigoBarras.codigosReferencia.length;
      i++
    ) {
      if (parseInt(datosEnvio.datosCodigoBarras.codigosReferencia[i]) <= 0) {
        return notifyError("La referencia no puede ser 0");
      }
    }
    setIsUploading(true);
    let codBarrasIndex = datosTrans.codBarras.indexOf("415");
    let codBarras = datosTrans.codBarras.slice(codBarrasIndex);
    postConsultaConveniosAval({
      oficina_propia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
        roleInfo?.tipo_comercio === "KIOSCO"
          ? true
          : false,
      valor_total_trx: datosTransaccion.valorSinModificar ?? 0,
      nombre_comercio: roleInfo?.["nombre comercio"],
      nombre_usuario: pdpUser?.uname ?? "",
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
      },
      recaudoAval: {
        numeroConvenio: datosEnvio?.datosConvenio?.nura,
        valReferencia1: datosEnvio.datosCodigoBarras.codigosReferencia[0] ?? "",
        codigoBarras: codBarras.replace(/[\x1D]/g, ""),
        location: {
          address: roleInfo?.["direccion"],
          dane_code: roleInfo?.codigo_dane,
          city: roleInfo?.["ciudad"],
        },
      },
    })
      .then((res) => {
        if (res?.status) {
          setIsUploading(false);
          notify(res?.msg);
          setDatosConsulta(res?.obj);
          let valorTrxCons = res?.obj?.valorTrx ?? 0;
          let valorTrxPago = res?.obj?.valorTrx ?? 0;
          if (datosEnvio?.datosConvenio?.parciales === "1") {
            if (datosEnvio.datosCodigoBarras.pago[0])
              valorTrxPago = datosTransaccion.valorSinModificar;
            setValidacionPago((old) => ({
              ...old,
              estado: false,
            }));
            // }
          }
          setDatosTransaccion((old) => {
            return {
              ...old,
              showValor2: formatMoney.format(valorTrxPago) ?? "",
              valor: valorTrxPago ?? "",
              valorSinModificar2: valorTrxCons ?? "",
            };
          });
          setPeticion(2);
          habilitarModal();
        } else {
          setIsUploading(false);
          notifyError(res?.msg);
          hideModal();
          navigate(-1);
        }
      })
      .catch((err) => {
        setIsUploading(false);
        notifyError("No se ha podido conectar al servidor");
        navigate(-1);
        console.error(err);
      });
  };
  const onSubmitPago = (e) => {
    e.preventDefault();
    if (validacionPago.estado) {
      if (
        parseInt(datosTransaccion.valorSinModificar2) !==
        parseInt(validacionPago.validacion)
      ) {
        return notifyError(
          "El valor a pagar es diferente al valor ingresado"
        );
      }
    }
    setIsUploading(true);
    const valorTransaccion = parseInt(datosTransaccion.valor) ?? 0;
    const fecha = Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    /*hora actual */
    const hora = Intl.DateTimeFormat("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date());
    const objTicket = { ...objTicketActual };
    objTicket["timeInfo"]["Fecha de pago"] = fecha;
    objTicket["timeInfo"]["Hora"] = hora;
    objTicket["trxInfo"].push([
      "Convenio",
      datosEnvio?.datosConvenio?.convenio,
    ]);
    objTicket["trxInfo"].push(["", ""]);
    objTicket["trxInfo"].push([
      "Referencia de pago",
      datosEnvio.datosCodigoBarras.codigosReferencia[0] ?? "",
    ]);
    objTicket["trxInfo"].push(["", ""]);
    objTicket["trxInfo"].push([
      "Valor",
      formatMoney.format(valorTransaccion ?? "0"),
    ]);
    objTicket["trxInfo"].push(["", ""]);
    setIsUploading(true);
    postRecaudoConveniosAval({
      oficina_propia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
        roleInfo?.tipo_comercio === "KIOSCO"
          ? true
          : false,
      valor_total_trx: valorTransaccion,
      nombre_comercio: roleInfo?.["nombre comercio"],
      nombre_usuario: pdpUser?.uname ?? "",
      ticket: objTicket,
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
      },
      recaudoAval: {
        pila: datosConsulta?.["pila"] ?? "",
        54: datosConsulta?.tipoRecaudo?.["54"] ?? "",
        62: datosConsulta?.tipoRecaudo?.["62"] ?? "",
        103: datosConsulta?.tipoRecaudo?.["103"] ?? "",
        104: datosConsulta?.tipoRecaudo?.["104"] ?? "",
        numeroConvenio: datosEnvio?.datosConvenio?.nura,
        valReferencia1: datosEnvio.datosCodigoBarras.codigosReferencia[0] ?? "",
        location: {
          address: roleInfo?.["direccion"],
          dane_code: roleInfo?.codigo_dane,
          city: roleInfo?.["ciudad"],
        },
      },
    })
      .then((res) => {
        if (res?.status) {
          setIsUploading(false);
          notify(res?.msg);
          objTicket["commerceInfo"][2] = ["Id Trx", res?.obj?.id_trx];
          objTicket["commerceInfo"][3] = [
            "Id Aut",
            res?.obj?.codigo_autorizacion,
          ];
          setObjTicketActual(objTicket);
          setPeticion(4);
        } else {
          setIsUploading(false);
          notifyError(res?.msg);
          hideModal();
          navigate(-1);
        }
      })
      .catch((err) => {
        setIsUploading(false);
        notifyError("No se ha podido conectar al servidor");
        navigate(-1);
        console.error(err);
      });
  };
  const onChangeMoney = useMoney({
    limits: [1, 9999999],
    decimalDigits: 2,
  });

  const printDiv = useRef();
  const isAlt = useRef("");
  const isAltCR = useRef({ data: "", state: false });
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl text-center mb-10 mt-5'>
        Recaudo servicios públicos y privados
      </h1>
      {!datosEnvio.estadoConsulta ? (
        <>
          <Form>
            <TextArea
              id='codBarras'
              label='Escanee el código de barras'
              type='text'
              name='codBarras'
              required
              value={datosTrans.codBarras}
              autoFocus
              autoComplete='off'
              onInput={onChangeFormat}
              onKeyDown={(ev) => {
                if (ev.keyCode === 13 && ev.shiftKey === false) {
                  // ev.preventDefault();
                  onSubmit(ev);
                  return;
                }
                if (ev.altKey) {
                  if (isAltCR.current.state) {
                    isAltCR.current = {
                      ...isAltCR.current,
                      data: isAltCR.current.data + ev.key,
                    };
                  }
                  if (ev.keyCode !== 18) {
                    isAlt.current += ev.key;
                  } else {
                    isAltCR.current = { ...isAltCR.current, state: true };
                  }
                }
              }}
              onKeyUp={(ev) => {
                if (ev.altKey === false && isAlt.current !== "") {
                  let value = String.fromCharCode(parseInt(isAlt.current));
                  isAlt.current = "";
                  if (value === "\u001d") {
                    setDatosTrans((old) => {
                      return { ...old, codBarras: old.codBarras + "\u001d" };
                    });
                  }
                }
                if (ev.keyCode === 18) {
                  if (isAltCR.current.data === "013") {
                    onSubmit(ev);
                  }
                  isAltCR.current = {
                    ...isAltCR.current,
                    state: false,
                    data: "",
                  };
                }
              }}></TextArea>
            {datosTrans.codBarras !== "" && (
              <ButtonBar>
                <Button
                  type='button'
                  onClick={() => {
                    setDatosTrans({ codBarras: "" });
                  }}>
                  Volver a ingresar código de barras
                </Button>
              </ButtonBar>
            )}
          </Form>
        </>
      ) : (
        <>
          <h1 className='text-3xl text-center  mb-10'>{`Convenio: ${
            datosEnvio?.datosConvenio?.convenio ?? ""
          }`}</h1>
          <Form
            onSubmit={onSubmitConfirm}
            // grid={
            //   datosEnvio.datosCodigoBarras.parciales === "1" &&
            //   (datosEnvio?.datosCodigoBarras?.fechaCaducidad?.length > 0 ||
            //     datosEnvio.datosCodigoBarras.pago[0])
            // }
            grid={
              (datosEnvio?.datosCodigoBarras?.fechaCaducidad?.length &&
                datosEnvio?.datosCodigoBarras?.fechaCaducidad?.length > 0) ||
              datosEnvio.datosCodigoBarras.pago[0]
            }>
            <Input
              id='ref1'
              label='Referencia 1'
              type='text'
              name='ref1'
              minLength='32'
              maxLength='32'
              disabled={true}
              value={datosEnvio.datosCodigoBarras.codigosReferencia[0] ?? ""}
              onInput={(e) => {
                // setDatosTransaccion((old) => {
                //   return { ...old, ref1: e.target.value };
                // });
              }}></Input>

            {datosEnvio?.datosCodigoBarras?.fechaCaducidad?.length &&
            datosEnvio?.datosCodigoBarras?.fechaCaducidad?.length > 0 ? (
              <Input
                id='ref2'
                label='Fecha de caducidad'
                type='text'
                name='ref2'
                minLength='32'
                maxLength='32'
                disabled={true}
                value={datosEnvio.datosCodigoBarras.fechaCaducidad[0] ?? ""}
                onInput={(e) => {
                  // setDatosTransaccion((old) => {
                  //   return { ...old, ref2: e.target.value };
                  // });
                }}></Input>
            ) : (
              <></>
            )}
            {datosEnvio.datosCodigoBarras.pago[0] && (
              <MoneyInputDec
                id='valCashOut'
                name='valCashOut'
                label='Valor a pagar original'
                type='text'
                autoComplete='off'
                maxLength={"15"}
                disabled={true}
                value={datosTransaccion.valorSinModificar ?? ""}
                onInput={(e, valor) => {
                  if (!isNaN(valor)) {
                    const num = valor;
                    // setDatosTransaccion((old) => {
                    //   return { ...old, valor: num };
                    // });
                  }
                }}
                required></MoneyInputDec>
            )}
            <ButtonBar className='lg:col-span-2'>
              <Button
                type='button'
                onClick={() => {
                  setDatosEnvio({
                    datosCodigoBarras: {},
                    datosConvenio: {},
                    estadoConsulta: false,
                    estadoFecha: false,
                  });
                  setDatosTrans({ codBarras: "" });
                  setDatosTransaccion({
                    ref1: "",
                    ref2: "",
                    valor: "",
                    showValor: "",
                    valorSinModificar: "",
                    data: "",
                  });
                }}>
                Volver a ingresar código de barras
              </Button>
              {!datosEnvio.estadoFecha && (
                <Button type='submit'>Realizar consulta</Button>
              )}
            </ButtonBar>
          </Form>
          <Modal show={showModal} handleClose={hideModal}>
            <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
              {peticion === 2 && (
                <>
                  <h1 className='text-2xl text-center mb-5 font-semibold'>
                    Resultado consulta
                  </h1>
                  <h2>{`Nombre convenio: ${datosEnvio?.datosConvenio?.convenio}`}</h2>
                  <h2>{`Número convenio: ${datosEnvio?.datosConvenio?.nura}`}</h2>
                  <h2>{`Referencia 1: ${
                    datosEnvio.datosCodigoBarras.codigosReferencia[0] ?? ""
                  }`}</h2>
                  <h2 className='text-base font-semibold'>
                    {`${
                      validacionPago.estado
                        ? "Valor a pagar:"
                        : "Valor consultado:"
                    } ${formatMoney.format(
                      datosTransaccion.valorSinModificar2
                    )} `}
                  </h2>
                  {validacionPago.estado ? (
                    <Form grid onSubmit={onSubmitPago}>
                      <h2 className='text-base font-semibold'>
                        Por favor ingresar el valor a pagar para confirmar la
                        transacción
                      </h2>
                      <MoneyInput
                        id='valCashOut'
                        name='valCashOut'
                        label='Validación valor'
                        type='text'
                        min={0}
                        max={datosTransaccion.valorSinModificar2}
                        autoComplete='off'
                        maxLength={"12"}
                        value={parseInt(validacionPago.validacion)}
                        onInput={(e, val) => {
                          setValidacionPago((old) => {
                            return { ...old, validacion: val };
                          });
                        }}
                        required
                        equalError={false}
                        equalErrorMin={false}
                      />
                      <ButtonBar>
                        <Button
                          onClick={() => {
                            notifyError("Transacción cancelada por el usuario");
                            hideModalReset();
                          }}>
                          Cancelar
                        </Button>
                        <Button type='submit' onClick={onSubmitPago}>
                          Realizar pago
                        </Button>
                      </ButtonBar>
                    </Form>
                  ) : (
                    <Form grid onSubmit={onSubmitPago}>
                      <MoneyInput
                        id='valCashOut'
                        name='valCashOut'
                        label='Valor a pagar'
                        min={enumParametrosGrupoAval.MIN_RECAUDO_AVAL}
                        max={enumParametrosGrupoAval.MAX_RECAUDO_AVAL}
                        type='text'
                        autoComplete='off'
                        maxLength={"12"}
                        value={datosTransaccion.showValor2 ?? ""}
                        onInput={(ev, valMoney) =>
                          setDatosTransaccion((old) => ({
                            ...old,
                            valor: valMoney,
                            showValor2: valMoney,
                          }))
                        }
                        equalError={false}
                        equalErrorMin={false}
                        required></MoneyInput>
                      <ButtonBar>
                        <Button
                          onClick={() => {
                            notifyError("Transacción cancelada por el usuario");
                            hideModalReset();
                          }}>
                          Cancelar
                        </Button>
                        <Button type='submit' onClick={onSubmitPago}>
                          Realizar pago
                        </Button>
                      </ButtonBar>
                    </Form>
                  )}
                </>
              )}
              {peticion === 4 && (
                <>
                  <TicketsAval
                    ticket={objTicketActual}
                    refPrint={printDiv}></TicketsAval>

                  <ButtonBar>
                    <Button onClick={handlePrint}>Imprimir</Button>
                    <Button
                      type='button'
                      onClick={() => {
                        hideModalReset();
                        navigate(-1);
                      }}>
                      Cerrar
                    </Button>
                  </ButtonBar>
                </>
              )}
            </div>
          </Modal>
        </>
      )}
    </>
  );
};

export default RecaudoServiciosPublicosPrivadosLecturaCodigoBarrasAval;
