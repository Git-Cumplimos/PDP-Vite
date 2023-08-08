import { useCallback, useState, useRef, useEffect } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Modal from "../../../components/Base/Modal";
import { useAuth } from "../../../hooks/AuthHooks";
import Input from "../../../components/Base/Input";
import Form from "../../../components/Base/Form";
import { notify, notifyError, notifyPending } from "../../../utils/notify";
import Tickets from "../../../components/Base/Tickets";
import { useReactToPrint } from "react-to-print";
import { postRealizarCashout, consultaValidateUserMoviiCashIn, trxDepositoMoviiCashIn } from "../utils/fetchMoviiRed";
import MoneyInput from "../../../components/Base/MoneyInput";
import { fetchParametrosAutorizadores } from "../../TrxParams/utils/fetchParametrosAutorizadores";
import { enumParametrosAutorizador } from "../../../utils/enumParametrosAutorizador";
import SimpleLoading from "../../../components/Base/SimpleLoading";
import { useNavigate } from "react-router-dom";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const MoviiPDPCashIn = () => {
  const navigate = useNavigate();
  const { roleInfo, pdpUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [limiteRecarga, setLimiteRecarga] = useState({
    superior: 20000000,
    inferior: 100,
  });
  const [loadingPinPago, setLoadingPinPago] = useState(false);
  const [peticion, setPeticion] = useState(false);
  const [banderaConsulta, setBanderaConsulta] = useState(false);
  const [msgConsulta, setMsgConsulta] = useState("");
  const [botonAceptar, setBotonAceptar] = useState(false);
  const [datosTrans, setDatosTrans] = useState({
    otp: "",
    numeroTelefono: "",
    valorCashOut: "",
  });
  const [infoUsers, setInfoUsers] = useState({
    nombreUsuario: "",
    ciudad: "",
    genero: "",
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
    setBanderaConsulta(false)
    setShowModal(false);
    setShowModal2(false);
    setDatosTrans({
      otp: "",
      numeroTelefono: "",
      valorCashOut: "",
    });
    setInfoUsers({
      nombreUsuario: "",
      ciudad: "",
      genero: "",
    });
    setObjTicketActual((old) => {
      return { ...old, trxInfo: [] };
    });
    setPeticion(false);
    navigate(-1)
  };
  const hideModalUsuario = () => {
    setShowModal(false);
    setShowModal2(false);
    setDatosTrans({
      otp: "",
      numeroTelefono: "",
      valorCashOut: "",
    });
    setInfoUsers({
      nombreUsuario: "",
      ciudad: "",
      genero: "",
    });
    setObjTicketActual((old) => {
      return { ...old, trxInfo: [] };
    });
    setPeticion(false);
    notifyError("Transacción cancelada por el usuario")
    navigate(-1)
  };

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const peticionCashIn = useCallback(
    (ev) => {
      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        amount: datosTrans?.valorCashOut,
        valor_total_trx: datosTrans?.valorCashOut,
        issuer_id_dane: roleInfo?.codigo_dane,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        // Ticket: objTicket,
        subscriberNum: datosTrans.numeroTelefono,
        // otp: datosTrans.otp,
        issuerName: infoUsers.nombreUsuario,
        direccion: roleInfo?.direccion,
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
            roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
      };
      notifyPending(
        trxDepositoMoviiCashIn(data),
        {
          render() {
            setLoadingPinPago(true);
            setBotonAceptar(true)
            return "Procesando transacción";
          },
        },
        {
          render({ data: res }) {
            setLoadingPinPago(false);
            if (res?.status) {
              setObjTicketActual(res?.obj?.ticket);
              setPeticion(true);
              setShowModal2(!showModal2);
            } else {
              setIsUploading(false);
              notifyError(res?.msg);
              hideModal();
              navigate(-1)
            }
            setBotonAceptar(false)
            return "Pago Deposito Movii Exitoso";
          },
        },
        {
          render({ data: err }) {
            setLoadingPinPago(false);
            if (err?.cause === "custom") {
              return <p style={{ whiteSpace: "pre-wrap" }}>{err?.message}</p>;
            }
            setIsUploading(false);
            // notifyError("No se ha podido conectar al servidor");
            setBanderaConsulta(false)
            console.error(err);
            navigate(-1)
            return "Transacción fallida";
          },
        }
      );
    },
    [
      datosTrans,
      roleInfo,
      pdpUser?.uname,
      pdpUser,
      navigate,
    ]
  );

  const peticionConsulta = useCallback(
    (ev) => {
      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        amount: datosTrans?.valorCashOut,
        valor_total_trx: datosTrans?.valorCashOut,
        issuer_id_dane: roleInfo?.codigo_dane,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        // Ticket: objTicket,
        subscriberNum: datosTrans.numeroTelefono,
        // otp: datosTrans.otp,
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
            roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
      };
      notifyPending(
        consultaValidateUserMoviiCashIn(data),
        {
          render() {
            setLoadingPinPago(true);
            setBotonAceptar(true)
            return "Procesando transacción";
          },
        },
        {
          render({ data: res }) {
            setLoadingPinPago(false);
            setBotonAceptar(false)
            const result = { data: res }; 
            const msg = result.data.msg;
            if (res?.status) {
              setShowModal2(!showModal2);
              setInfoUsers((old) => {
                return { ...old, nombreUsuario: res?.obj?.userName, ciudad: res?.obj?.city, genero: res?.obj?.gender };
              });
              return (`${msg} Exitosa`);
            } else {
              hideModal();
              return (`${msg} Fallida`);
            }
          },
        },
        {
          render({ data: err }) {
            setLoadingPinPago(false);
            if (err?.cause === "custom") {
              return <p style={{ whiteSpace: "pre-wrap" }}>{err?.message}</p>;
            }
            console.error("esto es errorn message",err?.message);
            console.error("esto es error",err);
            setIsUploading(false);
            setBanderaConsulta(false)
            console.error(err);
            navigate(-1)
            return "Transacción fallida";
          },
        }
      );
    },
    [
      datosTrans,
      roleInfo,
      pdpUser?.uname,
      pdpUser,
      navigate,
    ]
  );

  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl'>Depósito Movii</h1>
      <Form grid onSubmit={onSubmit}>
        <Input
          id='numeroTelefono'
          label='Número Movii'
          type='text'
          name='numeroTelefono'
          minLength='10'
          maxLength='10'
          required
          autoComplete='off'
          value={datosTrans.numeroTelefono}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              if (datosTrans.numeroTelefono.length === 0 && num !== "3") {
                return notifyError("El número Movii debe comenzar por 3");
              }
              setDatosTrans((old) => {
                return { ...old, numeroTelefono: num };
              });
            }
          }}></Input>
        {/* <Input
          id='otp'
          label='Número OTP'
          type='text'
          name='otp'
          minLength='2'
          maxLength='6'
          required
          autoComplete='off'
          value={datosTrans.otp}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setDatosTrans((old) => {
                return { ...old, otp: num };
              });
            }
          }}></Input> */}
        <MoneyInput
          id='valCashOut'
          name='valCashOut'
          label='Valor a depositar'
          type='text'
          autoComplete='off'
          maxLength={"12"}
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
      <Modal show={showModal} handleClose={loadingPinPago ? () => { } : hideModal}>
        <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
          {!peticion ? (
            datosTrans.valorCashOut < limiteRecarga.superior &&
            datosTrans.valorCashOut > limiteRecarga.inferior ? (
              <>
                <h1 className='text-2xl font-semibold'>
                  ¿Está seguro de realizar la transaccion?
                </h1>
                <h2 className='text-base'>
                  {`Valor a depositar: ${formatMoney.format(
                    datosTrans.valorCashOut
                  )} COP`}
                </h2>
                <h2>{`Número Movii: ${datosTrans.numeroTelefono}`}</h2>
                {/* <h2>{`Número OTP: ${datosTrans.otp}`}</h2> */}
                <ButtonBar>
                  <Button
                    disabled={botonAceptar}
                    type='submit'
                      onClick={peticionConsulta}>
                      Realizar consulta
                  </Button>
                    <Button disabled={botonAceptar}  onClick={hideModalUsuario}>Cancelar</Button>
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
                    <Button disabled={botonAceptar}  onClick={() => setShowModal(false)}>Cancelar</Button>
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
      <Modal show={showModal2} handleClose={loadingPinPago ? () => { } : hideModal}>
        <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
          {!peticion ? (
            datosTrans.valorCashOut < limiteRecarga.superior &&
            datosTrans.valorCashOut > limiteRecarga.inferior ? (
                <>
                  <h1 className='text-2xl font-bold'>
                    Respuesta de consulta Movii
                  </h1>
                <h4 className='text-2xl font-semibold'>
                    Resumen de la transacción
                </h4>
                <h2>{`Nombre usuario: ${infoUsers.nombreUsuario}`}</h2>
                <h2 className='text-base'>
                  {`Valor a depositar: ${formatMoney.format(
                    datosTrans.valorCashOut
                  )} COP`}
                </h2>
                <h2>{`Número Movii: ${datosTrans.numeroTelefono}`}</h2>
                {/* <h2>{`Número OTP: ${datosTrans.otp}`}</h2> */}
                  <h2>{`Ciudad: ${infoUsers.ciudad.toLowerCase() === 'bogota' ? 'Bogotá D.C' : infoUsers.ciudad}`
                  }</h2>
                <h2>{`Género: ${infoUsers.genero.toLowerCase() === 'male' ? 'Masculino' : 'Femenino'}`}</h2>


                <ButtonBar>
                  <Button
                    disabled={botonAceptar}
                    type='submit'
                    onClick={peticionCashIn}>
                      Aceptar
                  </Button>
                    <Button disabled={botonAceptar} onClick={hideModalUsuario}>Cancelar</Button>
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

export default MoviiPDPCashIn;
