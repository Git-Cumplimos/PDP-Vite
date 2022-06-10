import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Modal from "../../../components/Base/Modal";
import useQuery from "../../../hooks/useQuery";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  postCashOut,
  postRealizarCashoutDavivienda,
} from "../utils/fetchCorresponsaliaDavivienda";
import { notify, notifyError } from "../../../utils/notify";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import MoneyInput, { formatMoney } from "../../../components/Base/MoneyInput";
import { useFetch } from "../../../hooks/useFetch";
import { useAuth } from "../../../hooks/AuthHooks";
import SimpleLoading from "../../../components/Base/SimpleLoading";
import { enumParametrosAutorizador } from "../utils/enumParametrosAutorizador";
import { fetchParametrosAutorizadores } from "../../TrxParams/utils/fetchParametrosAutorizadores";
import TicketsDavivienda from "../components/TicketsDavivienda";
import Select from "../../../components/Base/Select";

const PagoGiro = () => {
  const { roleInfo } = useAuth();
  const [showModal, setShowModal] = useState(false);
  // const [limiteRecarga, setLimiteRecarga] = useState({
  //   superior: 100000,
  //   inferior: 100,
  // });
  const [peticion, setPeticion] = useState(false);
  const [botonAceptar, setBotonAceptar] = useState(false);
  const [datosTrans, setDatosTrans] = useState({
    tipoIdentificacion: "",
    numeroIdentificacion: "",
    codigoFamilia: "",
    nombreTipoIdentificacion: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  // useEffect(() => {
  //   fetchParametrosAutorizadoresFunc();
  // }, []);
  // const fetchParametrosAutorizadoresFunc = useCallback(() => {
  //   fetchParametrosAutorizadores({})
  //     .then((autoArr) => {
  //       setLimiteRecarga({
  //         superior: parseInt(
  //           autoArr?.results?.filter(
  //             (i) =>
  //               i.id_tabla_general_parametros_autorizadores ===
  //               enumParametrosAutorizador.limite_superior_cash_out_davivienda_cb
  //           )[0]?.valor_parametro
  //         ),
  //         inferior: parseInt(
  //           autoArr?.results?.filter(
  //             (i) =>
  //               i.id_tabla_general_parametros_autorizadores ===
  //               enumParametrosAutorizador.limite_inferior_cash_out_davivienda_cb
  //           )[0]?.valor_parametro
  //         ),
  //       });
  //     })
  //     .catch((err) => console.error(err));
  // }, []);
  const [objTicketActual, setObjTicketActual] = useState({
    title: "Recibo de pago por giro Davivienda CB",
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
    // objTicket["trxInfo"].push([
    //   "Numero de telefono",
    //   datosTrans.numeroTelefono,
    // ]);
    // objTicket["trxInfo"].push(["", ""]);
    // objTicket["trxInfo"].push(["Numero OTP", datosTrans.otp]);
    // objTicket["trxInfo"].push(["", ""]);

    setIsUploading(true);
    postRealizarCashoutDavivienda({
      idComercio: roleInfo?.id_comercio ? roleInfo?.id_comercio : 8,
      idUsuario: roleInfo?.id_usuario ? roleInfo?.id_usuario : 1,
      idTerminal: roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 801,
      valor: datosTrans?.valorCashOut,
      issuerIdDane: roleInfo?.codigo_dane ? roleInfo?.codigo_dane : 1121,
      nombreComercio: roleInfo?.["nombre comercio"]
        ? roleInfo?.["nombre comercio"]
        : "prod",
      ticket: objTicket,
      numCelular: datosTrans.numeroTelefono,
      municipio: roleInfo?.["ciudad"] ? roleInfo?.["ciudad"] : "Bogota",
      otp: datosTrans.otp,
      oficinaPropia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ? true : false,
    })
      .then((res) => {
        if (res?.status) {
          setIsUploading(false);
          notify(res?.msg);
          // hideModal();

          objTicket["trxInfo"].push([
            "Número autorización",
            res?.obj?.respuesta_davivienda?.numeroAutorizacion,
          ]);
          objTicket["trxInfo"].push(["", ""]);
          objTicket["trxInfo"].push(["Número de telefono", res?.obj?.numero]);
          objTicket["trxInfo"].push(["", ""]);
          objTicket["trxInfo"].push([
            "Valor transacción",
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
      <h1 className='text-3xl'>Pago por giro Davivienda CB</h1>
      <Form grid onSubmit={onSubmit}>
        <Input
          id='numeroIdentificacion'
          label='Número de identificación'
          type='text'
          name='numeroIdentificacion'
          minLength='10'
          maxLength='10'
          required
          value={datosTrans.numeroIdentificacion}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setDatosTrans((old) => {
                return { ...old, numeroIdentificacion: num };
              });
            }
          }}></Input>
        <Input
          id='codigoFamilia'
          label='Código de familia'
          type='text'
          name='codigoFamilia'
          minLength='6'
          maxLength='6'
          required
          value={datosTrans.codigoFamilia}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setDatosTrans((old) => {
                return { ...old, codigoFamilia: num };
              });
            }
          }}></Input>
        <Select
          id='tipoIdentificacion'
          name='tipoIdentificacion'
          label='Tipo de identificación'
          options={{
            "": "",
            Cedula: "01",
            "Tarjeta de identidad": "04",
            "Cedula extranjeria": "02",
          }}
          value={datosTrans?.tipoIdentificacion}
          onChange={(e) =>
            setDatosTrans((old) => {
              console.log(e);
              return {
                ...old,
                tipoIdentificacion: e.target.value,
                nombreTipoIdentificacion: e.target.name,
              };
            })
          }
          // defaultValue={comissionData?.type}
          required
        />
        <ButtonBar className='lg:col-span-2'>
          <Button type='submit'>Aceptar</Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={hideModal}>
        <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
          {!peticion && (
            <>
              <h1 className='text-2xl font-semibold'>
                ¿Esta seguro de realizar la consulta del giro?
              </h1>
              {/* <h2 className='text-base'>
                {`Valor de transacción: ${formatMoney.format(
                  datosTrans.valorCashOut
                )} COP`}
              </h2> */}
              <h2>{`Número de documento: ${datosTrans.numeroIdentificacion}`}</h2>
              <h2>{`Tipo de documento: ${datosTrans.nombreTipoIdentificacion}`}</h2>
              <h2>{`Código de familia: ${datosTrans.codigoFamilia}`}</h2>
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
          )}
          {peticion && (
            <>
              <TicketsDavivienda
                ticket={objTicketActual}
                refPrint={printDiv}></TicketsDavivienda>
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
    </>
  );
};

export default PagoGiro;
