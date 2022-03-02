import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../components/Base/Button";
import ButtonBar from "../../components/Base/ButtonBar";
import Modal from "../../components/Base/Modal";
import Form from "../../components/Base/Form";
import PayForm from "./PaymentForm/PayForm";
import { useMarketPlace } from "./utils/MarketPlaceHooks";
import Input from "../../components/Base/Input";
import MoneyInput from "../../components/Base/MoneyInput/MoneyInput";
import Products from "./Products";
import { notifyError } from "../../utils/notify";

const OrdenMarket = () => {
  const [summary, setSummary] = useState({});
  const [showModal, setShowModal] = useState(false);
  const params = useParams();

  const {
    infoMarket: { consulta },
    searchsOrder,
  } = useMarketPlace();

  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    searchsOrder(params.orden)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        notifyError("Fallas en la consulta de la orden, consulte soporte", err);
      });
  }, []);

  const loadModal = (e) => {
    e.preventDefault();
    setSummary({
      Trx: consulta?.obj?.Id_Trx,
      Estado: consulta?.EstadoTrx,
      Valor: formatMoney.format(consulta?.obj?.valor),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="w-full flex flex-col justify-center items-center">
      {consulta?.EstadoTrx === "Aprobado" ? (
        <h1>Esta transacción ya ha sido efectuada</h1>
      ) : consulta?.EstadoTrx === "Cancelada" ? (
        <h1>Esta transacción fue denegada</h1>
      ) : (
        <div>
          <Form onSubmit={loadModal}>
            <Input
              id="orden"
              label="Orden de compra:"
              type="text"
              value={params.orden}
              disabled={true}
            />
            {[consulta].map((row) => {
              return (
                <>
                  <Input
                    id="mensaje"
                    label="Estado de la transacción:"
                    type="text"
                    value={row.EstadoTrx}
                    disabled={true}
                  />
                  <MoneyInput
                    id="mensaje"
                    label="Valor de la transacción:"
                    type="text"
                    value={row?.obj?.valor}
                    disabled={true}
                  />
                </>
              );
            })}
          </Form>
          <ButtonBar>
            <Button type="submit" onClick={(e) => loadModal(e)}>
              Continuar
            </Button>
          </ButtonBar>
        </div>
      )}
      <Modal show={showModal} handleClose={() => closeModal()}>
        <PayForm selected={consulta} summary={summary} />
      </Modal>
    </div>
  );
};

export default OrdenMarket;
