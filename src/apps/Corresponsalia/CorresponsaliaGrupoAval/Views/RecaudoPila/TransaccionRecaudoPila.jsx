import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Button from "../../../../../components/Base/Button";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Modal from "../../../../../components/Base/Modal";
import useQuery from "../../../../../hooks/useQuery";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  notify,
  notifyError,
  notifyPending,
} from "../../../../../utils/notify";
import Tickets from "../../components/TicketsAval/TicketsAval";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";
import MoneyInput, {
  formatMoney,
} from "../../../../../components/Base/MoneyInput";
import { useFetch } from "../../../../../hooks/useFetch";
import { useAuth } from "../../../../../hooks/AuthHooks";
import Select from "../../../../../components/Base/Select";
import useMoney from "../../../../../hooks/useMoney";
import { enumParametrosGrupoAval } from "../../utils/enumParametrosGrupoAval";
import { v4 } from "uuid";
import { fetchCustom } from "../../utils/fetchDale";
import { useFetchDale } from "../../hooks/useFetchDale";

const URL_CONSULTAR_COSTO_PLANILLA = `${process.env.REACT_APP_URL_CORRESPONSALIA_AVAL}/recaudo_pila/consulta_planilla`;
const URL_CONSULTAR_COSTO_DOCUMENTO = `${process.env.REACT_APP_URL_CORRESPONSALIA_AVAL}/recaudo_pila/consulta_pin_unico`;
const URL_RECAUDO_PILA = `${process.env.REACT_APP_URL_CORRESPONSALIA_AVAL}/recaudo_pila/recaudo`;
const URL_CONSULTAR_ESTADO_TRX = `${process.env.REACT_APP_URL_CORRESPONSALIA_AVAL}/recaudo_pila/check_bd_estado_trx`;

