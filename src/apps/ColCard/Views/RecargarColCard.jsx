import { useCallback, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Modal from "../../../components/Base/Modal/Modal";
import { useAuth } from "../../../hooks/AuthHooks";
import Input from "../../../components/Base/Input/Input";
import Form from "../../../components/Base/Form/Form";
import fetchData from "../../../utils/fetchData";

const url = process.env.REACT_APP_URL_IAM_PDP;

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const RecargarColCard = () => {
  const { quotaInfo, roleInfo } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [tarjeta, setTarjeta] = useState("");
  const [valRecarga, setValRecarga] = useState("");
  const [dataCard, setDataCard] = useState(true);
  const [limiteRecarga, setLimiteRecarga] = useState(200000);
  const [peticion, setPeticion] = useState(false);
  const [petConsulta, setPetConsulta] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState(false);

  // /*ENVIAR NUMERO DE TARJETA Y VALOR DE LA RECARGA*/
  const onChange = (e) => {
    e.preventDefault();
    // console.log("m", roleInfo?.id_comercio);
    peticionConsulta();
    // habilitarModal();
  };

  const habilitarModal = () => {
    setShowModal(!showModal);
  };

  const habilitarModal2 = () => {
    setShowModal2(!showModal2);
    peticionRecarga();
    setPeticion(true);
  };
  const habilitarModal3 = () => {
    setShowModal3(!showModal3);
  };

  const peticionConsulta = () => {
    fetchData(
      "http://127.0.0.1:5000/puntoDePagoColCard/consultarTarjetaTranscaribe",
      "POST",
      {},
      {
        numeroTarjeta: tarjeta,
      }
    )
      .then((response) => {
        console.log(response);
        setPetConsulta(true);
        setDataCard(response);
      })
      .catch((e) => {
        console.log(
          "hubo un problema con la peticion de la consulta al servidor " + e
        );
        setDataCard(e);
        setShowModal3(true);
      });
  };

  const peticionRecarga = () => {
    fetchData(
      "http://localhost:5000/puntoDePagoColCard/recargarTarjetaTranscaribe",
      "POST",
      {},
      {
        numeroTarjeta: tarjeta,
        valorRecarga: valRecarga,
        // valorRecarga: "",
        id_comercio: 8,
        id_usuario: 1,
        id_dispositivo: 801,

        // id_comercio: roleInfo?.id_comercio,
        // id_usuario: roleInfo?.id_usuario,
        // id_dispositivo: roleInfo?.id_dispositivo,
      }
    )
      .then((response) => {
        console.log(response);
        setShowModal(false);
        setShowModal2(true);
        // setEstado(response);
        // setStateTarjeta(response.msg);
        // setStateValRecarga(statevalRecarga);
      })
      .catch((e) => {
        console.log(
          "hubo un problema con la peticion de la recarga al servidor " + e
        );
        setDataCard(e);
        setShowModal3(true);
      });
  };

  return (
    <>
      <h1 className="text-3xl">Recargar tarjeta</h1>
      <h2 className="text-2xl">
        Cupo disponible:{formatMoney.format(quotaInfo?.quota ?? 0)}
      </h2>
      {/* {console.log(estado.msg)} */}
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

        <ButtonBar>
          <Button type="submit">Continuar</Button>
        </ButtonBar>
      </Form>

      {/*Consulta Colcard*/}
      {petConsulta && (
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
          {dataCard?.status == false ? (
            <>
              <h2>{dataCard?.msg?.error?.mensaje}</h2>
            </>
          ) : (
            <>
              <div className="align-content-center">
                <h2>
                  <b>{dataCard?.msg}</b>
                </h2>
                <h2>Saldo: {dataCard?.obj?.results?.Saldos?.saldo}</h2>
                Tarjeta numero {tarjeta}
                <h2>
                  Valor maximo de recarga:
                  {dataCard?.obj?.results?.Saldos?.valorMaximoRecargas}
                </h2>
                <h2>
                  Fecha consulta de saldo:
                  {dataCard?.obj?.results?.Saldos?.fechaDeSaldo}
                </h2>
                <h2>
                  Recargas maximas:
                  {dataCard?.obj?.results?.Saldos?.cantidadDeRecargasMaximas}
                </h2>
                <h2>
                  Codigo de la tarjeta:
                  {dataCard?.obj?.results?.Saldos?.codigoTipoTarjetaTransporte}
                </h2>
                <Input
                  id="valorRecarga"
                  label="Digite el valor a recarga"
                  type="text"
                  name="valorRecarga"
                  required
                  value={valRecarga}
                  onInput={(e) => {
                    if (!isNaN(e.target.value)) {
                      const num = e.target.value;
                      setValRecarga(num);
                    }
                  }}
                ></Input>
                <ButtonBar>
                  <Button
                    type="submit"
                    onClick={() => {
                      habilitarModal();
                    }}
                  >
                    Aceptar
                  </Button>
                </ButtonBar>
              </div>
            </>
          )}
        </div>
      )}

      {/*Limites de la recarga */}
      <Modal
        show={showModal}
        handleClose={() => {
          setShowModal(false);
        }}
      >
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
          {valRecarga < limiteRecarga && valRecarga > 0 ? (
            <>
              <h1 className="text-2xl font-semibold">
                ¿Esta seguro de realizar la recarga?
              </h1>
              <h2 className="text-base">
                {"Se realizará una recarga de " +
                  formatMoney.format(valRecarga) +
                  " COP "}
              </h2>
              <h2>{" A la tarjeta numero " + tarjeta}</h2>
              <ButtonBar>
                <Button
                  type="submit"
                  onClick={() => {
                    habilitarModal2();
                  }}
                >
                  Aceptar
                </Button>
                <Button onClick={() => setShowModal(false)}>Cancelar</Button>
              </ButtonBar>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold">
                {valRecarga <= 0
                  ? "ERROR el valor de la recarga debe ser mayor a cero"
                  : "ERROR El valor de la recarga debe ser menor a " +
                    formatMoney.format(limiteRecarga) +
                    " COP"}
              </h2>

              <ButtonBar>
                <Button onClick={() => setShowModal(false)}>Cancelar</Button>
              </ButtonBar>
            </>
          )}
        </div>
      </Modal>

      {/*peticion de autorizacion y confirmacion */}
      <Modal
        show={showModal2}
        handleClose={() => {
          setShowModal2(false);
        }}
      >
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
          {peticion == true ? (
            <>
              <h1 className="text-2xl font-semibold">
                {/* {dataCard?.status ? dataCard?.msg : dataCard?.msg}*/}
              </h1>
              {dataCard?.status == true ? (
                <>
                  <h1>TRANSACCION EXITOSA</h1>
                  <h2>
                    {" A la tarjeta numero " +
                      tarjeta +
                      " se le realizo una recarga por valor de " +
                      formatMoney.format(valRecarga)}
                    <ButtonBar>
                      <Button
                        type="submit"
                        onClick={() => {
                          // setPeticion(false);
                          setShowModal2(false);
                        }}
                      >
                        Aceptar
                      </Button>
                    </ButtonBar>
                  </h2>
                </>
              ) : (
                <>
                  <h1>{dataCard?.msg?.error?.mensaje}</h1>
                  <ButtonBar>
                    <Button onClick={() => setShowModal2(false)}>
                      Cancelar
                    </Button>
                  </ButtonBar>
                </>
              )}
            </>
          ) : (
            <></>
          )}
        </div>
      </Modal>

      {/* Manejo de errores con el servidor */}
      <Modal
        show={showModal3}
        handleClose={() => {
          setShowModal3(false);
        }}
      >
        <h1>
          {"ERROR, hubo un problema con la peticion al servidor " + dataCard}
        </h1>
      </Modal>
    </>
  );
};

export default RecargarColCard;
