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
import MoneyInput, { formatMoney } from "../../../components/Base/MoneyInput/MoneyInput";

const Deposito = () => {
  const [{ phone, userDoc, valor, summary }, setQuery] = useQuery();

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
      if (valor >= 5000 && valor < 10000000) {
        const formData = new FormData(e.target);
        const phone = formData.get("numCliente");
        const userDoc = formData.get("docCliente");
        const valorFormat = formData.get("valor");
        const summary = {
          "Numero celular": phone,
          "C.C. del depositante": userDoc,
          "Valor de deposito": valorFormat,
        };
        setQuery({ phone, valor, summary }, { replace: true });
        setShowModal(true);
      } else {
        notifyError(
          "El valor del deposito debe estar entre $ 5.000 y $ 10.000.000"
        );
      }
    },
    [setQuery, valor]
  );

  const onChange = useCallback(
    (ev) => {
      if (ev.target.name !== "valor") {
        const formData = new FormData(ev.target.form);
        const phone = (
          (formData.get("numCliente") ?? "").match(/\d/g) ?? []
        ).join("");
        const userDoc = (
          (formData.get("docCliente") ?? "").match(/\d/g) ?? []
        ).join("");
        setQuery({ phone, userDoc, valor: valor ?? "" }, { replace: true });
      }
    },
    [setQuery, valor]
  );

  const onMoneyChange = useCallback(
    (e, valor) => {
      setQuery(
        { phone: phone ?? "", userDoc: userDoc ?? "", valor },
        { replace: true }
      );
    },
    [setQuery, phone, userDoc]
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
        setPaymentStatus({
          title: "Recibo de deposito",
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
            ["Id Comercio", 2],
            ["No. terminal", 233],
            ["Municipio", "Bogota"],
            ["Dirección", "Calle 11 # 11 - 2"],
            ["Id Trx", 233],
            ["Id Transacción", 99],
          ],
          commerceName: "Daviplata",
          trxInfo: [
            ["Celular", phone],
            ["C.C.", userDoc],
            ["Valor de deposito", formatMoney.format(valor)],
          ],
          disclamer: "Para quejas o reclamos comuniquese al *num PDP*",
        });
      })
      .catch((err) => {
        console.error(err);
        notifyError("Error en la transaccion");
      });
  }, [phone, valor, userDoc]);

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
          value={phone ?? ""}
          onInput={() => {}}
          required
        />
        <Input
          id="docCliente"
          name="docCliente"
          label="CC de quien deposita"
          type="text"
          autoComplete="off"
          minLength={"7"}
          maxLength={"13"}
          value={userDoc ?? ""}
          onInput={() => {}}
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
          <Button type={"submit"}>Realizar deposito</Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={paymentStatus ? () => {} : handleClose}>
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
