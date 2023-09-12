import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Button from "../../../../../components/Base/Button";
import { Fragment, useRef, useState } from "react";
import Modal from "../../../../../components/Base/Modal";
import { useReactToPrint } from "react-to-print";
import { notify, notifyError } from "../../../../../utils/notify";
import { formatMoney } from "../../../../../components/Base/MoneyInput";
import { useAuth } from "../../../../../hooks/AuthHooks";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import TicketsDavivienda from "../../components/TicketsDavivienda";
import Select from "../../../../../components/Base/Select";
import {
  postConsultaPagoPorGiroDavivienda,
  postModificarTicketPagoPorGiroDavivienda,
  postPagoPorGiroDavivienda,
} from "../../utils/fetchPagoPorGiro";
import HideInput from "../../../../../components/Base/HideInput";

const PagoGiro = () => {
  const { roleInfo, pdpUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  // const [limiteRecarga, setLimiteRecarga] = useState({
  //   superior: 100000,
  //   inferior: 100,
  // });
  const [peticion, setPeticion] = useState(0);
  const [datosTrans, setDatosTrans] = useState({
    tipoIdentificacion: "01",
    numeroIdentificacion: "",
    codigoFamilia: "",
    nombreTipoIdentificacion: "Cédula de ciudadanía",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [datosConsulta, setDatosConsulta] = useState({});
  const [datosConsultaIdTrx, setDatosConsultaIdTrx] = useState({
    idTrx: "",
    valor: "",
  });
  const [objTicketActual, setObjTicketActual] = useState(null);
  
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
    if (peticion === 3 || peticion === 2) {
      setIsUploading(true);
      postModificarTicketPagoPorGiroDavivienda({
        ticket: objTicketActual,
        idTrx: datosConsultaIdTrx.idTrx,
      })
        .then((res) => {
          if (res?.status) {
            setIsUploading(false);
            notify(res?.msg);
          } else {
            setIsUploading(false);
            notifyError(res?.msg);
          }
        })
        .catch((err) => {
          setIsUploading(false);
          notifyError("No se ha podido conectar al servidor");
          console.error(err);
        });

      return setPeticion(4);
    }
    setShowModal(false);
    setDatosTrans({
      tipoIdentificacion: "01",
      numeroIdentificacion: "",
      codigoFamilia: "",
      nombreTipoIdentificacion: "Cédula de ciudadanía",
    });
    setDatosConsultaIdTrx({
      idTrx: "",
      valor: "",
    });
    setPeticion(0);
  };

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const peticionConsulta = () => {
    setIsUploading(true);
    postConsultaPagoPorGiroDavivienda({
      tipoIdentificacion: datosTrans.tipoIdentificacion,
      numeroIdentificacion: datosTrans.numeroIdentificacion,
      codigoFamilia: datosTrans.codigoFamilia,
      nombre_usuario: pdpUser?.uname ?? "",
      idComercio: roleInfo?.id_comercio,
      idUsuario: roleInfo?.id_usuario,
      idTerminal: roleInfo?.id_dispositivo,
      issuerIdDane: roleInfo?.codigo_dane,
      direccion: roleInfo?.direccion,
      nombreComercio: roleInfo?.["nombre comercio"],
      municipio: roleInfo?.["ciudad"],
      oficinaPropia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
        roleInfo?.tipo_comercio === "KIOSCO"
          ? true
          : false,
    })
      .then((res) => {
        if (res?.status) {
          setIsUploading(false);
          notify(res?.msg);
          setDatosConsultaIdTrx((old) => ({
            ...old,
            idTrx: res?.obj?.idTrx,
            valor: res?.valorTransaccion,
          }));
          let ticket_consulta = res?.obj?.ticket
          ticket_consulta["commerceInfo"][6][1] = "<strong>Transacción Rechazada por el cliente"
          setObjTicketActual(ticket_consulta);
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
        hideModal();
      });
  };
  const peticionPagoPorGiro = () => {
    setIsUploading(true);
    postPagoPorGiroDavivienda({
      tipoIdentificacion: datosTrans.tipoIdentificacion,
      numeroIdentificacion: datosTrans.numeroIdentificacion,
      codigoFamilia: datosTrans.codigoFamilia,
      idComercio: roleInfo?.id_comercio,
      idUsuario: roleInfo?.id_usuario,
      idTerminal: roleInfo?.id_dispositivo,
      issuerIdDane: roleInfo?.codigo_dane,
      nombre_usuario: pdpUser?.uname ?? "",
      nombreComercio: roleInfo?.["nombre comercio"],
      municipio: roleInfo?.["ciudad"],
      oficinaPropia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
        roleInfo?.tipo_comercio === "KIOSCO"
          ? true
          : false,
      direccion: roleInfo?.direccion,
      idTrx: datosConsultaIdTrx.idTrx,
      valor: datosConsultaIdTrx.valor,
      datosTrx: {
        numeroCuenta: datosConsulta?.numeroCuenta,
        origenCuenta: datosConsulta?.origenCuenta,
        cicloDePago: datosConsulta?.cicloDePago,
        talon: datosConsulta?.talon,
      },
    })
      .then((res) => {
        if (res?.status) {
          setIsUploading(false);
          notify(res?.msg);
          setObjTicketActual(res?.obj?.ticket);
          setPeticion(4);
        } else {
          setIsUploading(false);
          notifyError(res?.msg);
          setObjTicketActual(res?.obj?.ticket);
          setPeticion(4);
          // hideModal();
        }
      })
      .catch((err) => {
        setIsUploading(false);
        let ticket_ = objTicketActual
        ticket_["commerceInfo"][6][1] = "Transacción declinada"
        setObjTicketActual(ticket_);
        notifyError("No se ha podido conectar al servidor");
        setPeticion(4);
        console.error(err);
      });
  };
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl mb-10'>Pago por giro Davivienda CB</h1>
      <Form grid onSubmit={onSubmit}>
        <Input
          id='numeroIdentificacion'
          label='Número de identificación'
          type='text'
          name='numeroIdentificacion'
          minLength='5'
          maxLength='10'
          required
          autoComplete='off'
          value={datosTrans.numeroIdentificacion}
          onInput={(e) => {
            const num = e.target.value.replace(/[\s\.\-+eE]/g, "");
            if (!isNaN(num)) {
              setDatosTrans((old) => {
                return { ...old, numeroIdentificacion: num };
              });
            }
          }}></Input>
        <HideInput
          id='codigoFamilia'
          label='Código de familia'
          type='number'
          name='codigoFamilia'
          minLength='1'
          maxLength='8'
          autoComplete='off'
          required
          value={datosTrans.codigoFamilia ?? ""}
          onInput={(e, valor) => {
            let num = valor.replace(/[\s\.]/g, "");
            if (!isNaN(num)) {
              setDatosTrans((old) => {
                return { ...old, codigoFamilia: num };
              });
            }
          }}></HideInput>
        {/* <Input
          id='codigoFamilia'
          label='Código de familia'
          type='text'
          name='codigoFamilia'
          minLength='1'
          maxLength='8'
          required
          autoComplete='off'
          value={datosTrans.codigoFamilia}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setDatosTrans((old) => {
                return { ...old, codigoFamilia: num };
              });
            }
          }}></Input> */}
        <Select
          id='tipoIdentificacion'
          name='tipoIdentificacion'
          label='Tipo de identificación'
          options={{
            "Cédula de ciudadanía": "01",
            "Tarjeta de identidad": "04",
            "Cédula extranjería": "02",
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
                ¿Está seguro de realizar la consulta del giro?
              </h1>
              <h2>{`Número de documento: ${datosTrans.numeroIdentificacion}`}</h2>
              <h2>{`Tipo de documento: ${datosTrans.nombreTipoIdentificacion}`}</h2>
              <h2>{`Código de familia: ${datosTrans.codigoFamilia.replace(
                /\w/g,
                "*"
              )}`}</h2>
              <ButtonBar>
                <Button onClick={hideModal}>Cancelar</Button>
                <Button type='submit' onClick={peticionConsulta}>
                  Aceptar
                </Button>
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
              <h2>{`Nombre beneficiario: ${
                datosConsulta.nombreBeneficiario.replace(/[0]/g, "") ?? ""
              }`}</h2>
              <h2>{`Código de Familia: ${datosTrans.codigoFamilia.replace(
                /\w/g,
                "*"
              )}`}</h2>
              <h2>{`Número de identificacion: ${datosConsulta.numeroIdentificacionBeneficiario}`}</h2>
              <h2>{`Valor transacción: ${formatMoney.format(
                datosConsultaIdTrx.valor
              )}`}</h2>
              <ButtonBar>
                <Button onClick={hideModal}>Cancelar</Button>
                <Button type='submit' onClick={() => setPeticion(3)}>
                  Aceptar
                </Button>
              </ButtonBar>
            </>
          )}
          {peticion === 3 && (
            <>
              <h1 className='text-2xl font-semibold'>
                ¿Está seguro de realizar la transacción del giro?
              </h1>
              <h2>{`Código de Familia: ${datosTrans.codigoFamilia.replace(
                /\w/g,
                "*"
              )}`}</h2>
              <h2>{`Número de identificación: ${datosConsulta.numeroIdentificacionBeneficiario}`}</h2>
              <h2>{`Valor transacción: ${formatMoney.format(
                datosConsultaIdTrx.valor
              )}`}</h2>
              <ButtonBar>
                <Button onClick={hideModal}>Cancelar</Button>
                <Button type='submit' onClick={peticionPagoPorGiro}>
                  Aceptar
                </Button>
              </ButtonBar>
            </>
          )}
          {peticion === 4 && (
            <>
              <h2>
                <ButtonBar>
                  <Button onClick={handlePrint}>Imprimir</Button>
                  <Button type='submit' onClick={hideModal}>
                    Aceptar
                  </Button>
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
