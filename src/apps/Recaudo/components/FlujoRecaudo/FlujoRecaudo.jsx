import { Fragment, useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Modal from "../../../../components/Base/Modal";
import Tickets from "../../../../components/Base/Tickets";
import useQuery from "../../../../hooks/useQuery";
import fetchData from "../../../../utils/fetchData";
import { notifyError } from "../../../../utils/notify";
import RefsForm from "../RefsForm/RefsForm";

const urlRecaudo = process.env.REACT_APP_URL_REVAL_RECAUDO;

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
});

const pago_parcial = true;

const FlujoRecaudo = ({ foundRefs }) => {
  const [{ id_convenio }] = useQuery();

  const navigate = useNavigate();
  const [brokerData, setBrokerData] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [summaryTrx, setSummaryTrx] = useState([]);

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const onSubmitRefs = useCallback(
    (e) => {
      e.preventDefault();

      const valInput = e.target.querySelector("input[name='valor']");

      const formData = new FormData(e.target);
      const referencias = formData.getAll("referencias");
      let monto = formData.get("valor");
      monto = isNaN(parseFloat(monto)) ? 0 : parseFloat(monto);
      fetchData(
        `${urlRecaudo}/consulta`,
        "POST",
        {},
        {
          id_convenio,
          referencias,
          monto,
        }
      )
        .then((res) => {
          if (res?.status) {
            const resAuto = res?.obj?.autorizador;
            setBrokerData(resAuto?.status);
            if (resAuto?.status) {
              const objTemp = [];
              referencias.forEach((val, ind) => {
                objTemp.push([foundRefs?.[ind]?.nombre_referencia, val]);
              });
              if (isNaN(parseFloat(monto))) {
                valInput.value = res?.obj?.monto;
              }
              valInput.readOnly = !pago_parcial;
              objTemp.push(["Valor", formatMoney.format(res?.obj?.monto)]);
              setSummaryTrx(objTemp);
            } else {
              notifyError(resAuto?.msg);
            }
          }
        })
        .catch((err) => console.error(err));
    },
    [id_convenio, foundRefs]
  );

  const onSubmitPayment = useCallback((e) => {
    e.preventDefault();
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const goToRecaudo = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onMakePayment = useCallback(() => {
    setPaymentStatus(true);
  }, []);

  return (
    <Fragment>
      <RefsForm
        data={foundRefs}
        onSubmit={brokerData ? onSubmitPayment : onSubmitRefs}
        btnName={brokerData ? "Confirmar pago" : "Consultar"}
      />
      <Modal
        show={showModal}
        handleClose={paymentStatus ? () => {} : closeModal}
      >
        {paymentStatus ? (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <Tickets refPrint={printDiv} /* ticket={paymentStatus} */ />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={goToRecaudo}>Cerrar</Button>
            </ButtonBar>
          </div>
        ) : (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
            <h1 className="text-2xl font-semibold">
              ¿Esta seguro de realizar el pago?
            </h1>
            <h1 className="text-2xl font-semibold">Resumen de pago</h1>
            <ul className="grid grid-flow-row auto-rows-fr gap-2 place-items-stretch">
              {summaryTrx.map(([key, val]) => {
                return (
                  <li key={key}>
                    <h1 className="grid grid-flow-col auto-cols-fr gap-6 place-items-center">
                      <strong className="justify-self-end">{key}:</strong>
                      <p>{val}</p>
                    </h1>
                  </li>
                );
              })}
            </ul>
            <ButtonBar>
              <Button type="submit" onClick={onMakePayment}>
                Aceptar
              </Button>
              <Button onClick={closeModal}>Cancelar</Button>
            </ButtonBar>
          </div>
        )}
      </Modal>
    </Fragment>
  );
};

export default FlujoRecaudo;
