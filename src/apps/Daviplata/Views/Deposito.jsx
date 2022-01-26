import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import Modal from "../../../components/Base/Modal/Modal";
import useQuery from "../../../hooks/useQuery";
import { Fragment, useState, useCallback, useRef } from "react";
import PaymentSummary from "../../../components/Compound/PaymentSummary/PaymentSummary";
import Tickets from "../../../components/Base/Tickets/Tickets";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import { postCashIn } from "../utils/fetchRevalDaviplata";
import { notifyError } from "../../../utils/notify";

const formatMoney = Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
});

const Deposito = () => {
  const [{ phone, valor, summary }, setQuery] = useQuery();

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

  const onSubmitDeposit = useCallback(
    (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const phone = formData.get("numCliente");
      const valor = formData.get("valor");
      const summary = {
        "Numero celular": phone,
        "Valor de deposito": valor,
      };
      setQuery({ phone, valor, summary }, { replace: true });
      setShowModal(true);
    },
    [setQuery]
  );

  const onChange = useCallback(
    (ev) => {
      const formData = new FormData(ev.target.form);
      const phone = (
        (formData.get("numCliente") ?? "").match(/\d/g) ?? []
      ).join("");
      const valor = (
        (formData.get("valor") ?? "").match(/(\d+\.?\d*|\.\d+)/g) ?? []
      ).join("");
      setQuery({ phone, valor }, { replace: true });
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
    };

    postCashIn(body)
      .then((res) => {
        console.log(res);
        setPaymentStatus(true);
      })
      .catch((err) => {
        console.error(err)
        notifyError("Error en la transaccion");
      });
  }, [phone, valor]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Depositos Daviplata</h1>
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
          id="valor"
          name="valor"
          label="Valor a depositar"
          type="number"
          autoComplete="off"
          min={"5000"}
          max={"9999999.99"}
          value={valor}
          onChange={() => {}}
          info={`${formatMoney.format(valor ?? 0)}`}
          required
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Realizar deposito</Button>
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

export default Deposito;
