import { useCallback, useState, useRef } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Modal from "../../../components/Base/Modal";
import { useAuth } from "../../../hooks/AuthHooks";
import Input from "../../../components/Base/Input";
import Form from "../../../components/Base/Form";
import fetchData from "../../../utils/fetchData";
import { notify, notifyError } from "../../../utils/notify";
import Tickets from "../../../components/Base/Tickets";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

const url = process.env.REACT_APP_URL_COLCARD;

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
  const [botonAceptar, setBotonAceptar] = useState(false);
  const [card, setCard] = useState("");
  const [idRecarga, setIdRecarga] = useState("");
  const [idTransaccion, setIdTransaccion] = useState("");
  /*fecha actual */
  const hoy = new Date();
  const fecha =
    hoy.getDate() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getFullYear();
  /*hora actual */
  const hora = hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getSeconds();
  const [ticket, setTicket] = useState("");

  const objTicket = {
    title: "Recibo de recarga",
    timeInfo: {
      "Fecha de venta": "hjh",
      Hora: "12:22:00",
    },
    commerceInfo: [
      ["Id comercio", 2],
      ["No. terminal", 233],
      ["Municipio", "Bogota"],
      ["Direccion", "Calle 13 # 233 - 2"],
    ],
    commerceName: "ColCard",
    trxInfo: [
      ["Numero Tarjeta", 1123456789],
      ["Valor Recarga", 5000],
    ],
  };

  const objTicketActual = {
    title: "Recibo de recarga",
    timeInfo: {
      "Fecha de venta": fecha,
      Hora: hora,
    },
    commerceInfo: [
      /*id transaccion recarga*/
      /*id_comercio*/
      ["Id comercio", 2],
      /*id_dispositivo*/
      ["No. terminal", 233],
      /*ciudad*/
      ["Municipio", "Bogota"],
      /*direccion*/
      ["Direccion", "Calle 13 # 233 - 2"],
    ],
    commerceName: "ColCard",
    trxInfo: [
      ["Numero Tarjeta", tarjeta],
      ["Valor Recarga", formatMoney.format(valRecarga)],
      ["idRecarga", idRecarga],
      ["", ""],
      ["idTransaccion", idTransaccion],
    ],
    disclamer: "Para quejas o reclamos comuniquese al *num PDP*",
  };

  // /*ENVIAR NUMERO DE TARJETA Y VALOR DE LA RECARGA*/
  const onChange = (e) => {
    e.preventDefault();
    // console.log("m", roleInfo?.id_comercio);
    peticionConsulta();
    setCard(tarjeta);
    // habilitarModal();
  };

  /*Funcion para habilitar el modal*/
  const habilitarModal = () => {
    setShowModal(!showModal);
  };

  function Redirect() {
    let navigate = useNavigate();
    navigate(-1);
    // function handleClick() {
    //   navigate(-1)
    // }
    // return (
    //   <div>
    //     <button onClick={handleClick}>go home</button>
    //   </div>
    // );
  }

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const peticionConsulta = () => {
    console.log(objTicketActual);
    objTicketActual["trxInfo"][2][1] = "esto es prueba";
    console.log(objTicketActual);
    fetchData(
      `${url}/puntoDePagoColCard/consultarTarjetaTranscaribe`,
      "POST",
      {},
      {
        numeroTarjeta: tarjeta,
        id_comercio: 8,
        // id_comercio: roleInfo?.id_comercio,
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
        notifyError("ERROR, hubo un problema con la peticion al servidor ");
      });
  };

  const peticionRecarga = () => {
    fetchData(
      `${url}/puntoDePagoColCard/recargarTarjetaTranscaribe`,
      "POST",
      {},
      {
        numeroTarjeta: tarjeta,
        valorRecarga: parseInt(valRecarga),
        // valorRecarga: "",
        id_comercio: 8,
        id_usuario: 1,
        id_dispositivo: 801,
        Ticket: objTicketActual,
        // id_comercio: roleInfo?.id_comercio,
        // id_usuario: roleInfo?.id_usuario,
        // id_dispositivo: roleInfo?.id_dispositivo,
      }
    )
      .then((response) => {
        console.log(response);
        setIdRecarga(response.obj.idRecarga);
        setIdTransaccion(response.obj.idTransaccion);

        console.log(response.obj.idRecarga);
        console.log(response.obj.idTransaccion);
        setPeticion(true);
        // setShowModal(false);
        // setShowModal2(true);
        // peticionRecarga();
        // setPeticion(true);

        notify(
          "Se realizo una recarga de " +
            formatMoney.format(valRecarga) +
            " COP, a la tarjeta " +
            card
        );

        // setEstado(response);
        // setStateTarjeta(response.msg);
        // setStateValRecarga(statevalRecarga);
      })
      .catch((e) => {
        console.log(
          "hubo un problema con la peticion de la recarga al servidor " + e
        );
        setShowModal(false);
        notifyError("ERROR, hubo un problema con la peticion al servidor ");
      });
  };

  // console.log(objTicketActual);
  return (
    <>
      <h1 className="text-3xl">Recargar tarjeta</h1>
      {/* <h2 className="text-2xl">
        Cupo disponible:{formatMoney.format(quotaInfo?.quota ?? 0)}
      </h2> */}
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
              <h2 className="text-lg pb-2">{dataCard?.msg}</h2>
            </>
          ) : (
            <>
              <div className="align-content-center border-2 p-5 rounded-lg">
                <h1 className="text-xl pb-3">
                  <b>{dataCard?.msg}</b>
                </h1>
                <h2 className="text-xl pb-2">
                  {"Saldo:" +
                    formatMoney.format(dataCard?.obj?.results?.Saldos[0].saldo)}
                </h2>
                <h2 className="text-lg pb-2">Tarjeta numero: {card}</h2>
                <h2 className="text-lg pb-2">
                  Fecha consulta de saldo:
                  {dataCard?.obj?.results?.Saldos[0].fechaDeSaldo}
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
                {parseInt(valRecarga) >= 0 && (
                  <h2 className="text-lg pb-2">
                    {formatMoney.format(valRecarga)}
                  </h2>
                )}
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
          {!peticion ? (
            valRecarga < limiteRecarga && valRecarga > 0 ? (
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
                    disabled={botonAceptar}
                    type="submit"
                    onClick={() => {
                      // setShowModal(false);
                      // habilitarModal2();
                      // setShowModal2(true);;
                      peticionRecarga();
                      setBotonAceptar(true);
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
            )
          ) : (
            ""
          )}
          {peticion && (
            <>
              <Tickets ticket={objTicketActual} refPrint={printDiv}></Tickets>
              <h2>
                <ButtonBar>
                  <Button
                    type="submit"
                    onClick={() => {
                      // setPeticion(false);
                      setShowModal(false);
                      setPeticion(false);
                      setPetConsulta(false);
                      setBotonAceptar(false);
                      setValRecarga("");
                      setIdRecarga("");
                      setIdTransaccion("");
                    }}
                  >
                    Aceptar
                  </Button>
                  <Button onClick={handlePrint}>Imprimir</Button>
                </ButtonBar>
              </h2>
            </>
          )}
        </div>
      </Modal>

      {/*peticion de autorizacion y confirmacion */}
      {/* <Modal
        show={showModal2}
        handleClose={() => {
          setShowModal2(false);
        }}
      >
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
          {peticion && (
            <>
              <Tickets></Tickets>
              <h2>
                <ButtonBar>
                  <Button
                    type="submit"
                    onClick={() => {
                      // setPeticion(false);
                      setShowModal2(false);
                      // peticionRecarga();
                    }}
                  >
                    Aceptar
                  </Button>
                </ButtonBar>
              </h2>
            </>
          )}
        </div>
      </Modal> */}

      {/* Manejo de errores con el servidor */}
      {/* <Modal
        show={showModal3}
        handleClose={() => {
          setShowModal3(false);
        }}
      >
        <h1>
          {"ERROR, hubo un problema con la peticion al servidor " + dataCard}
        </h1>
      </Modal> */}
    </>
  );
};

export default RecargarColCard;
