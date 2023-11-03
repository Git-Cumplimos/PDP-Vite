import { v4 } from "uuid";
import { useFetchNequi } from "../../hooks/fetchNequi";
import { enumParametrosNequi } from "../../utils/enumParametrosNequi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/AuthHooks";
import { useCallback, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { notifyError, notifyPending } from "../../../../utils/notify";
import MoneyInput, {
  formatMoney,
} from "../../../../components/Base/MoneyInput";
import Form from "../../../../components/Base/Form";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import Tickets from "../../../../components/Base/Tickets";
import Modal from "../../../../components/Base/Modal";
import Input from "../../../../components/Base/Input";

const URL_REALIZAR_PAGO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/nequi/recarga-notificacion-push`;
const URL_CONSULTA_TRX_BD = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/nequi/check-estado-recarga-credito-nequi`;
const costoTrx = parseInt(
  enumParametrosNequi.COSTO_TRANSACCION_RECARGA_CUPO_NEQUI_NOTIFICACION
);
const impuesto = parseInt(
  enumParametrosNequi.PORCENTAJE_IMPUESTO_RECARGA_CUPO_NEQUI_NOTIFICACION
);

const RecargaCupoNequiNoficacion = () => {
  const navigate = useNavigate();
  const { roleInfo, pdpUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [modalNotificacion, setModalNotificacion] = useState(false);
  const [idTrx, setIdTrx] = useState("");
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
    setModalNotificacion(false);
    setIdTrx("");
  }, []);

  const [loadingPeticionPagoNotificacionPush, peticionPagoNotificacionPush] =
    useFetchNequi(
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
      const totalImpuesto = impuesto === 0 ? 0 : (impuesto * costoTrx) / 100;
      const costoFinalTrx = costoTrx + parseInt(totalImpuesto);
      const totalRecarga = parseInt(valor) - parseInt(costoFinalTrx);
      if (totalRecarga <= 0) {
        notifyError(
          "El costo de la transacción es mayor o igual al valor de la recarga"
        );
        return;
      }
      if (numeroTelefono.length !== 0){
        if (numeroTelefono[0] !== "3"){
          return notifyError("El número Nequi debe comenzar por 3");
        }
      }
      const summary = {
        "Número Nequi": numeroTelefono,
        "Valor de la recarga": formatMoney.format(valor),
        "Costo de transacción": formatMoney.format(costoFinalTrx),
        "Valor neto a recargar": formatMoney.format(totalRecarga),
      };
      setCostoTotalTrx(costoFinalTrx);
      setSummary(summary);
      setShowModal(true);
    },
    [numeroTelefono, valor]
  );

  const makeCashOut = useCallback(
    (ev) => {
      ev.preventDefault();
      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
          id_uuid_trx: uuid,
        },
        nombre_comercio: roleInfo?.["nombre comercio"],
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        nombre_usuario: pdpUser?.uname ?? "",
        address: roleInfo?.["direccion"],
        dane_code: roleInfo?.codigo_dane,
        city: roleInfo?.["ciudad"],
        valor_total_trx: valor,
        Datos: {
          num_celular: numeroTelefono,
          uuid_trx: uuid,
        },
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
            if (!res?.status) {
              const error = res?.msg;
              handleClose();
              return error;
            } else if (res?.obj?.ticket !== undefined){
              setObjTicketActual(res?.obj?.ticket);
              setShowModal(true);
              return "Transacción satisfactoria";
            } else {
              setIdTrx(res?.obj?.id_trx);
              setModalNotificacion(true);
              setShowModal(true);
              return "Envío Notificación Nequi satisfactorio"
            }
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
    [
      numeroTelefono,
      peticionPagoNotificacionPush,
      uuid,
      valor,
      navigate,
      pdpUser,
      roleInfo,
      handleClose,
    ]
  );

  return (
    <>
      <h1 className="text-3xl mt-6">Recarga Cupo Con Nequi</h1>
      <Form onSubmit={onSubmitDeposito} grid>
        <Input
          id="numeroTelefono"
          label="Número Nequi"
          type="text"
          name="numeroTelefono"
          minLength="10"
          maxLength="10"
          required
          autoComplete="off"
          value={numeroTelefono}
          onInput={(e) => {
            let valor = e.target.value;
            let num = valor.replace(/[\s\.\-+eE]/g, "");
            if (!isNaN(num)) {
              if (numeroTelefono.length === 0 && num !== "3") {
                return notifyError("El número Nequi debe comenzar por 3");
              } else if (num.length !== 0) {
                if (num[0] !== "3")
                  return notifyError("El número Nequi debe comenzar por 3");
              }
              setNumeroTelefono(num);
            }
          }}
        />
        <MoneyInput
          id="valor"
          name="valor"
          label="Valor a recargar"
          autoComplete="off"
          type="text"
          minLength={"1"}
          maxLength={"11"}
          min={enumParametrosNequi.MIN_RECARGA_CUPO_NEQUI_NOTIFICACION}
          max={enumParametrosNequi.MAX_RECARGA_CUPO_NEQUI_NOTIFICACION}
          equalError={false}
          equalErrorMin={false}
          value={valor}
          onInput={(e, valor) => {
            if (!isNaN(valor)) {
              const num = valor;
              setValor(num);
            }
          }}
          required
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button
            type={"submit"}
            disabled={loadingPeticionPagoNotificacionPush}
          >
            Realizar Recarga
          </Button>
        </ButtonBar>
      </Form>
      <Modal
        show={showModal}
        handleClose={
          objTicketActual || loadingPeticionPagoNotificacionPush || modalNotificacion
            ? () => {}
            : handleClose
        }
      >
        {objTicketActual ? (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={goToRecaudo}>Cerrar</Button>
            </ButtonBar>
            <Tickets refPrint={printDiv} ticket={objTicketActual} />
          </div>
        ) : modalNotificacion ? (
          <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
            <h1 className='text-2xl text-center mb-5 font-semibold'>
              Envío Notificación Nequi Satisfactorio
            </h1>
            <h2 className='text-xl text-justify font'>1. Revisar centro de Notificaciones de Nequi para aceptar el débito de la transacción.</h2>
            <h2 className='text-xl text-justify font'>
              2. Para consultar el estado de la transacción revisar el 
              <span style={{ color: 'green', fontSize: '20px', fontWeight: 'bold' }}> ID:{idTrx} </span>
              en el <span style={{ color: '#FF8C00', fontSize: '20px', fontWeight: 'bold'}}>módulo de transacciones</span>.
            </h2>
            <ButtonBar>
              <Button onClick={handleClose}>Cerrar</Button>
            </ButtonBar>
          </div>
        ) : (
          <PaymentSummary summaryTrx={summary}>
            <h2 className="text-base font-semibold">
              {`Recuerde que esta transacción tiene un costo de ${formatMoney.format(
                costoTotalTrx
              )}
                el cual será descontado del valor de la recarga.`}
            </h2>
            <Form onSubmit={makeCashOut}>
              <ButtonBar>
                <Button
                  type="button"
                  onClick={() => {
                    handleClose();
                    notifyError("Transacción cancelada por el usuario");
                  }}
                  disabled={loadingPeticionPagoNotificacionPush}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loadingPeticionPagoNotificacionPush}
                >
                  Aceptar
                </Button>
              </ButtonBar>
            </Form>
          </PaymentSummary>
        )}
      </Modal>
    </>
  );
};

export default RecargaCupoNequiNoficacion;
