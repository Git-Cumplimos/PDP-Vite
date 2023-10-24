import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import { Fragment, useCallback, useRef, useState } from "react";
import Modal from "../../../components/Base/Modal";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  notifyError,
  notifyPending,
} from "../../../utils/notify";
import Tickets from "../../../components/Base/Tickets/Tickets"
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import MoneyInput, {
  formatMoney,
} from "../../../components/Base/MoneyInput";
import { useAuth } from "../../../hooks/AuthHooks";
import { enumParametrosNequi } from "../utils/enumParametrosNequi";
import { v4 } from "uuid";
import { useFetchNequi } from "../hooks/fetchNequi";

const URL_REALIZAR_PAGO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/nequi/pagonotificacionpush`;
const URL_CONSULTA_TRX_BD = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/nequi/check_estado_pagocredito_nequi`;
const costoTrx = parseInt(enumParametrosNequi.costoTransaccion)
const impuesto = parseInt(enumParametrosNequi.porcentajeImpuesto)

const Nequi = () => {
  const navigate = useNavigate();
  const { roleInfo, pdpUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [objTicketActual, setObjTicketActual] = useState("");
  const [numeroTelefono, setNumeroTelefono] = useState("");
  const [costoTotalTrx, setCostoTotalTrx] = useState(0);
  const [valor, setValor] = useState("");
  const [summary, setSummary] = useState([]);
  const [uuid, setUuid] = useState(v4());

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const handleClose = useCallback(() => {
    setShowModal(false);
    setNumeroTelefono("");
    setValor("");
    setSummary([]);
    setUuid(v4());
    setObjTicketActual("");
  }, []);

  const [loadingPeticionPagoNotificacionPush, peticionPagoNotificacionPush] = useFetchNequi(
    URL_REALIZAR_PAGO,
    URL_CONSULTA_TRX_BD,
    "Realizar Pago con Notificación Push"
  );

  const goToRecaudo = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onSubmitDeposito = useCallback(
    (ev) => {
      ev.preventDefault();
      const totalImpuesto = impuesto === 0 ? 0 : ((impuesto * parseInt(valor)) / 100);
      const costoFinalTrx = costoTrx + parseInt(totalImpuesto)
      const totalRecarga = parseInt(valor) - parseInt(costoFinalTrx)
      if (totalRecarga <= 0){
        notifyError("El costo de la transacción es mayor o igual al valor de la recarga")
        return;
      }
      const summary = {
        "Número Nequi": numeroTelefono,
        "Valor de la recarga": formatMoney.format(valor),
        "Costo de transacción": formatMoney.format(costoFinalTrx),
        "Valor total a recargar": formatMoney.format(totalRecarga),
      };
      setCostoTotalTrx(costoFinalTrx)
      setSummary(summary);
      setShowModal(true);
    },
    [numeroTelefono, valor]
  );
  
  const makeCashOut = useCallback(
    (ev) => {
      ev.preventDefault();
      const data = {
        id_uuid_trx: uuid,
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        nombre_comercio: roleInfo?.["nombre comercio"],
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        nombre_usuario: pdpUser?.uname ?? "",
        ubicacion: {
          address: roleInfo?.["direccion"],
          dane_code: roleInfo?.codigo_dane,
          city: roleInfo?.["ciudad"],
        },
        valor_trx_total: valor,
        Datos:{
          num_celular: numeroTelefono
        }
      };
      const dataAditional = {
        id_uuid_trx: uuid,
      };
      notifyPending(
        peticionPagoNotificacionPush(data, dataAditional),
        {
          render: () => {
            return "Procesando transacción";
          },
        },
        {
          render: ({ data: res }) => {
            setObjTicketActual(res?.obj?.ticket);
            setShowModal(false);
            handleClose();
            return "Transacción satisfactoria, revisar centro de Notificaciones de Nequi para aceptar el débito de la transacción";
          },
        },
        {
          render: ({ data: error }) => {
            navigate(-1);
            return error?.message ?? "Transacción fallida";
          },
        }
      );
    },
    [numeroTelefono, peticionPagoNotificacionPush, uuid, valor, navigate, pdpUser, roleInfo, handleClose]
  );
  
  return (
    <>
      <Fragment>
        <h1 className='text-3xl mt-6'>Recarga Cupo Con Nequi</h1>
        <Form onSubmit={onSubmitDeposito} grid>
            <Input
                id='numeroTelefono'
                label='Número Nequi'
                type='text'
                name='numeroTelefono'
                minLength='10'
                maxLength='10'
                required
                autoComplete='off'
                value={numeroTelefono}
                onInput={(e) => {
                  let valor = e.target.value;
                  let num = valor.replace(/[\s\.\-+eE]/g, "");
                  if (!isNaN(num)) {
                    if (numeroTelefono.length === 0 && num !== "3") {
                        return notifyError("El número debe comenzar por 3");
                    }
                    setNumeroTelefono(num);
                  }
                }}
            />
            <MoneyInput
                id='valor'
                name='valor'
                label='Valor a recargar'
                autoComplete='off'
                type='text'
                minLength={"1"}
                maxLength={"11"}
                min={enumParametrosNequi.minPagoNotificacionPush}
                max={enumParametrosNequi.maxPagoNotificacionPush}
                equalError={false}
                equalErrorMin={false}
                value={valor}
                onInput={(e, valor) => {
                  if (!isNaN(valor)){
                    const num = valor;
                    setValor(num)
                  }
                }}
                required
            />
            <ButtonBar className={"lg:col-span-2"}>
                <Button type={"submit"} disabled={loadingPeticionPagoNotificacionPush}>
                    Realizar Recarga
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
          handleClose={objTicketActual || loadingPeticionPagoNotificacionPush ? () => {} : handleClose}>
          {objTicketActual ? (
            <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center'>
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button onClick={goToRecaudo}>Cerrar</Button>
              </ButtonBar>
              <Tickets refPrint={printDiv} ticket={objTicketActual} />
            </div>
          ) : (
            <PaymentSummary summaryTrx={summary}>
              <h2 className='text-base font-semibold'>
                {`Recuerde que esta transacción tiene un costo de ${formatMoney.format(costoTotalTrx)}
                el cual será descontado del valor de la recarga.`}
              </h2>
              <Form onSubmit={makeCashOut}>
                <ButtonBar>
                  <Button
                    type='submit'
                    disabled={loadingPeticionPagoNotificacionPush}>
                    Aceptar
                  </Button>
                  <Button
                    type='button'
                    onClick={() => 
                      {
                        handleClose();
                        notifyError("Transacción cancelada por el usuario");
                      }}
                    disabled={loadingPeticionPagoNotificacionPush}>
                    Cancelar
                  </Button>
                </ButtonBar>
              </Form>
            </PaymentSummary>
          )}
        </Modal>
      </Fragment>
    </>
  );
};

export default Nequi;
