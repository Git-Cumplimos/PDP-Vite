import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Modal from "../../../../components/Base/Modal";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { notifyError, notifyPending } from "../../../../utils/notify";
import Tickets from "../../components/TicketsCrezcamos";
import MoneyInput, { formatMoney } from "../../../../components/Base/MoneyInput";
import { useFetch } from "../../../../hooks/useFetch";
import { useAuth } from "../../../../hooks/AuthHooks";
import Select from "../../../../components/Base/Select";
import { enumParametrosCrezcamos } from "../../utils/enumParametrosCrezcamos";
import { v4 } from "uuid";
import { fetchCustom } from "../../utils/fetchCorresponsaliaCrezcamos";
import { useFetchCrezcamos } from "../../hooks/fetchCrezcamos";

const URL_CONSULTAR_SALDOS = `${process.env.REACT_APP_URL_CORRESPONSALIA_CREZCAMOS}/crezcamos/consultapagocredito`;
const URL_PAGO_CREDITOS = `${process.env.REACT_APP_URL_CORRESPONSALIA_CREZCAMOS}/crezcamos/pagocredito`;
const URL_CONSULTAR_ESTADO_TRX = `${process.env.REACT_APP_URL_CORRESPONSALIA_CREZCAMOS}/crezcamos/check_estado_pagocredito_crezcamos`;

