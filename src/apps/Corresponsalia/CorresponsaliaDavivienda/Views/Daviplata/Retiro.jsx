/* eslint-disable no-useless-escape */
import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Button from "../../../../../components/Base/Button";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Modal from "../../../../../components/Base/Modal";
import { useReactToPrint } from "react-to-print";
import { postRealizarCashoutDavivienda } from "../../utils/fetchCorresponsaliaDavivienda";
import { notify, notifyError } from "../../../../../utils/notify";
import MoneyInput, {
  formatMoney,
} from "../../../../../components/Base/MoneyInput";
import { useAuth } from "../../../../../hooks/AuthHooks";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import { enumParametrosAutorizador } from "../../../../../utils/enumParametrosAutorizador";
import { fetchParametrosAutorizadores } from "../../../../TrxParams/utils/fetchParametrosAutorizadores";
import TicketsDavivienda from "../../components/TicketsDavivienda";
import HideInput from "../../../../../components/Base/HideInput";

const Retiro = () => {
  const { roleInfo } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [limiteRecarga, setLimiteRecarga] = useState({
    superior: 720000,
    inferior: 10000,
  });
  const [peticion, setPeticion] = useState(false);
  const [datosTrans, setDatosTrans] = useState({
    otp: "",
    numeroTelefono: "",
    valorCashOut: "",
    otpEnco: "",
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
                enumParametrosAutorizador.limite_superior_cash_out_davivienda_cb
            )[0]?.valor_parametro
          ),
          inferior: parseInt(
            autoArr?.results?.filter(
              (i) =>
                i.id_tabla_general_parametros_autorizadores ===
                enumParametrosAutorizador.limite_inferior_cash_out_davivienda_cb
            )[0]?.valor_parametro
          ),
        });
      })
      .catch((err) => {
        setIsUploading(false);
        console.error(err);
      });
  }, []);
  const [objTicketActual, setObjTicketActual] = useState({
    title: "Recibo de retiro DaviPlata",
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
      ["Municipio", roleInfo?.ciudad ? roleInfo?.ciudad : "No hay datos"],
      /*direccion*/
      ["Dirección", roleInfo?.direccion ? roleInfo?.direccion : "No hay datos"],
      ["Tipo de operación", "Retiro DaviPlata"],
      ["", ""],
    ],
    commerceName: roleInfo?.["nombre comercio"]
      ? roleInfo?.["nombre comercio"]
      : "No hay datos",
    trxInfo: [],
    disclamer: "Línea de atención personalizada: #688\nMensaje de texto: 85888",
  });

  // /*ENVIAR NUMERO DE TARJETA Y VALOR DE LA RECARGA*/
  const onSubmit = (e) => {
    e.preventDefault();
    if (datosTrans?.valorCashOut % 10000 !== 0)
      return notifyError("El valor debe ser multiplos de 10000");
    if (datosTrans?.numeroTelefono[0] !== "3")
      return notifyError("El número Daviplata debe comenzar por 3");
    if (datosTrans.valorCashOut > limiteRecarga.superior)
      return notifyError(
        "El valor de cash out debe ser menor a " +
          formatMoney.format(limiteRecarga.superior)
      );
    if (datosTrans.valorCashOut < limiteRecarga.inferior)
      return notifyError(
        `El valor de cash out debe ser mayor a ${formatMoney.format(
          limiteRecarga.inferior
        )}`
      );
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
      return {
        ...old,
        commerceInfo: [
          /*id transaccion recarga*/
          /*id_comercio*/
          ["Id comercio", roleInfo?.id_comercio ? roleInfo?.id_comercio : 1],
          /*id_dispositivo*/
          [
            "No. terminal",
            roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 1,
          ],
          /*ciudad*/
          ["Municipio", roleInfo?.ciudad ? roleInfo?.ciudad : "No hay datos"],
          /*direccion*/
          [
            "Dirección",
            roleInfo?.direccion ? roleInfo?.direccion : "No hay datos",
          ],
          ["Tipo de operación", "Retiro DaviPlata"],
          ["", ""],
        ],
        trxInfo: [],
      };
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
    Intl.DateTimeFormat("es-CO", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date())
    /*hora actual */
    const hora =
    Intl.DateTimeFormat("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date())
    const objTicket = { ...objTicketActual };
    objTicket["timeInfo"]["Fecha de venta"] = fecha;
    objTicket["timeInfo"]["Hora"] = hora;
    setIsUploading(true);
    postRealizarCashoutDavivienda({
      idComercio: roleInfo?.id_comercio ? roleInfo?.id_comercio : 0,
      idUsuario: roleInfo?.id_usuario ? roleInfo?.id_usuario : 0,
      idTerminal: roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 0,
      valor: datosTrans?.valorCashOut,
      issuerIdDane: roleInfo?.codigo_dane ? roleInfo?.codigo_dane : 0,
      nombreComercio: roleInfo?.["nombre comercio"]
        ? roleInfo?.["nombre comercio"]
        : "No hay datos",
      ticket: objTicket,
      numCelular: datosTrans.numeroTelefono,
      municipio: roleInfo?.["ciudad"] ? roleInfo?.["ciudad"] : "No hay datos",
      otp: datosTrans.otp,
      oficinaPropia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ? true : false,
      direccion: roleInfo?.direccion ? roleInfo?.direccion : "",
    })
      .then((res) => {
        if (res?.status) {
          setIsUploading(false);
          notify(res?.msg);
          // hideModal();
          objTicket["commerceInfo"][1] = [
            "No. terminal",
            res?.obj?.codigoTotal,
          ];
          objTicket["commerceInfo"].push([
            "No. de aprobación",
            res?.obj?.respuesta_davivienda?.numeroAutorizacion,
          ]);
          objTicket["commerceInfo"].push(["", ""]);
          objTicket["trxInfo"].push(["Número DaviPlata", res?.obj?.numero]);
          objTicket["trxInfo"].push(["", ""]);
          objTicket["trxInfo"].push([
            "Valor",
            formatMoney.format(datosTrans.valorCashOut),
          ]);
          objTicket["trxInfo"].push(["", ""]);
          objTicket["trxInfo"].push([
            "Costo transacción",
            formatMoney.format(0),
          ]);
          objTicket["trxInfo"].push(["", ""]);
          objTicket["trxInfo"].push([
            "Total",
            formatMoney.format(datosTrans.valorCashOut),
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
      <h1 className='text-3xl mb-10'>Retiro DaviPlata</h1>
      <Form grid onSubmit={onSubmit} autoComplete='off'>
        <Input
          id='numeroTelefono'
          label='Número DaviPlata'
          type='text'
          name='numeroTelefono'
          minLength='10'
          maxLength='10'
          required
          autoComplete='off'
          value={datosTrans.numeroTelefono}
          onInput={(e) => {
            let valor = e.target.value;
            let num = valor.replace(/[\s\.]/g, "");
            if (!isNaN(num)) {
              if (datosTrans.numeroTelefono.length === 0 && num !== "3") {
                return notifyError("El número DaviPlata debe comenzar por 3");
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
          minLength='6'
          maxLength='6'
          autoComplete='off'
          required
          value={datosTrans.otpEnco}
          onInput={(e) => {
            console.log(e.target.value[e.target.value.length - 1]);
            if (!isNaN(e.target.value)) {
              const num = e.target.value;

              setDatosTrans((old) => {
                return { ...old, otpEnco: num.replace(/\w/g, "*"), otp: num };
              });
            }
          }}></Input> */}
        <HideInput
          id='otp'
          label='Número OTP'
          type='text'
          name='otp'
          minLength='6'
          maxLength='6'
          autoComplete='off'
          required
          value={datosTrans.otp ?? ""}
          onInput={(e, valor) => {
            let num = valor.replace(/[\s\.]/g, "");
            if (!isNaN(valor)) {
              setDatosTrans((old) => {
                return { ...old, otp: num };
              });
            }
          }}></HideInput>
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
            <>
              <h1 className='text-2xl font-semibold'>
                ¿Está seguro de realizar el retiro DaviPlata?
              </h1>
              <h2 className='text-base'>
                {`Valor de transacción: ${formatMoney.format(
                  datosTrans.valorCashOut
                )} `}
              </h2>
              <h2>{`Número Daviplata: ${datosTrans.numeroTelefono}`}</h2>
              {/* <h2>{`Número de otp: ${datosTrans.otp}`}</h2> */}
              <ButtonBar>
                <Button onClick={hideModal}>Cancelar</Button>
                <Button type='submit' onClick={peticionCashOut}>
                  Aceptar
                </Button>
              </ButtonBar>
            </>
          ) : (
            ""
          )}
          {peticion && (
            <>
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
              <TicketsDavivienda
                ticket={objTicketActual}
                refPrint={printDiv}></TicketsDavivienda>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default Retiro;
