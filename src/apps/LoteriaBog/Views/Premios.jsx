import { useState, useCallback, useEffect } from "react";
import { useLoteria } from "../utils/LoteriaHooks";

import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import Input from "../../../components/Base/Input";
import Form from "../../../components/Base/Form";
import { toast } from "react-toastify";
//////////////////////
import Modal from "../../../components/Base/Modal";
import PagarForm from "../components/SendForm/PagarForm";
import PagarFormFisico from "../components/SendForm/PagarFormFisico";
import PagoResp from "../components/SellResp/PagoResp";

import SubPage from "../../../components/Base/SubPage/SubPage";
const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const Premios = ({ route }) => {
  const { label } = route;
  const {
    infoLoto: { pagoresponse, setPagoresponse },
  } = useLoteria();

  const [sorteo, setSorteo] = useState("");
  const [billete, setBillete] = useState("");
  const [serie, setSerie] = useState("");
  const [phone, setPhone] = useState("");
  const [hash, setHash] = useState("");

  const [respagar, setRespagar] = useState("");
  const [tipopago, setTipopago] = useState("");
  const [fracciones_fisi, setFracciones_fisi] = useState("");

  const [winner, setWinner] = useState(false);
  const [isSelf, setIsSelf] = useState(false);
  ///////////////////////////////////////////////////////
  const [showModal, setShowModal] = useState(false);
  const [customer, setCustomer] = useState({
    doc_id: "",
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    direccion: "",
    telefono: "",
    fracciones: "",
  });

  const closeModal = useCallback(() => {
    setShowModal(false);
    setWinner("");
    setPhone("");
    setHash("");
    setFracciones_fisi("");
    setCustomer({
      doc_id: "",
      primer_nombre: "",
      segundo_nombre: "",
      primer_apellido: "",
      segundo_apellido: "",
      direccion: "",
      telefono: "",
      fracciones: "",
    });
  });
  ///////////////////////////////////////////////////////
  const [disabledBtns, setDisabledBtns] = useState(false);

  const { isWinner, makePayment, makePayment2, pagopremio, pagopremiofisico } =
    useLoteria();

  const [fracbill, setFracbill] = useState([]);
  const [selecFrac, setSelecFrac] = useState([]);

  const notify = (msg) => {
    toast.info(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const notifyError = (msg) => {
    toast.warn(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const onSubmit = (e) => {
    setDisabledBtns(true);

    e.preventDefault();
    isWinner(sorteo, billete, serie)
      .then((res) => {
        fracbill.length = 0;
        setDisabledBtns(false);

        if ("msg" in res) {
          notifyError(res.msg);
          setWinner(false);
          setIsSelf(false);
        }
        if (res[0]["Estado"] === false) {
          notifyError("No ganador");
          setWinner(false);
          setIsSelf(false);
        }
        if (res[0]["Estado"] === true) {
          if (res[0]["Tipo"] === 2) {
            notify("Ganador con billete virtual");
            setTipopago(res[0]["Tipo"]);
            setWinner(true);
            setIsSelf(true);
          } else {
            notify("Ganador con billete físico");
            for (var i = 0; i < res[0].cantidad_frac_billete; i++) {
              fracbill.push(i + 1);
            }
            setTipopago(res[0]["Tipo"]);
            setCheckedState(
              new Array(res[0].cantidad_frac_billete).fill(false)
            );
            setWinner(true);
            setIsSelf(false);
          }
        }
      })
      .catch(() => setDisabledBtns(false));
  };

  const onPay1 = (e) => {
    setDisabledBtns(true);
    e.preventDefault();

    makePayment(sorteo, billete, serie, phone, hash)
      .then((res) => {
        setShowModal(true);
        setDisabledBtns(false);
        setRespagar(res);

        if ("msg" in res) {
          notifyError(res.msg);
        } else {
          if (res?.Tipo === 0) {
            notifyError(
              "El valor a pagar supera la capacidad de la oficina " +
                formatMoney.format(res["valor ganado"])
            );
          } else {
          }
        }
      })

      .catch(() => setDisabledBtns(false));
  };

  const onPay2 = (e) => {
    setDisabledBtns(true);
    e.preventDefault();

    makePayment2(sorteo, billete, serie, selecFrac)
      .then((res) => {
        setShowModal(true);
        setDisabledBtns(false);
        setRespagar(res);

        if ("msg" in res) {
          notifyError(res.msg);
        } else {
          if (res?.Tipo === 0) {
            notifyError(
              "El valor a pagar supera la capacidad de la oficina: " +
                formatMoney.format(res["valor ganado"])
            );
          } else {
          }
        }
      })

      .catch(() => setDisabledBtns(false));
  };

  const [checkedState, setCheckedState] = useState();

  const handleOnChange = (position) => {
    selecFrac.length = 0;
    const updatedCheckedState = checkedState.map((item, frac) =>
      frac === position ? !item : item
    );

    setCheckedState(updatedCheckedState);

    for (var i = 0; i < fracbill.length; i++) {
      if (updatedCheckedState[i] === true) {
        selecFrac.push(fracbill[i]);
      }
    }
  };
  useEffect(() => {
    if (pagoresponse != null && "msg" in pagoresponse) {
      notifyError(pagoresponse.msg);
    }
  }, [pagoresponse]);
  return (
    <>
      <Form onSubmit={onSubmit} grid>
        <Input
          id="numSorteo"
          label="Numero de sorteo"
          type="text"
          minLength="1"
          maxLength="4"
          required
          autoComplete="off"
          value={sorteo}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setSorteo(num);
            }
          }}
        />
        <Input
          id="numBillete"
          label="Numero de billete"
          type="text"
          minLength="4" /*Verificar para que se puedan poner ceros a la izquierda*/
          maxLength="4"
          required
          autoComplete="off"
          value={billete}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setBillete(num);
            }
          }}
        />
        <Input
          id="numSerie"
          label="Numero de serie"
          type="text"
          minLength="3" /*Verificar para que se puedan poner ceros a la izquierda*/
          maxLength="3"
          required
          autoComplete="off"
          value={serie}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setSerie(num);
            }
          }}
        />
        <ButtonBar className="lg:col-span-2">
          <Button type="submit" disabled={disabledBtns}>
            Consultar
          </Button>
        </ButtonBar>
      </Form>
      {winner ? (
        <>
          {tipopago === 2 ? (
            <Form onSubmit={onPay1} grid>
              <>
                <Input
                  id="numCel"
                  label="Numero de celular"
                  type="text"
                  autoComplete="off"
                  required
                  value={phone}
                  onInput={(e) => {
                    if (!isNaN(e.target.value)) {
                      const num = e.target.value;
                      setPhone(num);
                    }
                  }}
                />
                {isSelf ? (
                  <Input
                    id="codHash"
                    label="Codigo de seguridad"
                    type="text"
                    autoComplete="off"
                    required
                    value={hash}
                    onInput={(e) => {
                      setHash(e.target.value);
                    }}
                  />
                ) : (
                  ""
                )}
              </>
              <ButtonBar className="col-auto md:col-span-2">
                <Button type="submit" disabled={disabledBtns}>
                  Pagar
                </Button>
              </ButtonBar>
            </Form>
          ) : (
            <Form onSubmit={onPay2} grid>
              {/* <h2>Este numero no fue vendido por Punto de pago, solicite el billete</h2> */}

              {fracbill.map((frac, index) => {
                return (
                  <Input
                    id={frac}
                    label={`Fracción ${frac}:`}
                    type="checkbox"
                    value={frac}
                    checked={checkedState[index]}
                    onChange={() => handleOnChange(index)}
                  />
                );
              })}

              {selecFrac.length >= 1 ? (
                <ButtonBar className="col-auto md:col-span-2">
                  <Button type="submit" disabled={disabledBtns}>
                    Pagar
                  </Button>
                </ButtonBar>
              ) : (
                ""
              )}
            </Form>
          )}
        </>
      ) : (
        ""
      )}

      {respagar["msg"] === undefined && respagar?.Tipo != 0 ? (
        <>
          <Modal
            show={showModal}
            num_tele={phone}
            handleClose={() => closeModal()}
          >
            {pagoresponse === null || "msg" in pagoresponse ? (
              <>
                {tipopago === 2 ? (
                  <PagarForm
                    selected={respagar}
                    customer={customer}
                    setCustomer={setCustomer}
                    closeModal={closeModal}
                    handleSubmit={() => {
                      pagopremio(
                        sorteo,
                        billete,
                        serie,
                        hash,
                        customer,
                        respagar,
                        phone
                      );
                      setSorteo("");
                      setBillete("");
                      setSerie("");
                      setPhone("");
                      setHash("");
                      setWinner("");
                    }}
                  />
                ) : (
                  <PagarFormFisico
                    selected={respagar}
                    canFrac={fracciones_fisi}
                    customer={customer}
                    setCustomer={setCustomer}
                    closeModal={closeModal}
                    handleSubmit={() => {
                      pagopremiofisico(
                        sorteo,
                        billete,
                        serie,
                        customer,
                        respagar,
                        selecFrac
                      );
                      setSorteo("");
                      setBillete("");
                      setSerie("");
                      setPhone("");
                      setHash("");
                      setWinner("");
                      setFracciones_fisi("");
                    }}
                  />
                )}
              </>
            ) : (
              <PagoResp
                pagoresponse={pagoresponse}
                setPagoresponse={setPagoresponse}
                closeModal={closeModal}
                setCustomer={setCustomer}
              />
            )}
          </Modal>
        </>
      ) : (
        ""
      )}
    </>
  );
};

export default Premios;
