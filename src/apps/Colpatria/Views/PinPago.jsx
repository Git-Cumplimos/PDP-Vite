import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import { useAuth } from "../../../hooks/AuthHooks";
import useMoney from "../../../hooks/useMoney";
import { makePinPago } from "../utils/fetchFunctions";

import { notifyPending, notifyError } from "../../../utils/notify";
import {
  makeMoneyFormatter,
  onChangeNumber,
  toAccountNumber,
} from "../../../utils/functions";
import fetchData from "../../../utils/fetchData";
import TicketColpatria from "../components/TicketColpatria";

const formatMoney = makeMoneyFormatter(2);

const PinPago = () => {
  const navigate = useNavigate();

  const { roleInfo, infoTicket } = useAuth();

  const [userDocument, setUserDocument] = useState("");
  const [userDocumentDate, setUserDocumentDate] = useState("");
  const [userAddress /* , setUserAddress */] = useState(
    roleInfo?.direccion ?? ""
  );
  const [pinNumber, setAccountNumber] = useState("");
  const [valPinPago, setValPinPago] = useState(0);

  const [limitesMontos, setLimitesMontos] = useState({
    max: 9999999,
    min: 5000,
  });

  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const onChangeMoney = useMoney({
    limits: [limitesMontos.min, limitesMontos.max],
  });

  const [loadingPinPago, setLoadingPinPago] = useState(false);

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const summary = useMemo(
    () => ({
      "No. Identificación": userDocument,
      "No. De PIN": toAccountNumber(pinNumber),
      "Valor a Retirar": formatMoney.format(valPinPago),
    }),
    [pinNumber, userDocument, valPinPago]
  );

  const handleClose = useCallback(() => {
    setShowModal(false);
    if (!paymentStatus) {
      notifyError("Transacción cancelada por el usuario");
    }
    navigate("/corresponsalia/colpatria");
  }, [navigate, paymentStatus]);

  const onMakePayment = useCallback(
    (ev) => {
      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        oficina_propia: roleInfo?.tipo_comercio === "OFICINAS PROPIAS",
        valor_total_trx: valPinPago,

        // Datos trx colpatria
        colpatria: {
          user_document: userDocument,
          numero_pin: pinNumber,
          fecha_expedicion: userDocumentDate,
          is_persona_natural: true,
          location: {
            address: userAddress,
            dane_code: roleInfo?.codigo_dane,
            city: roleInfo?.ciudad.substring(0, 7),
          },
        },
      };
      notifyPending(
        makePinPago(data),
        {
          render() {
            setLoadingPinPago(true);
            return "Procesando transacción";
          },
        },
        {
          render({ data: res }) {
            setLoadingPinPago(false);
            const trx_id = res?.obj?.id_trx ?? 0;
            const id_type_trx = res?.obj?.id_type_trx ?? 0;
            const codigo_autorizacion = res?.obj?.codigo_autorizacion ?? 0;
            const tempTicket = {
              title: "Recibo de retiro de pin",
              timeInfo: {
                "Fecha de venta": Intl.DateTimeFormat("es-CO", {
                  year: "2-digit",
                  month: "2-digit",
                  day: "2-digit",
                }).format(new Date()),
                Hora: Intl.DateTimeFormat("es-CO", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }).format(new Date()),
              },
              commerceInfo: [
                ["Comercio", roleInfo?.["nombre comercio"]],
                ["No. terminal", roleInfo?.id_dispositivo],
                ["Dirección", roleInfo?.direccion],
                ["Telefono", roleInfo?.telefono],
                ["Id Trx", trx_id],
                ["Id Aut", codigo_autorizacion],
                // ["Id Transacción", res?.obj?.IdTransaccion],
              ],
              commerceName: "Colpatria",
              trxInfo: [
                ["No. Identificación", userDocument],
                ["", ""],
                ["No. De PIN", pinNumber],
                ["", ""],
                ["Valor a Retirar", formatMoney.format(valPinPago)],
                ["", ""],
              ],
              disclamer: "Para quejas o reclamos comuniquese al *num PDP*",
            };
            setPaymentStatus(tempTicket);
            infoTicket(trx_id, id_type_trx, tempTicket)
              .then((resTicket) => {
                console.log(resTicket);
              })
              .catch((err) => {
                console.error(err);
                notifyError("Error guardando el ticket");
              });

            return "Transacción satisfactoria";
          },
        },
        {
          render({ data: err }) {
            setLoadingPinPago(false);
            navigate("/corresponsalia/colpatria");
            if (err?.cause === "custom") {
              return err?.message;
            }
            console.error(err?.message);
            return "Transacción fallida";
          },
        }
      );
    },
    [
      pinNumber,
      userDocument,
      userDocumentDate,
      userAddress,
      valPinPago,
      roleInfo,
      infoTicket,
      navigate,
    ]
  );

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_URL_TRXS_TRX}/tipos-operaciones`,
      "GET",
      { tipo_op: 106 }
    )
      .then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        const _parametros = res?.obj?.[0]?.Parametros;
        setLimitesMontos({
          max: parseFloat(_parametros?.monto_maximo),
          min: parseFloat(_parametros?.monto_minimo),
        });

        // setRevalTrxParams({
        //   idcliente: parseFloat(_parametros?.idcliente) ?? 0,
        //   idpersona: parseFloat(_parametros?.idpersona) ?? 0,
        //   NoidentificacionCajero: _parametros?.NoidentificacionCajero ?? "",
        // });
      })
      .catch((err) => {
        console.error(err);
        notifyError("Error consultando parametros de la transaccion");
      });
  }, []);

  /**
   * Check if has commerce data
   */

  const hasData = useMemo(() => {
    if (!roleInfo || (roleInfo && Object.keys(roleInfo).length === 0)) {
      return false;
    }
    const keys = [
      "id_comercio",
      "id_usuario",
      "tipo_comercio",
      "id_dispositivo",
      "ciudad",
      "direccion",
      "codigo_dane",
    ];
    for (const key of keys) {
      if (!(key in roleInfo)) {
        return false;
      }
    }
    return true;
  }, [roleInfo]);

  if (!hasData) {
    notifyError(
      "El usuario no cuenta con datos de comercio, no se permite la transaccion"
    );
    return <Navigate to={"/"} replace />;
  }

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Retiros con PIN</h1>
      <Form
        onSubmit={(ev) => {
          ev.preventDefault();
          setShowModal(true);
        }}
        grid
      >
        <Input
          id="docCliente"
          name="docCliente"
          label="No. Identificación"
          type="tel"
          autoComplete="off"
          minLength={"5"}
          maxLength={"12"}
          value={userDocument}
          onInput={(ev) => setUserDocument(onChangeNumber(ev))}
          required
        />
        <Input
          id="docClienteDate"
          name="docClienteDate"
          label="Fecha expedicion identificacion"
          type="date"
          autoComplete="off"
          value={userDocumentDate}
          onInput={(ev) => setUserDocumentDate(ev.target.value)}
          required
        />
        <Input
          id="numPin"
          name="numPin"
          label="No. De PIN"
          type="text"
          autoComplete="off"
          maxLength={"12"}
          onInput={(ev) => setAccountNumber(ev.target.value)}
          required
        />
        <Input
          id="valor"
          name="valor"
          label="Valor a Retirar"
          autoComplete="off"
          type="tel"
          minLength={"5"}
          maxLength={"11"}
          onInput={(ev) => setValPinPago(onChangeMoney(ev))}
          required
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Realizar retiro</Button>
        </ButtonBar>
      </Form>
      <Modal
        show={showModal}
        handleClose={loadingPinPago ? () => {} : handleClose}
      >
        {paymentStatus ? (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <TicketColpatria refPrint={printDiv} ticket={paymentStatus} />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={handleClose}>Cerrar</Button>
            </ButtonBar>
          </div>
        ) : (
          <PaymentSummary summaryTrx={summary}>
            <ButtonBar>
              <Button
                type="submit"
                onClick={onMakePayment}
                disabled={loadingPinPago}
              >
                Aceptar
              </Button>
              <Button onClick={handleClose} disabled={loadingPinPago}>
                Cancelar
              </Button>
            </ButtonBar>
          </PaymentSummary>
        )}
      </Modal>
    </Fragment>
  );
};

export default PinPago;
