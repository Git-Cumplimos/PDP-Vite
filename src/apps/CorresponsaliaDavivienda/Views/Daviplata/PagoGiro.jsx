import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Modal from "../../../../components/Base/Modal";
import { useReactToPrint } from "react-to-print";
import { notify, notifyError } from "../../../../utils/notify";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import { useAuth } from "../../../../hooks/AuthHooks";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import TicketsDavivienda from "../../components/TicketsDavivienda";
import Select from "../../../../components/Base/Select";
import {
  postConsultaPagoPorGiroDavivienda,
  postPagoPorGiroDavivienda,
} from "../../utils/fetchPagoPorGiro";

const PagoGiro = () => {
  const { roleInfo } = useAuth();
  const [showModal, setShowModal] = useState(false);
  // const [limiteRecarga, setLimiteRecarga] = useState({
  //   superior: 100000,
  //   inferior: 100,
  // });
  const [peticion, setPeticion] = useState(0);
  const [datosTrans, setDatosTrans] = useState({
    tipoIdentificacion: "",
    numeroIdentificacion: "",
    codigoFamilia: "",
    nombreTipoIdentificacion: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [datosConsulta, setDatosConsulta] = useState({});
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
      ["Tipo de operación", "Pago por giro"],
      ["", ""],
    ],
    commerceName: roleInfo?.["nombre comercio"]
      ? roleInfo?.["nombre comercio"]
      : "prod",
    trxInfo: [],
    disclamer:
      "Línea de atención personalizada: #688 Mensaje de texto: 85888 Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
  });

  // /*ENVIAR NUMERO DE TARJETA Y VALOR DE LA RECARGA*/
  const onSubmit = (e) => {
    e.preventDefault();
    setPeticion(1);
    habilitarModal();
  };

  /*Funcion para habilitar el modal*/
  const habilitarModal = () => {
    setShowModal(!showModal);
  };

  const hideModal = () => {
    if (peticion === 3 || peticion === 2) return setPeticion(4);
    setShowModal(false);
    setDatosTrans({
      tipoIdentificacion: "",
      numeroIdentificacion: "",
      codigoFamilia: "",
      nombreTipoIdentificacion: "",
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
          ["Municipio", roleInfo?.ciudad ? roleInfo?.ciudad : "Bogota"],
          /*direccion*/
          [
            "Dirección",
            roleInfo?.direccion ? roleInfo?.direccion : "Calle 13 # 233 - 2",
          ],
          ["Tipo de operación", "Pago por giro"],
          ["", ""],
        ],
        trxInfo: [],
      };
    });
    setPeticion(0);
  };

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const peticionConsulta = () => {
    const hoy = new Date();
    const fecha =
      hoy.getDate() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getFullYear();
    /*hora actual */
    const hora =
      hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getSeconds();
    const objTicket = { ...objTicketActual };
    objTicket["timeInfo"]["Fecha de venta"] = fecha;
    objTicket["timeInfo"]["Hora"] = hora;
    setIsUploading(true);
    postConsultaPagoPorGiroDavivienda({
      tipoIdentificacion: datosTrans.tipoIdentificacion,
      numeroIdentificacion: datosTrans.numeroIdentificacion,
      codigoFamilia: datosTrans.codigoFamilia,
      idComercio: roleInfo?.id_comercio ? roleInfo?.id_comercio : 8,
      idUsuario: roleInfo?.id_usuario ? roleInfo?.id_usuario : 1,
      idTerminal: roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 801,
      issuerIdDane: roleInfo?.codigo_dane ? roleInfo?.codigo_dane : 1121,
      nombreComercio: roleInfo?.["nombre comercio"]
        ? roleInfo?.["nombre comercio"]
        : "prod",
      municipio: roleInfo?.["ciudad"] ? roleInfo?.["ciudad"] : "Bogota",
      oficinaPropia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ? true : false,
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
            "Transacción Declinada",
          ]);
          objTicket["commerceInfo"].push(["", ""]);
          objTicket["trxInfo"].push(["Valor", formatMoney.format(0)]);
          objTicket["trxInfo"].push(["", ""]);
          objTicket["trxInfo"].push([
            "Costo transacción",
            formatMoney.format(0),
          ]);
          objTicket["trxInfo"].push(["", ""]);
          objTicket["trxInfo"].push([
            "Total",
            formatMoney.format(res?.obj?.respuesta_davivienda[0].valorPago),
          ]);
          objTicket["trxInfo"].push(["", ""]);
          setDatosConsulta(res?.obj?.respuesta_davivienda[0]);
          setPeticion(2);
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
  const peticionPagoPorGiro = () => {
    const hoy = new Date();
    const fecha =
      hoy.getDate() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getFullYear();
    /*hora actual */
    const hora =
      hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getSeconds();
    const objTicket = { ...objTicketActual };
    objTicket["timeInfo"]["Fecha de venta"] = fecha;
    objTicket["timeInfo"]["Hora"] = hora;

    setIsUploading(true);
    postPagoPorGiroDavivienda({
      tipoIdentificacion: datosTrans.tipoIdentificacion,
      numeroIdentificacion: datosTrans.numeroIdentificacion,
      codigoFamilia: datosTrans.codigoFamilia,
      idComercio: roleInfo?.id_comercio ? roleInfo?.id_comercio : 8,
      idUsuario: roleInfo?.id_usuario ? roleInfo?.id_usuario : 1,
      idTerminal: roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 801,
      issuerIdDane: roleInfo?.codigo_dane ? roleInfo?.codigo_dane : 1121,
      nombreComercio: roleInfo?.["nombre comercio"]
        ? roleInfo?.["nombre comercio"]
        : "prod",
      municipio: roleInfo?.["ciudad"] ? roleInfo?.["ciudad"] : "Bogota",
      oficinaPropia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ? true : false,
      ticket: objTicket,
      direccion: roleInfo?.direccion ? roleInfo?.direccion : "",
    })
      .then((res) => {
        if (res?.status) {
          setIsUploading(false);
          notify(res?.msg);
          // hideModal();
          objTicket["commerceInfo"][6] = [
            "No. de aprobación",
            res?.obj?.referencia,
          ];
          objTicket["trxInfo"][0] = [
            "Valor",
            formatMoney.format(res?.obj?.valor),
          ];
          objTicket["trxInfo"][4] = [
            "Total",
            formatMoney.format(res?.obj?.valor),
          ];
          setObjTicketActual(objTicket);
          setPeticion(4);
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
          minLength='1'
          maxLength='8'
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
              return {
                ...old,
                tipoIdentificacion: e.target.value,
                nombreTipoIdentificacion:
                  e.target.options[e.target.selectedIndex].text,
              };
            })
          }
          required
        />
        <ButtonBar className='lg:col-span-2'>
          <Button type='submit'>Aceptar</Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={hideModal}>
        <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
          {peticion === 1 && (
            <>
              <h1 className='text-2xl font-semibold'>
                ¿Esta seguro de realizar la consulta del giro?
              </h1>
              <h2>{`Número de documento: ${datosTrans.numeroIdentificacion}`}</h2>
              <h2>{`Tipo de documento: ${datosTrans.nombreTipoIdentificacion}`}</h2>
              <h2>{`Código de familia: ${datosTrans.codigoFamilia}`}</h2>
              <ButtonBar>
                <Button type='submit' onClick={peticionConsulta}>
                  Aceptar
                </Button>
                <Button onClick={hideModal}>Cancelar</Button>
              </ButtonBar>
            </>
          )}
          {peticion === 2 && (
            <>
              <h1 className='text-2xl font-semibold'>
                Consulta de pago por giro
              </h1>
              <h2>{`Nombre de convenio: ${datosConsulta.nombreConvenio}`}</h2>
              <h2>{`Código de convenio: ${datosConsulta.codigoConvenio}`}</h2>
              <h2>{`Código de Familia: ${datosConsulta.codigoDeFamilia}`}</h2>
              <h2>{`Número de identificacion: ${datosConsulta.numeroIdentificacionBeneficiario}`}</h2>
              <h2>{`Valor transacción: ${formatMoney.format(
                datosConsulta.valorPago
              )}`}</h2>
              <ButtonBar>
                <Button type='submit' onClick={() => setPeticion(3)}>
                  Aceptar
                </Button>
                <Button onClick={hideModal}>Cancelar</Button>
              </ButtonBar>
            </>
          )}
          {peticion === 3 && (
            <>
              <h1 className='text-2xl font-semibold'>
                ¿Esta seguro de realizar la transacción del giro?
              </h1>
              <h2>{`Código de Familia: ${datosConsulta.codigoDeFamilia}`}</h2>
              <h2>{`Número de identificacion: ${datosConsulta.numeroIdentificacionBeneficiario}`}</h2>
              <h2>{`Valor transacción: ${formatMoney.format(
                datosConsulta.valorPago
              )}`}</h2>
              <ButtonBar>
                <Button type='submit' onClick={peticionPagoPorGiro}>
                  Aceptar
                </Button>
                <Button onClick={hideModal}>Cancelar</Button>
              </ButtonBar>
            </>
          )}
          {peticion === 4 && (
            <>
              <h2>
                <ButtonBar>
                  <Button type='submit' onClick={hideModal}>
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

export default PagoGiro;