import { useCallback, useState, useEffect } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Modal from "../../../components/Base/Modal/Modal";
import fetchData from "../../../utils/fetchData";
import Input from "../../../components/Base/Input/Input";
import Form from "../../../components/Base/Form/Form";
import { useAuth } from "../../../hooks/AuthHooks";

const url = process.env.REACT_APP_URL_COLCARD;

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const ConsultarColCard = () => {
  const { quotaInfo, roleInfo } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [tarjeta, setTarjeta] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [showModal2, setShowModal2] = useState(false);

  const onChange = (e) => {
    e.preventDefault();
    fetchData(
      `${url}/puntoDePagoColCard/consultarTarjetaTranscaribe`,
      "POST",
      {},
      {
        numeroTarjeta: tarjeta,
        id_comercio: 112,
        // id_comercio: roleInfo?.id_comercio,
      }
    )
      .then((response) => {
        console.log(response);
        setRespuesta(response);
        habilitarModal();
      })
      .catch((e) => {
        console.log(
          "hubo un problema con la peticion de la consulta al servidor " + e
        );
        setRespuesta(e);
        setShowModal2(true);
      });
  };

  const habilitarModal = () => {
    setShowModal(!showModal);
  };

  console.log(respuesta);

  return (
    <>
      <h1 className="text-3xl">Consultar tarjeta Transcaribe</h1>

      <Form grid onSubmit={onChange}>
        <Input
          id="numeroTarjeta"
          label="Número de la tarjeta"
          type="text"
          name="numeroTarjeta"
          minLength="10"
          maxLength="10"
          required
          value={tarjeta}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setTarjeta(num);
            }
          }}
        ></Input>
        {/* filters={{
          numeroTarjeta: { label: "Número de la tarjeta", type: "number" },
        }} */}
        <ButtonBar>
          <Button type="submit">Realizar consulta</Button>
        </ButtonBar>
      </Form>

      <Modal
        show={showModal}
        handleClose={() => {
          setShowModal(false);
        }}
      >
        {/* {paymentStatus ? (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <Tickets refPrint={printDiv} />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={goToRecaudo}>Cerrar</Button>
            </ButtonBar>
          </div>
        ) : ( */}
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
          <h1 className="text-2xl font-semibold">
            <b>Consulta de tarjeta Transcaribe</b>
          </h1>
          {respuesta?.status == false ? (
            // <h2>{respuesta?.msg.error.mensaje}</h2>
            <h2 className="text-lg pb-2">{respuesta?.msg}</h2>
          ) : (
            <div className="text-base">
              {/* <h1>INFORMACION PROPIETARIO DE LA TARJETA</h1>
              <h2>
                Nombre usuario:
                {respuesta?.obj?.results?.usuarioTarjetaTransporte?.nombre}
              </h2>
              <h2>
                Fecha de nacimiento:
                {
                  respuesta?.obj?.results?.usuarioTarjetaTransporte
                    ?.datosNacimiento
                }
              </h2>
              <h2>
                Direccion:
                {respuesta?.obj?.results?.usuarioTarjetaTransporte?.direccion}
              </h2>
              <h2>
                Documento de identidad:
                {respuesta?.obj?.results?.usuarioTarjetaTransporte?.documento}
              </h2>
              <h2>
                Ciudad:
                {
                  respuesta?.obj?.results?.usuarioTarjetaTransporte
                    ?.nombreCiudad
                }
              </h2> */}

              <h2 className="text-xl pb-2">
                {"Saldo:" +
                  formatMoney.format(respuesta?.obj?.results?.Saldos[0].saldo)}
              </h2>
              <h2 className="text-lg pb-2">Tarjeta numero: {tarjeta}</h2>
              <h2 className="text-lg pb-2">
                Fecha consulta de saldo:
                {respuesta?.obj?.results?.Saldos[0].fechaDeSaldo}
              </h2>
            </div>
          )}
          {/* <h1 className="text-2xl font-semibold">Resumen de pago</h1> */}
          {/* <ul className="grid grid-flow-row auto-rows-fr gap-2 place-items-stretch">
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
            </ul> */}
          <ButtonBar>
            <Button type="submit" onClick={() => setShowModal(false)}>
              Aceptar
            </Button>
          </ButtonBar>
        </div>
        {/* )} */}
      </Modal>

      {/* Manejo de errores con el servidor */}
      <Modal
        show={showModal2}
        handleClose={() => {
          setShowModal2(false);
        }}
      >
        <h1>
          {"ERROR, hubo un problema con la peticion al servidor " + respuesta}
        </h1>
      </Modal>
    </>
  );
};

export default ConsultarColCard;
