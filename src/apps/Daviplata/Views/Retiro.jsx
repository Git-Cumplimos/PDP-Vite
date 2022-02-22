import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import { Fragment, useCallback, useRef, useState } from "react";
import Modal from "../../../components/Base/Modal/Modal";
import useQuery from "../../../hooks/useQuery";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { postCashOut } from "../utils/fetchRevalDaviplata";
import { notify, notifyError } from "../../../utils/notify";
import Tickets from "../../../components/Base/Tickets/Tickets";
import PaymentSummary from "../../../components/Compound/PaymentSummary/PaymentSummary";
import MoneyInput, {
  formatMoney,
} from "../../../components/Base/MoneyInput/MoneyInput";
import { useFetch } from "../../../hooks/useFetch";
import { useAuth } from "../../../hooks/AuthHooks";

const Retiro = () => {
  const navigate = useNavigate();

  const [{ phone, userDoc, valor, otp, summary }, setQuery] = useQuery();

  const { roleInfo, infoTicket } = useAuth();

  const [loadingCashOut, fetchCashOut] = useFetch(postCashOut);

  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const onSubmitDeposit = useCallback(
    (e) => {
      e.preventDefault();
      if (valor >= 5000 && valor < 10000000) {
        const formData = new FormData(e.target);
        const phone = formData.get("numCliente");
        const valorFormat = formData.get("valor");
        const otp = formData.get("OTP");
        const summary = {
          "Numero celular": phone,
          "C.C. de quien retira": userDoc,
          "Valor de retiro": valorFormat,
          "Token de seguridad": otp,
        };
        setQuery({ phone, valor, otp, summary }, { replace: true });
        setShowModal(true);
      } else {
        notifyError(
          "El valor del deposito debe estar entre $ 5.000 y $ 9.999.999"
        );
      }
    },
    [setQuery, valor, userDoc]
  );

  const onChange = useCallback(
    (ev) => {
      if (ev.target.name !== "valor") {
        const formData = new FormData(ev.target.form);
        const phone = (
          (formData.get("numCliente") ?? "").match(/\d/g) ?? []
        ).join("");
        const otp = ((formData.get("OTP") ?? "").match(/\d/g) ?? []).join("");
        const userDoc = (
          (formData.get("docCliente") ?? "").match(/\d/g) ?? []
        ).join("");
        setQuery(
          { phone, userDoc, valor: valor ?? "", otp },
          { replace: true }
        );
      }
    },
    [setQuery, valor]
  );

  const onMoneyChange = useCallback(
    (e, valor) => {
      setQuery(
        { phone: phone ?? "", userDoc: userDoc ?? "", otp: otp ?? "", valor },
        { replace: true }
      );
    },
    [setQuery, phone, otp, userDoc]
  );

  const goToRecaudo = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onMakePayment = useCallback(() => {
    const body = {
      id_comercio: roleInfo?.id_comercio,
      id_usuario: roleInfo?.id_usuario,
      oficina_propia: false,
      idcliente: 5,
      ipcliente: "172.17.0.4",
      idpersona: 240,
      NoidentificacionCajero: "1022424095",
      NoIdentificacionUsuario: userDoc,
      NumCelular: phone,
      Valor: valor,
      OTP: otp,
    };

    fetchCashOut(body)
      .then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        notify("Transaccion satisfactoria");
        const trx_id = res?.obj?.trxId ?? 0;
        const tempTicket = {
          title: "Recibo de retiro",
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
            ["Id Comercio", roleInfo?.id_comercio],
            ["No. terminal", roleInfo?.id_dispositivo],
            ["Municipio", roleInfo?.ciudad || "Bogota"],
            ["Dirección", roleInfo?.ciudad || "Calle 11 # 11 - 2"],
            ["Id Trx", trx_id],
            ["Id Transacción", res?.obj?.IdTransaccion],
          ],
          commerceName: "Daviplata",
          trxInfo: [
            ["Celular", phone],
            ["C.C.", userDoc],
            ["Valor retiro", formatMoney.format(valor)],
          ],
          disclamer: "Para quejas o reclamos comuniquese al *num PDP*",
        };
        setPaymentStatus(tempTicket);
        infoTicket(trx_id, 21, tempTicket)
          .then((resTicket) => {
            console.log(resTicket);
          })
          .catch((err) => {
            console.error(err);
            notifyError("Error guardando el ticket");
          });
      })
      .catch((err) => {
        console.error(err);
        notifyError("Error en la transaccion");
      });
  }, [userDoc, otp, phone, valor, fetchCashOut, roleInfo, infoTicket]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Retiros Daviplata</h1>
      <Form onSubmit={onSubmitDeposit} onChange={onChange} grid>
        <Input
          id="numCliente"
          name="numCliente"
          label="Número telefónico de cliente"
          type="text"
          autoComplete="off"
          minLength={"10"}
          maxLength={"10"}
          value={phone ?? ""}
          onChange={() => {}}
          required
        />
        <Input
          id="docCliente"
          name="docCliente"
          label="CC de quien retira"
          type="text"
          autoComplete="off"
          minLength={"7"}
          maxLength={"13"}
          value={userDoc ?? ""}
          onInput={() => {}}
          required
        />
        <Input
          id="OTP"
          name="OTP"
          label="Token de retiro"
          type="text"
          minLength="6"
          maxLength="6"
          autoComplete="off"
          value={otp ?? ""}
          onChange={() => {}}
          required
        />
        <MoneyInput
          id="valor"
          name="valor"
          label="Valor a retirar"
          autoComplete="off"
          min={5000}
          onInput={onMoneyChange}
          required
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Realizar retiro</Button>
        </ButtonBar>
      </Form>
      <Modal
        show={showModal}
        handleClose={
          paymentStatus ? () => {} : loadingCashOut ? () => {} : handleClose
        }
      >
        {paymentStatus ? (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <Tickets refPrint={printDiv} ticket={paymentStatus} />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={goToRecaudo}>Cerrar</Button>
            </ButtonBar>
          </div>
        ) : (
          <PaymentSummary summaryTrx={summary}>
            <ButtonBar>
              <Button
                type="submit"
                onClick={onMakePayment}
                disabled={loadingCashOut}
              >
                Aceptar
              </Button>
              <Button onClick={handleClose} disabled={loadingCashOut}>
                Cancelar
              </Button>
            </ButtonBar>
          </PaymentSummary>
        )}
      </Modal>
    </Fragment>
  );
};

export default Retiro;
