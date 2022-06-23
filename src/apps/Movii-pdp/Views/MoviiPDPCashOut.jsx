import { useCallback, useState, useRef, useEffect } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Modal from "../../../components/Base/Modal";
import { useAuth } from "../../../hooks/AuthHooks";
import Input from "../../../components/Base/Input";
import Form from "../../../components/Base/Form";
import { notify, notifyError } from "../../../utils/notify";
import Tickets from "../../../components/Base/Tickets";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { postRealizarCashout } from "../utils/fetchMoviiRed";
import MoneyInput from "../../../components/Base/MoneyInput";
import { fetchParametrosAutorizadores } from "../../TrxParams/utils/fetchParametrosAutorizadores";
import { enumParametrosAutorizador } from "../utils/enumParametrosAutorizador";
import SimpleLoading from "../../../components/Base/SimpleLoading";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const MoviiPDPCashOut = () => {
  const { roleInfo } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [limiteRecarga, setLimiteRecarga] = useState({
    superior: 100000,
    inferior: 100,
  });
  const [peticion, setPeticion] = useState(false);
  const [botonAceptar, setBotonAceptar] = useState(false);
  const [datosTrans, setDatosTrans] = useState({
    otp: "",
    numeroTelefono: "",
    valorCashOut: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  useEffect(() => {
    fetchParametrosAutorizadoresFunc();
  }, []);
  const fetchParametrosAutorizadoresFunc = useCallback(() => {
    fetchParametrosAutorizadores({})
      .then((autoArr) => {
        setLimiteRecarga({
          superior: parseInt(
            autoArr?.results?.filter(
              (i) =>
                i.id_tabla_general_parametros_autorizadores ===
                enumParametrosAutorizador.limite_superior_cash_out_movii
            )[0]?.valor_parametro
          ),
          inferior: parseInt(
            autoArr?.results?.filter(
              (i) =>
                i.id_tabla_general_parametros_autorizadores ===
                enumParametrosAutorizador.limite_inferior_cash_out_movii
            )[0]?.valor_parametro
          ),
        });
      })
      .catch((err) => console.error(err));
  }, []);
  const [objTicketActual, setObjTicketActual] = useState({
    title: "Recibo de cash-out Movii",
    timeInfo: {
      "Fecha de venta": "",
      Hora: "",
    },
    commerceInfo: [
      /*id transaccion recarga*/
      /*id_comercio*/
      ["Id comercio", roleInfo?.id_comercio ? roleInfo?.id_comercio : 1],
      /*id_dispositivo*/
      ["No. terminal", roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 1],
      /*ciudad*/
      ["Municipio", roleInfo?.ciudad ? roleInfo?.ciudad : "Bogota"],
      /*direccion*/
      [
        "Dirección",
        roleInfo?.direccion ? roleInfo?.direccion : "Calle 13 # 233 - 2",
      ],
    ],
    commerceName: roleInfo?.["nombre comercio"]
      ? roleInfo?.["nombre comercio"]
      : "prod",
    trxInfo: [],
    disclamer:
      "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
  });

  // /*ENVIAR NUMERO DE TARJETA Y VALOR DE LA RECARGA*/
  const onSubmit = (e) => {
    e.preventDefault();
    habilitarModal();
  };

  /*Funcion para habilitar el modal*/
  const habilitarModal = () => {
    setShowModal(!showModal);
  };

  const hideModal = () => {
    setShowModal(false);
    setDatosTrans({
      otp: "",
      numeroTelefono: "",
      valorCashOut: "",
    });
    setObjTicketActual((old) => {
      return { ...old, trxInfo: [] };
    });
    setPeticion(false);
  };

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const peticionCashOut = () => {
    const hoy = new Date();
    const fecha =
      hoy.getDate() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getFullYear();
    /*hora actual */
    const hora =
      hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getSeconds();
    const objTicket = { ...objTicketActual };
    objTicket["timeInfo"]["Fecha de venta"] = fecha;
    objTicket["timeInfo"]["Hora"] = hora;
    objTicket["trxInfo"].push([
      "Numero de telefono",
      datosTrans.numeroTelefono,
    ]);
    objTicket["trxInfo"].push(["", ""]);
    objTicket["trxInfo"].push(["Numero OTP", datosTrans.otp]);
    objTicket["trxInfo"].push(["", ""]);
    objTicket["trxInfo"].push([
      "Valor transacción",
      formatMoney.format(datosTrans.valorCashOut),
    ]);
    objTicket["trxInfo"].push(["", ""]);
    setIsUploading(true);
    postRealizarCashout({
      id_comercio: roleInfo?.id_comercio ? roleInfo?.id_comercio : 8,
      id_usuario: roleInfo?.id_usuario ? roleInfo?.id_usuario : 1,
      id_terminal: roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 801,
      amount: datosTrans?.valorCashOut,
      issuer_id_dane: roleInfo?.codigo_dane ? roleInfo?.codigo_dane : 1121,
      nombre_comercio: roleInfo?.["nombre comercio"]
        ? roleInfo?.["nombre comercio"]
        : "prod",
      Ticket: objTicket,
      subscriberNum: datosTrans.numeroTelefono,
      otp: datosTrans.otp,
      oficina_propia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ? true : false,
    })
      .then((res) => {
        if (res?.status) {
          setIsUploading(false);
          notify(res?.msg);
          // hideModal();
          objTicket["trxInfo"].push([
            "Id cash out",
            res?.obj?.respuesta_movii?.cashOutId,
          ]);
          objTicket["trxInfo"].push(["", ""]);
          objTicket["trxInfo"].push([
            "Id transacción",
            res?.obj?.respuesta_movii?.correlationId,
          ]);
          objTicket["trxInfo"].push(["", ""]);

          setObjTicketActual(objTicket);
          setPeticion(true);
        } else {
          setIsUploading(false);
          notifyError(res?.msg);
          hideModal();
        }
      })
      .catch((err) => {
        setIsUploading(false);
        notifyError("No se ha podido conectar al servidor");
        console.error(err);
      });
  };
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl'>Cash Out MOVII</h1>
      <Form grid onSubmit={onSubmit}>
        <Input
          id='numeroTelefono'
          label='Número de telefono'
          type='text'
          name='numeroTelefono'
          minLength='10'
          maxLength='10'
          required
          value={datosTrans.numeroTelefono}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setDatosTrans((old) => {
                return { ...old, numeroTelefono: num };
              });
            }
          }}></Input>
        <Input
          id='otp'
          label='Número OTP'
          type='text'
          name='otp'
          minLength='2'
          maxLength='6'
          required
          value={datosTrans.otp}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setDatosTrans((old) => {
                return { ...old, otp: num };
              });
            }
          }}></Input>
        <MoneyInput
          id='valCashOut'
          name='valCashOut'
          label='Valor'
          type='text'
          autoComplete='off'
          maxLength={"15"}
          value={datosTrans.valorCashOut ?? ""}
          onInput={(e, valor) => {
            if (!isNaN(valor)) {
              const num = valor;
              setDatosTrans((old) => {
                return { ...old, valorCashOut: num };
              });
            }
          }}
          required></MoneyInput>
        <ButtonBar className='lg:col-span-2'>
          <Button type='submit'>Aceptar</Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={hideModal}>
        <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
          {!peticion ? (
            datosTrans.valorCashOut < limiteRecarga.superior &&
            datosTrans.valorCashOut > limiteRecarga.inferior ? (
              <>
                <h1 className='text-2xl font-semibold'>
                  ¿Esta seguro de realizar el cash out?
                </h1>
                <h2 className='text-base'>
                  {`Valor de transacción: ${formatMoney.format(
                    datosTrans.valorCashOut
                  )} COP`}
                </h2>
                <h2>{`Número de telefono: ${datosTrans.numeroTelefono}`}</h2>
                <h2>{`Número de otp: ${datosTrans.otp}`}</h2>
                <ButtonBar>
                  <Button
                    disabled={botonAceptar}
                    type='submit'
                    onClick={peticionCashOut}>
                    Aceptar
                  </Button>
                  <Button onClick={hideModal}>Cancelar</Button>
                </ButtonBar>
              </>
            ) : (
              <>
                <h2 className='text-2xl font-semibold'>
                  {datosTrans.valorCashOut <= limiteRecarga.inferior
                    ? `ERROR el valor de cash out debe ser mayor a ${formatMoney.format(
                        limiteRecarga.inferior
                      )}`
                    : "ERROR El valor de cash out debe ser menor a " +
                      formatMoney.format(limiteRecarga.superior) +
                      " COP"}
                </h2>

                <ButtonBar>
                  <Button onClick={() => setShowModal(false)}>Cancelar</Button>
                </ButtonBar>
              </>
            )
          ) : (
            ""
          )}
          {peticion && (
            <>
              <Tickets ticket={objTicketActual} refPrint={printDiv}></Tickets>
              <h2>
                <ButtonBar>
                  <Button
                    type='submit'
                    onClick={() => {
                      hideModal();
                    }}>
                    Aceptar
                  </Button>
                  <Button onClick={handlePrint}>Imprimir</Button>
                </ButtonBar>
              </h2>
            </>
          )}
        </div>
      </Modal>

      {/*peticion de autorizacion y confirmacion */}
      {/* <Modal
        show={showModal2}
        handleClose={() => {
          setShowModal2(false);
        }}
      >
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
          {peticion && (
            <>
              <Tickets></Tickets>
              <h2>
                <ButtonBar>
                  <Button
                    type="submit"
                    onClick={() => {
                      // setPeticion(false);
                      setShowModal2(false);
                      // peticionRecarga();
                    }}
                  >
                    Aceptar
                  </Button>
                </ButtonBar>
              </h2>
            </>
          )}
        </div>
      </Modal> */}

      {/* Manejo de errores con el servidor */}
      {/* <Modal
        show={showModal3}
        handleClose={() => {
          setShowModal3(false);
        }}
      >
        <h1>
          {"ERROR, hubo un problema con la peticion al servidor " + dataCard}
        </h1>
      </Modal> */}
    </>
  );
};

export default MoviiPDPCashOut;
