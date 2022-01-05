import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../components/Base/Button/Button";
import ButtonBar from "../../components/Base/ButtonBar/ButtonBar";
import Modal from "../../components/Base/Modal/Modal";
import Form from "../../components/Base/Form/Form";
import PayForm from "./PaymentForm/PayForm";
import { useMarketPlace } from "./utils/MarketPlaceHooks";
const urlConsulta = "http://127.0.0.1:9000/consultorder";

const OrdenMarket = () => {
  const [consultas, setConsultas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const params = useParams();

  const {
    infoMarket: { consulta },
    searchsOrder,
  } = useMarketPlace();

  useEffect(() => {
    console.log(consulta);
    searchsOrder(params.orden).then((res) => {
      console.log(res);
    });
  }, []);

  const loadModal = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="w-full flex flex-col justify-center items-center">
      {consulta.EstadoTrx === "Aprobado" ? (
        <h1>Esta transacción ya ha sido efectuada</h1>
      ) : (
        <div>
          <h1>Orden de compra: {params.orden}</h1>
          <Form onSubmit={loadModal}>
            {[consulta].map((row) => {
              return (
                <div>
                  <h1>Mensaje del servicio: {row.msg}</h1>
                  <h1>Estado de la transacción: {row.EstadoTrx}</h1>
                  <h1>Valor de la transacción: {row?.obj?.valor}</h1>
                  <h1>Punto de pago &copy;</h1>
                </div>
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
        <PayForm selected={consulta} />
      </Modal>
    </div>
  );
};

export default OrdenMarket;