const PagoCredito = () => {
  const navigate = useNavigate();
  const { roleInfo, infoTicket } = useAuth();
  const [limitesMontos, setLimitesMontos] = useState({
    max: enumParametrosCrezcamos.maxPagoCreditos,
    min: enumParametrosCrezcamos.minPagoCreditos,
  });
  // const [, fetchTypes] = useFetch();
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [datosConsulta, setDatosConsulta] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [datosTrx, setDatosTrx] = useState({
    tipoDocumento: "1",
    userDoc: "",
    nombreCliente: "",
    numCredito: "",
    valor:"",
  });
  const [valorTrxOn, setValorTrxOn] = useState(false);
  const [valor, setValor] = useState("");
  const [summary, setSummary] = useState([]);
  const [uuid, setUuid] = useState(v4());

  const optionsDocumento = [
    { value: "1", label: "" },
    { value: "2", label: "Cédula de ciudadanía" },
    { value: "3", label: "NIT" },
  ];

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const handleClose = useCallback(() => {
    setShowModal(false);
    setDatosTrx({
      tipoDocumento: "1",
      userDoc: "",
      userDocDepositante: "",
      numeroTelefono: "",
      numeroTelefonoDepositante: "",
    });
    setValor("");
    setSummary([]);
    setUuid(v4());
  }, []);

  const [loadingPeticionConsultaCosto, peticionConsultaCosto] = useFetch(
    fetchCustom(URL_CONSULTAR_SALDOS, "POST", "Consultar saldo")
  );

  const onSubmitDeposito = useCallback(
    (e) => {
      e.preventDefault();
      setIsUploading(true);
      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        nombre_usuario: roleInfo?.["nombre comercio"],
        nombre_comercio: roleInfo?.["nombre comercio"],
        oficina_propia: roleInfo?.tipo_comercio === "OFICINAS PROPIAS" || roleInfo?.tipo_comercio === "KIOSCO" ? true : false,
        valor_total_trx: valor,
        Datos: {
          tipo_documento: datosTrx?.tipoDocumento,
          documento: datosTrx?.documento,
        },
      };
      notifyPending(
        peticionConsultaCosto({}, data),
        {
          render: () => {
            setIsUploading(true);
            return "Procesando consulta";
          },
        },
        {
          render: ({data: res }) =>{
            setIsUploading(false);
            setDatosConsulta(res?.obj);
            setShowModal(true);
            return "Consulta satisfactoria";
          },
        },
        {
          render: ( { data: error}) => {
            setIsUploading(false);
            setDatosTrx({
              tipoDocumento: "1",
              userDoc: "",
              userDocDepositante: "",
              numeroTelefono: "",
              numeroTelefonoDepositante: ""
            });
            setValor("");
            return error?.message ?? "Consulta fallida";
          },
        }
      );
    },
    [valor, limitesMontos]
  );
  
  const goToRecaudo = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  
  const [loadingPeticionPago, peticionPago] = useFetchCrezcamos(
    URL_PAGO_CREDITOS,
    URL_CONSULTAR_ESTADO_TRX,
    "Realizar Pago créditos Crezcamos"
  );
  const onMakePayment = useCallback(() => {
    setIsUploading(true);
    const data = {
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
        id_uuid_trx: uuid,
      },
      nombre_usuario: roleInfo?.["nombre comercio"],
      nombre_comercio: roleInfo?.["nombre comercio"],
      oficina_propia: roleInfo?.tipo_comercio === "OFICINAS PROPIAS" || roleInfo?.tipo_comercio === "KIOSCO" ? true : false,
      valor_total_trx: valor,
      id_trx: datosConsulta?.id_trx,
      Datos: {
        tipo_documento: datosTrx.tipoDocumento,
        documento: datosTrx.userDoc,
        num_credito: datosTrx.userDocDepositante,
        fecha: datosTrx.userDocDepositante,
        time_stamp: datosTrx.userDocDepositante,
        ip_address: datosTrx.userDocDepositante,
        pymt_type: datosTrx.userDocDepositante,
      },
    };
    notifyPending(
      peticionPago({}, data),
      {
        render: () => {
          return "Procesando transacción";
        },
      },
      {
        render: ({ data: res }) => {
          setIsUploading(false);
          setPaymentStatus(res?.obj?.ticket ?? {});
          return "Transaccion satisfactoria";
        },
      },
      {
        render({ data: err }) {
          setIsUploading(false);
          navigate("/corresponsaliaCrezcamos");
          if (err?.cause === "custom") {
            return <p style={{ whiteSpace: "pre-wrap" }}>{err?.message}</p>;
          }
          console.error(err?.message);
          return err?.message ?? "Transacción fallida";
        },
      }
    );
  }, [
    valor,
    datosTrx.userDoc,
    datosTrx.userDocDepositante,
    datosTrx.numeroTelefono,
    datosTrx.numeroTelefonoDepositante,
    peticionPago,
    roleInfo,
    infoTicket,
    datosConsulta,
    datosTrx.tipoDocumento,
  ]);

  return (
    <>
      <Fragment>
        <h1 className='text-3xl mt-6'>Pago Créditos Crezcamos</h1>
        <Form onSubmit={onSubmitDeposito} grid>
            <Select
              id='tipoDocumento'
              label='Tipo Documento'
              options={optionsDocumento}
              value={datosTrx.tipoDocumento}
              onChange={(e) => {
                setDatosTrx(prevState => ({
                  ...prevState,
                  tipoDocumento: e.target.value
                }));
              }}
              required
            />
            <Input
                id='docCliente'
                name='docCliente'
                label='Número Documento'
                type='text'
                autoComplete='off'
                maxLength={"15"}
                value={datosTrx.userDoc}
                onInput={(e) => {
                    const num = e.target.value.replace(/[\s\.]/g, "");
                    if (!isNaN(num)) {
                      setDatosTrx(prevState => ({
                        ...prevState,
                        userDoc: num
                      }));
                    }
                }}
                required
            />
            <ButtonBar className={"lg:col-span-2"}>
                <Button type={"submit"} disabled={loadingPeticionConsultaCosto}>
                    Consultar
                </Button>
                <Button  
                    onClick={() => 
                        {
                        goToRecaudo();
                        notifyError("Transacción cancelada por el usuario");
                        }}
                    >
                    Cancelar
                </Button>
            </ButtonBar>
        </Form>
        <Modal
          show={!showModal}
          handleClose={paymentStatus || loadingPeticionPago ? () => {} : handleClose}>
          {
            console.log(datosTrx?.numCredito)
          }
          {paymentStatus ? (
            <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center'>
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button onClick={goToRecaudo}>Cerrar</Button>
              </ButtonBar>
              <Tickets refPrint={printDiv} ticket={paymentStatus} />
            </div>
          ) : (
            <Form grid onSubmit={onMakePayment} style={{ textAlign: 'center' }}>
              <h1 className='text-2xl font-semibold'>
                Respuesta de Consulta Crezcamos
              </h1>
              <h2>{`Tipo Documento: ${datosTrx.tipoDocumento === "1" ? "Cédula de ciudadanía" : "NIT"}`}</h2>
              <h2>{`Número Documento: ${datosTrx?.userDoc}`}</h2>
              <h2>{`Nombre cliente: ${datosTrx?.nombreCliente}`}</h2>
              <Select
                  id='numPrestamo'
                  label='Número préstamo'
                  options={optionsDocumento}
                  value={datosTrx?.numCredito}
                  onChange={(e) => {
                    setValorTrxOn(true)
                    setDatosTrx((old) => {
                      return {
                        ...old,
                        numCredito: e.target.value
                      };
                    })
                  }}
                  required
                />
              {valorTrxOn ?
                <MoneyInput
                  id='valor'
                  name='valor'
                  label='Valor a pagar'
                  autoComplete='off'
                  type='text'
                  minLength={"1"}
                  maxLength={"11"}
                  min={limitesMontos?.min}
                  max={limitesMontos?.max}
                  value={datosTrx?.numCredito === "2" ? "1500" : "0"}
                  disabled={true}
                  equalError={false}
                  equalErrorMin={false}
                  onInput={(e, valor) => {
                    if (!isNaN(valor)){
                      const num = valor;
                      setValor(num)
                    }
                  }}
                  required
                />: ""
              }
              <ButtonBar>
                {(datosTrx?.numCredito !== "" && datosTrx?.numCredito !== "1") && <Button type='submit'>Aceptar</Button>}
                <Button onClick={handleClose}>Cancelar</Button>
              </ButtonBar>
            </Form>
          )}
        </Modal>
      </Fragment>
    </>
  );
};

export default PagoCredito;
