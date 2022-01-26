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
import { notifyError } from "../../../utils/notify";
import Tickets from "../../../components/Base/Tickets/Tickets";
import PaymentSummary from "../../../components/Compound/PaymentSummary/PaymentSummary";

const formatMoney = Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
});

const Retiro = () => {
  const [{ phone, valor, otp, summary }, setQuery] = useQuery();

  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const onSubmitDeposit = useCallback((e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const phone = formData.get("numCliente");
    const valor = formData.get("valor");
    const otp = formData.get("OTP");
    const summary = {
      "Numero celular": phone,
      "Valor de retiro": valor,
    };
    setQuery({ phone, valor, otp, summary }, { replace: true });
    setShowModal(true);
  }, [setQuery]);

  const onChange = useCallback(
    (ev) => {
      const formData = new FormData(ev.target.form);
      const phone = (
        (formData.get("numCliente") ?? "").match(/\d/g) ?? []
      ).join("");
      const valor = (
        (formData.get("valor") ?? "").match(/(\d+\.?\d*|\.\d+)/g) ?? []
      ).join("");
      const otp = ((formData.get("OTP") ?? "").match(/\d/g) ?? []).join("");
      setQuery({ phone, valor, otp }, { replace: true });
    },
    [setQuery]
  );

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const goToRecaudo = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onMakePayment = useCallback(() => {
    const body = {
      idcliente: 22,
      ipcliente: "155.0.0.55",
      idpersona: 2,
      NoidentificacionCajero: "100",
      NumCelular: phone,
      Valor: valor,
      OTP: otp
    };

    postCashOut(body)
      .then((res) => {
        console.log(res);
        setPaymentStatus(true);
      })
      .catch((err) => {
        console.error(err);
        notifyError("Error en la transaccion");
      });
  }, [otp, phone, valor]);

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
          value={phone}
          onChange={() => {}}
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
          value={otp}
          onChange={() => {}}
          required
        />
        <Input
          id="valor"
          name="valor"
          label="Valor a depositar"
          type="number"
          step="any"
          autoComplete="off"
          min={"5000"}
          max={"9999999.99"}
          value={valor}
          onChange={() => {}}
          info={`${formatMoney.format(valor ?? 0)}`}
          required
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Realizar retiro</Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={handleClose}>
      {paymentStatus ? (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <Tickets refPrint={printDiv} /* ticket={paymentStatus} */ />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={goToRecaudo}>Cerrar</Button>
            </ButtonBar>
          </div>
        ) : (
          <PaymentSummary summaryTrx={summary}>
            <ButtonBar>
              <Button type="submit" onClick={onMakePayment}>
                Aceptar
              </Button>
              <Button onClick={closeModal}>Cancelar</Button>
            </ButtonBar>
          </PaymentSummary>
        )}
      </Modal>
    </Fragment>
  );
};

export default Retiro;