const Deposito = () => {
  const navigate = useNavigate();
  const { roleInfo, infoTicket, pdpUser } = useAuth();
  const [limitesMontos, setLimitesMontos] = useState({
    max: enumParametrosGrupoAval.MAX_RECAUDO_AVAL,
    min: enumParametrosGrupoAval.MIN_RECAUDO_PILA,
  });
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [datosConsulta, setDatosConsulta] = useState("");

  const [datosTrx, setDatosTrx] = useState({
    numeroPlanilla: "",
    numeroDocumento: "",
    tipo: "2",
    year: "",
    month: "",
    periodoLiquidacion: "",
    valor: 0,
  });
  const [summary, setSummary] = useState([]);
  const [uuid, setUuid] = useState(v4());

  const optionsDocumento = [
    { value: "2", label: "Número de planilla" },
    { value: "3", label: "Número de documento" },
  ];

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const onChangeSelect = useCallback((e) => {
    if (e.target.value === "2") {
      setDatosTrx((old) => ({
        ...old,
        numeroPlanilla: "",
        year: "",
        month: "",
        tipo: "2",
      }));
    } else if (e.target.value === "3") {
      setDatosTrx((old) => ({
        ...old,
        tipo: "3",
        numeroDocumento: "",
        year: "",
        month: "",        
      }));
    }
  }, []);

  const handleClose = useCallback(() => {
    setShowModal(false);
    setDatosTrx({
      numeroPlanilla: "",
      numeroDocumento: "",
      tipo: "2",
      year: "",
      month: "",
      valor: 0,
      periodoLiquidacion: "",
    });
    setSummary([]);
    setUuid(v4());
  }, []);

  const [loadingPeticionConsultaPlanilla, peticionConsultaPlanilla] = useFetch(
    fetchCustom(URL_CONSULTAR_COSTO_PLANILLA, "POST", "Consultar costo")
  );
  const [loadingPeticionConsultaDocumento, peticionConsultaDocumento] = useFetch(
    fetchCustom(URL_CONSULTAR_COSTO_DOCUMENTO, "POST", "Consultar costo")
  );
  const [loadingPeticionRecaudo, peticionRecaudo] = useFetchDale(
    URL_RECAUDO_PILA,
    URL_CONSULTAR_ESTADO_TRX,
    "Realizar Pago créditos Crezcamos"
  );

  const onConsultaPlanilla = useCallback(
    (e) => {
      e.preventDefault();
      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        nombre_usuario: pdpUser?.uname ?? "",
        nombre_comercio: roleInfo?.["nombre comercio"],
        oficina_propia: roleInfo?.tipo_comercio === "OFICINAS PROPIAS" || roleInfo?.tipo_comercio === "KIOSCO" ? true : false,
        valor_total_trx: datosTrx?.valor,
        recaudoPila:{
          numPlanilla: datosTrx?.numeroPlanilla
        }
      };
      notifyPending(
        peticionConsultaPlanilla({}, data),
        {
          render: () => {
            return "Procesando consulta";
          },
        },
        {
          render: ({data: res }) =>{
            setDatosConsulta(res?.obj);
            const summary = {
              "Número de documento": res?.obj?.identificacion,
              "Número de planilla": res?.obj?.plnillaNro,
              "Periodo de liquidación": res?.obj?.priodLiq,
              "Valor a pagar": formatMoney.format(res?.obj?.plnillaVlr),
            };
            setDatosTrx((old) => ({
              ...old,
              numeroDocumento: res?.obj?.identificacion,
              numeroPlanilla: res?.obj?.plnillaNro,
              periodoLiquidacion: res?.obj?.priodLiq,
              valor: res?.obj?.plnillaVlr,
            }));
            setSummary(summary);
            setShowModal(true);
            return "Consulta satisfactoria";
          },
        },
        {
          render: ( { data: error}) => {
            setDatosTrx({
              numeroPlanilla: "",
              numeroDocumento: "",
              tipo: "2",
              year: "",
              month: "",
              valor: 0,
              periodoLiquidacion: "",
            });
            return error?.message ?? "Consulta fallida";
          },
        }
      );
    },
    [datosTrx, pdpUser, roleInfo, peticionConsultaPlanilla]
  );

  const onConsultaDocumento = useCallback(
    (e) => {
      e.preventDefault();
      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        nombre_usuario: pdpUser?.uname ?? "",
        nombre_comercio: roleInfo?.["nombre comercio"],
        oficina_propia: roleInfo?.tipo_comercio === "OFICINAS PROPIAS" || roleInfo?.tipo_comercio === "KIOSCO" ? true : false,
        valor_total_trx: datosTrx?.valor,
        recaudoPila:{
          codOperador: datosTrx?.numeroPlanilla,
          idContribuyente: datosTrx?.numeroDocumento,
          periodoLiquid: datosTrx?.year + datosTrx?.month,
        }
      };
      notifyPending(
        peticionConsultaDocumento({}, data),
        {
          render: () => {
            return "Procesando consulta";
          },
        },
        {
          render: ({data: res }) =>{
            setDatosConsulta(res?.obj);
            const summary = {
              "Número de documento": datosTrx?.numeroDocumento,
              "Número de planilla": res?.obj?.plnillaNro,
              "Periodo de liquidación": res?.obj?.priodLiq,
              "Valor a pagar": formatMoney.format(res?.obj?.plnillaVlr),
            };
            setDatosTrx((old) => ({
              ...old,
              numeroDocumento: datosTrx?.numeroDocumento,
              numeroPlanilla: res?.obj?.plnillaNro,
              periodoLiquidacion: res?.obj?.priodLiq,
              valor: res?.obj?.plnillaVlr,
            }));
            setSummary(summary);
            setShowModal(true);
            return "Consulta satisfactoria";
          },
        },
        {
          render: ( { data: error}) => {
            setDatosTrx({
              numeroPlanilla: "",
              numeroDocumento: "",
              tipo: "2",
              year: "",
              month: "",
              valor: 0,
              periodoLiquidacion: "",
            });
            return error?.message ?? "Consulta fallida";
          },
        }
      );
    },
    [datosTrx, pdpUser, roleInfo, peticionConsultaDocumento]
  );
  
  const goToRecaudo = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  
  const onMakePayment = useCallback(() => {
    const data = {
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
        id_uuid_trx: uuid,
      },
      nombre_usuario: pdpUser?.uname ?? "",
      nombre_comercio: roleInfo?.["nombre comercio"],
      oficina_propia: roleInfo?.tipo_comercio === "OFICINAS PROPIAS" || roleInfo?.tipo_comercio === "KIOSCO" ? true : false,
      valor_total_trx: datosTrx?.valor,
      id_trx: datosConsulta?.id_trx,
      recaudoPila:{
        numPlanilla: datosTrx?.numeroPlanilla,
        idContribuyente: datosTrx?.numeroDocumento,
        periodoLiquid: datosTrx?.periodoLiquidacion,
        address: roleInfo?.["direccion"],
      }
    };
    const dataAditional = {
      id_uuid_trx: uuid,
    };
    notifyPending(
      peticionRecaudo(data, dataAditional),
      {
        render: () => {
          return "Procesando transacción";
        },
      },
      {
        render: ({ data: res }) => {
          setPaymentStatus(res?.obj?.ticket ?? {});
          return "Transaccion satisfactoria";
        },
      },
      {
        render({ data: err }) {
          navigate("/corresponsaliaPowwi");
          if (err?.cause === "custom") {
            return <p style={{ whiteSpace: "pre-wrap" }}>{err?.message}</p>;
          }
          console.error(err?.message);
          return err?.message ?? "Transacción fallida";
        },
      }
    );
  }, [
    datosTrx?.valor,
    datosTrx.userDoc,
    datosTrx.userDocDepositante,
    datosTrx.numeroTelefono,
    datosTrx.numeroTelefonoDepositante,
    peticionRecaudo,
    roleInfo,
    infoTicket,
    datosConsulta,
    datosTrx.tipoDocumento,
  ]);

  return (
    <>
      <Fragment>
        <h1 className='text-3xl mt-6'>Recaudo Pila</h1>
        <Form onSubmit={datosTrx?.tipo === "2" ? onConsultaPlanilla : onConsultaDocumento} grid>
            <Select
                id='tipoDocumento'
                label='Consultar por'
                options={optionsDocumento}
                value={datosTrx?.tipo}
                onChange={onChangeSelect}
                required
            />
            {datosTrx?.tipo === "2" && (
              <Input
                id='numeroPlanilla'
                name='numeroPlanilla'
                label='Número de planilla'
                type='text'
                autoComplete='off'
                minLength={"5"}
                maxLength={"10"}
                value={datosTrx?.numeroPlanilla}
                onInput={(e) => {
                    const num = e.target.value.replace(/[\s\.\-+eE]/g, "");
                    if (!isNaN(num)) {
                      setDatosTrx(prevState => ({
                        ...prevState,
                        numeroPlanilla: num
                      }));
                    }
                }}
                required
              />
            )}
            {datosTrx?.tipo === "3" && (
              <>
                <Input
                  id='numeroDocumento'
                  name='numeroDocumento'
                  label='Número de documento'
                  type='text'
                  autoComplete='off'
                  minLength={"5"}
                  maxLength={"10"}
                  value={datosTrx?.numeroDocumento}
                  onInput={(e) => {
                      const num = e.target.value.replace(/[\s\.\-+eE]/g, "");
                      if (!isNaN(num)) {
                        setDatosTrx(prevState => ({
                          ...prevState,
                          numeroDocumento: num
                        }));
                      }
                  }}
                  required
                />
                <Input
                  type='month'
                  id='periodoLiquidacion'
                  name='periodoLiquidacion'
                  label='Periodo de liquidación'
                  autoComplete='off'
                  value={`${datosTrx?.year}-${datosTrx?.month}`}
                  onChange={(e) => {
                    const [year, month] = e.target.value.split('-');
                    setDatosTrx((prevState) => ({
                      ...prevState,
                      year: year,
                      month: month,
                    }));
                  }}
                  required
                />
              </>
            )}
        {/******************************Respuesta Lectura runt*******************************************************/}
            <ButtonBar className={"lg:col-span-2"}>
                <Button type={"submit"} disabled={datosTrx?.tipo === "2" ? loadingPeticionConsultaPlanilla : loadingPeticionConsultaDocumento}>
                    Realizar consulta
                </Button>
                <Button
                    type='button'
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
          show={showModal}
          handleClose={paymentStatus || loadingPeticionRecaudo ? () => {} : handleClose}>
          {paymentStatus ? (
            <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center'>
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button onClick={goToRecaudo}>Cerrar</Button>
              </ButtonBar>
              <Tickets refPrint={printDiv} ticket={paymentStatus} />
            </div>
          ) : (
            <PaymentSummary summaryTrx={summary} title='Respuesta de consulta planilla' subtitle = "Resumen de la transacción">
              <ButtonBar>
                <Button
                  type='submit'
                  onClick={onMakePayment}
                  disabled={loadingPeticionRecaudo}>
                  Aceptar
                </Button>
                <Button
                  type='button'
                  onClick={() => 
                    {
                      handleClose();
                      notifyError("Transacción cancelada por el usuario");
                    }}
                  disabled={loadingPeticionRecaudo}>
                  Cancelar
                </Button>
              </ButtonBar>
            </PaymentSummary>
          )}
        </Modal>
      </Fragment>
    </>
  );
};

export default Deposito;
