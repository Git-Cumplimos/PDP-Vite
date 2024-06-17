import { useCallback, useRef, useState } from "react";
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
import { makeMoneyFormatter } from "../../../../../utils/functions";
import { notify, notifyError } from "../../../../../utils/notify";
import TicketsAgrario from "../../components/TicketsBancoAgrario/TicketsAgrario";
import {
  postConsultaCodigoBarrasConveniosEspecifico,
  postRecaudoConveniosAgrario,
} from "../../utils/fetchRecaudoServiciosPublicosPrivados";
import { enumParametrosBancoAgrario } from "../../utils/enumParametrosBancoAgrario";

const RecaudoServiciosPublicosPrivadosLecturaCodigoBarrasAgrario = () => {
  const { roleInfo, pdpUser } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [peticion, setPeticion] = useState(0);
  const formatMoney = makeMoneyFormatter(2);
  const [objTicketActual, setObjTicketActual] = useState({});
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
    ref3: "",
    valor: "",
    showValor: "",
    showValor2: "",
    valorSinModificar: "",
    valorSinModificar2: "",
    data: "",
  });
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
            datosEnvio?.datosCodigoBarras?.fecha_caducidad?.length &&
            datosEnvio?.datosCodigoBarras?.fecha_caducidad?.length > 0
          ) {
            const dateVenc = new Date(
              datosEnvio?.datosCodigoBarras?.fecha_caducidad[0]
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
              ref1: autoArr?.obj.datosCodigoBarras.codigos_referencia[0] ?? "",
              ref2: autoArr?.obj.datosCodigoBarras.codigos_referencia[1] ?? "",
              ref3: autoArr?.obj.datosCodigoBarras.codigos_referencia[2] ?? "",
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
      ref3: "",
      valor: "",
      showValor: "",
      valorSinModificar: "",
      data: "",
    });
    setShowModal(false);
    setPeticion(0);
    setObjTicketActual({});
  };
  const onSubmitConfirm = (e) => {
    e.preventDefault();
    for (
      let i = 0;
      i < datosEnvio.datosCodigoBarras.codigos_referencia.length;
      i++
    ) {
      if (parseInt(datosEnvio.datosCodigoBarras.codigos_referencia[i]) <= 0) {
        return notifyError("La referencia no puede ser 0");
      }
    }
    if (
      parseInt(datosTransaccion.valorSinModificar) >
      enumParametrosBancoAgrario.MAX_RECAUDO_AGRARIO
    ) {
      return notifyError(
        `El valor de la transacción es superior a ${formatMoney.format(
          enumParametrosBancoAgrario.MAX_RECAUDO_AGRARIO
        )}`
      );
    }
    if (
      parseInt(datosTransaccion.valorSinModificar) <
      enumParametrosBancoAgrario.MIN_RECAUDO_AGRARIO
    ) {
      return notifyError(
        `El valor de la transacción es inferior a ${formatMoney.format(
          enumParametrosBancoAgrario.MIN_RECAUDO_AGRARIO
        )}`
      );
    }
    setPeticion(1);
    setShowModal(true);
  };
  const onSubmitPago = (e) => {
    e.preventDefault();
    setIsUploading(true);
    const valorTransaccion = parseInt(datosTransaccion.valorSinModificar) ?? 0;
    let objRecaudo = {
      nombreConvenio: datosEnvio?.datosConvenio?.nombre_convenio,
      codigoConvenio: datosEnvio?.datosConvenio?.codigo,
      referencia1: datosEnvio.datosCodigoBarras.codigos_referencia[0],
    };
    if (
      datosEnvio?.datosConvenio?.nombre_ref2 &&
      datosEnvio?.datosConvenio?.nombre_ref2 !== ""
    ) {
      objRecaudo["referencia2"] =
        datosEnvio.datosCodigoBarras.codigos_referencia[1] ?? "";
    }
    if (
      datosEnvio?.datosConvenio?.nombre_ref3 &&
      datosEnvio?.datosConvenio?.nombre_ref3 !== ""
    ) {
      objRecaudo["referencia3"] =
        datosEnvio.datosCodigoBarras.codigos_referencia[2] ?? "";
    }
    setIsUploading(true);
    postRecaudoConveniosAgrario({
      oficina_propia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
        roleInfo?.tipo_comercio === "KIOSCO"
          ? true
          : false,
      valor_total_trx: valorTransaccion,
      nombre_comercio: roleInfo?.["nombre comercio"],
      nombre_usuario: pdpUser?.uname ?? "",
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
      },
      recaudoAgrario: {
        ...objRecaudo,
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
          setObjTicketActual(res?.obj?.ticket);
          setPeticion(2);
        } else {
          setIsUploading(false);
          notifyError(res?.msg);
          hideModalReset();
        }
      })
      .catch((err) => {
        setIsUploading(false);
        notifyError("No se ha podido conectar al servidor");
        console.error(err);
        hideModalReset();
      });
  };
  const printDiv = useRef();
  const isAlt = useRef("");
  const isAltCR = useRef({ data: "", state: false });
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className="text-3xl text-center mb-10 mt-5">
        Recaudo servicios públicos y privados
      </h1>
      {!datosEnvio.estadoConsulta ? (
        <>
          <Form>
            <TextArea
              id="codBarras"
              label="Escanee el código de barras"
              type="text"
              name="codBarras"
              required
              value={datosTrans.codBarras}
              autoFocus
              autoComplete="off"
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
              }}
            ></TextArea>
            {datosTrans.codBarras !== "" && (
              <ButtonBar>
                <Button
                  type="button"
                  onClick={() => {
                    setDatosTrans({ codBarras: "" });
                  }}
                >
                  Volver a ingresar código de barras
                </Button>
              </ButtonBar>
            )}
          </Form>
        </>
      ) : (
        <>
          <h1 className="text-3xl text-center  mb-10">{`Convenio: ${
            datosEnvio?.datosConvenio?.nombre_convenio ?? ""
          }`}</h1>
          <Form grid onSubmit={onSubmitConfirm}>
            {datosEnvio?.datosConvenio?.nombre_ref1 !== "" && (
              <Input
                id="ref1"
                label={datosEnvio?.datosConvenio?.nombre_ref1}
                type="text"
                name="ref1"
                minLength={datosEnvio?.datosConvenio?.longitud_min_ref1}
                maxLength={datosEnvio?.datosConvenio?.longitud_max_ref1}
                required
                disabled={true}
                value={datosEnvio.datosCodigoBarras.codigos_referencia[0] ?? ""}
                autoComplete="off"
                onInput={onChangeFormat}
              />
            )}
            {datosEnvio?.datosConvenio?.nombre_ref2 &&
              datosEnvio?.datosConvenio?.nombre_ref2 !== "" && (
                <Input
                  id="ref2"
                  label={datosEnvio?.datosConvenio?.nombre_ref2}
                  type="text"
                  name="ref2"
                  minLength={datosEnvio?.datosConvenio?.longitud_min_ref2}
                  maxLength={datosEnvio?.datosConvenio?.longitud_max_ref2}
                  required
                  disabled={true}
                  value={
                    datosEnvio.datosCodigoBarras.codigos_referencia[1] ?? ""
                  }
                  autoComplete="off"
                  onInput={onChangeFormat}
                ></Input>
              )}
            {datosEnvio?.datosConvenio?.nombre_ref3 &&
              datosEnvio?.datosConvenio?.nombre_ref3 !== "" && (
                <Input
                  id="ref3"
                  label={datosEnvio?.datosConvenio?.nombre_ref3}
                  type="text"
                  name="ref3"
                  minLength={datosEnvio?.datosConvenio?.longitud_min_ref3}
                  maxLength={datosEnvio?.datosConvenio?.longitud_max_ref3}
                  required
                  disabled={true}
                  value={
                    datosEnvio.datosCodigoBarras.codigos_referencia[2] ?? ""
                  }
                  autoComplete="off"
                  onInput={onChangeFormat}
                ></Input>
              )}
            {datosEnvio?.datosCodigoBarras?.fecha_caducidad?.length &&
            datosEnvio?.datosCodigoBarras?.fecha_caducidad?.length > 0 ? (
              <Input
                id="fecha_caducidad"
                label="Fecha de caducidad"
                type="text"
                name="fecha_caducidad"
                minLength="0"
                maxLength="32"
                disabled={true}
                value={datosEnvio.datosCodigoBarras.fecha_caducidad[0] ?? ""}
                onInput={(e) => {}}
              ></Input>
            ) : (
              <></>
            )}
            {datosEnvio.datosCodigoBarras.pago[0] && (
              <MoneyInputDec
                id="valCashOut"
                name="valCashOut"
                label="Valor a pagar original"
                type="text"
                autoComplete="off"
                maxLength={"15"}
                disabled={true}
                value={datosTransaccion.valorSinModificar ?? ""}
                onInput={(e, valor) => {
                  if (!isNaN(valor)) {
                    const num = valor;
                  }
                }}
                required
              ></MoneyInputDec>
            )}
            <ButtonBar className="lg:col-span-2">
              <Button
                type="button"
                onClick={() => {
                  notifyError("Transacción cancelada por el usuario");
                  hideModalReset();
                }}
              >
                Volver a ingresar código de barras
              </Button>
              {!datosEnvio.estadoFecha && (
                <Button type="submit" disabled={showModal}>
                  Realizar pago
                </Button>
              )}
            </ButtonBar>
          </Form>
          <Modal show={showModal}>
            <>
              {peticion === 1 && (
                <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
                  <h1 className="text-2xl text-center mb-5 font-semibold">
                    ¿Está seguro de realizar el recaudo?
                  </h1>
                  <h2>{`Nombre convenio: ${datosEnvio?.datosConvenio?.nombre_convenio}`}</h2>
                  <h2>{`Número convenio: ${datosEnvio?.datosConvenio?.codigo}`}</h2>
                  {datosEnvio?.datosConvenio?.nombre_ref1 !== "" && (
                    <h2>{`Referencia 1: ${
                      datosEnvio.datosCodigoBarras.codigos_referencia[0] ?? ""
                    }`}</h2>
                  )}
                  {datosEnvio?.datosConvenio?.nombre_ref2 &&
                    datosEnvio?.datosConvenio?.nombre_ref2 !== "" && (
                      <h2>{`Referencia 2: ${
                        datosEnvio.datosCodigoBarras.codigos_referencia[1] ?? ""
                      }`}</h2>
                    )}
                  {datosEnvio?.datosConvenio?.nombre_ref3 &&
                    datosEnvio?.datosConvenio?.nombre_ref3 !== "" && (
                      <h2>{`Referencia 3: ${
                        datosEnvio.datosCodigoBarras.codigos_referencia[2] ?? ""
                      }`}</h2>
                    )}
                  <h2 className="text-base">
                    {`Valor a pagar: ${formatMoney.format(
                      datosTransaccion.valorSinModificar
                    )} `}
                  </h2>
                  <Form
                    grid
                    onSubmit={onSubmitPago}
                    className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center"
                  >
                    <ButtonBar>
                      <Button
                        onClick={() => {
                          notifyError("Transacción cancelada por el usuario");
                          hideModalReset();
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={peticion !== 1 && showModal}
                      >
                        Realizar pago
                      </Button>
                    </ButtonBar>
                  </Form>
                </div>
              )}
              {peticion === 2 && (
                <div className="flex flex-col justify-center items-center">
                  <TicketsAgrario
                    ticket={objTicketActual}
                    refPrint={printDiv}
                  />
                  <h2>
                    <ButtonBar>
                      <Button onClick={handlePrint}>Imprimir</Button>
                      <Button
                        type="submit"
                        onClick={() => {
                          hideModalReset();
                          navigate(-1);
                        }}
                      >
                        Aceptar
                      </Button>
                    </ButtonBar>
                  </h2>
                </div>
              )}
            </>
          </Modal>
        </>
      )}
    </>
  );
};

export default RecaudoServiciosPublicosPrivadosLecturaCodigoBarrasAgrario;
