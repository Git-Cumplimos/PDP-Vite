import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Button from "../../../../../components/Base/Button";
import { Fragment, useCallback, useRef, useState } from "react";
import Modal from "../../../../../components/Base/Modal";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  notifyError,
  notifyPending,
} from "../../../../../utils/notify";
import Tickets from "../../components/TicketsAval/TicketsAval";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";
import { formatMoney } from "../../../../../components/Base/MoneyInput";
import { useFetch } from "../../../../../hooks/useFetch";
import { useAuth } from "../../../../../hooks/AuthHooks";
import Select from "../../../../../components/Base/Select";
import { enumParametrosGrupoAval } from "../../utils/enumParametrosGrupoAval";
import { v4 } from "uuid";
import { fetchCustom } from "../../utils/fetchDale";
import { useFetchDale } from "../../hooks/useFetchDale";
import { operadoresRecaudoPila } from "../../operadorRecaudoPila";

const URL_CONSULTAR_COSTO_PLANILLA = `${process.env.REACT_APP_URL_CORRESPONSALIA_AVAL}/recaudo_pila/consulta_planilla`;
const URL_CONSULTAR_COSTO_DOCUMENTO = `${process.env.REACT_APP_URL_CORRESPONSALIA_AVAL}/recaudo_pila/consulta_pin_unico`;
const URL_RECAUDO_PILA = `${process.env.REACT_APP_URL_CORRESPONSALIA_AVAL}/recaudo_pila/recaudo`;
const URL_CONSULTAR_ESTADO_TRX = `${process.env.REACT_APP_URL_CORRESPONSALIA_AVAL}/recaudo_pila/check_bd_estado_trx`;

const TransaccionRecaudoPila = () => {
  const navigate = useNavigate();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const { roleInfo, pdpUser } = useAuth();
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
    year: currentYear,
    month: currentMonth,
    periodoLiquidacion: "",
    valor: 0,
    operador: operadoresRecaudoPila["Mi Planilla"],
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
        year: currentYear,
        month: currentMonth,
        tipo: "2",
        operador: operadoresRecaudoPila["Mi Planilla"]
      }));
    } else if (e.target.value === "3") {
      setDatosTrx((old) => ({
        ...old,
        tipo: "3",
        numeroDocumento: "",
        operador: operadoresRecaudoPila["Mi Planilla"],
        year: currentYear,
        month: currentMonth,        
      }));
    }
  }, [currentMonth, currentYear]);

  const handleClose = useCallback(() => {
    setShowModal(false);
    setDatosTrx({
      numeroPlanilla: "",
      numeroDocumento: "",
      tipo: "2",
      year: currentYear,
      month: currentMonth,
      valor: 0,
      periodoLiquidacion: "",
      operador: operadoresRecaudoPila["Mi Planilla"],
    });
    setSummary([]);
    setUuid(v4());
  }, [currentMonth, currentYear]);

  const [loadingPeticionConsultaPlanilla, peticionConsultaPlanilla] = useFetch(
    fetchCustom(URL_CONSULTAR_COSTO_PLANILLA, "POST", "Consultar planilla")
  );
  const [loadingPeticionConsultaDocumento, peticionConsultaDocumento] = useFetch(
    fetchCustom(URL_CONSULTAR_COSTO_DOCUMENTO, "POST", "Consultar documento")
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
              year: currentYear,
              month: currentMonth,
              valor: 0,
              periodoLiquidacion: "",
              operador: operadoresRecaudoPila["Mi Planilla"],
            });
            return error?.message ?? "Consulta fallida";
          },
        }
      );
    },
    [datosTrx, pdpUser, roleInfo, peticionConsultaPlanilla, currentMonth, currentYear]
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
          codOperador: datosTrx?.operador,
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
              year: currentYear,
              month: currentMonth,
              valor: 0,
              periodoLiquidacion: "",
              operador: operadoresRecaudoPila["Mi Planilla"],
            });
            return error?.message ?? "Consulta fallida";
          },
        }
      );
    },
    [datosTrx, pdpUser, roleInfo, peticionConsultaDocumento, currentMonth, currentYear]
  );
  
  const goToRecaudo = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  
  const [loadingPeticionRecaudo, peticionRecaudo] = useFetchDale(
    URL_RECAUDO_PILA,
    URL_CONSULTAR_ESTADO_TRX,
    "Realizar Recaudo Pila"
  );
  const onMakePayment = useCallback(() => {
    let valorTransaccion = datosTrx?.valor;
    const { min, max } = limitesMontos;
    if (valorTransaccion >= min && valorTransaccion <= max) {
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
        valor_total_trx: valorTransaccion,
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
            return "Transacción satisfactoria";
          },
        },
        {
          render({ data: err }) {
            handleClose();
            navigate("/corresponsalia/CorresponsaliaGrupoAval");
            if (err?.cause === "custom") {
              return <p style={{ whiteSpace: "pre-wrap" }}>{err?.message}</p>;
            }
            console.error(err?.message);
            return err?.message ?? "Transacción fallida";
          },
        }
      );
    }
    else {
      notifyError(
        `El valor del recaudo debe estar entre ${formatMoney
          .format(min)
          .replace(/(\$\s)/g, "$")} y ${formatMoney
          .format(max)
          .replace(/(\$\s)/g, "$")}`
      );
    }
  }, [
    datosTrx,
    peticionRecaudo,
    roleInfo,
    pdpUser,
    uuid,
    navigate,
    datosConsulta,
    limitesMontos,
    handleClose
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
                  maxLength={"12"}
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
                <Select
                  id='tipoOperador'
                  label='Nombre operador'
                  options={operadoresRecaudoPila}
                  value={datosTrx?.operador}
                  onChange={(e) => {
                    setDatosTrx(prevState => ({
                      ...prevState,
                      operador: e.target.value
                    }));
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
                    disabled={
                      loadingPeticionConsultaDocumento || loadingPeticionConsultaPlanilla || loadingPeticionRecaudo
                    }
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
              <Tickets refPrint={printDiv} ticket={paymentStatus} />
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button onClick={goToRecaudo}>Cerrar</Button>
              </ButtonBar>
            </div>
          ) : (
            <PaymentSummary summaryTrx={summary} title='Respuesta de consulta planilla' subtitle = "Resumen de la transacción">
              <ButtonBar>
                <Button
                  type='submit'
                  onClick={onMakePayment}
                  disabled={loadingPeticionRecaudo}>
                  Realizar pago
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

export default TransaccionRecaudoPila;
