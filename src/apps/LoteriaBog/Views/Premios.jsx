import { useState } from "react";
import { useLoteria } from "../utils/LoteriaHooks";

import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import Input from "../../../components/Base/Input/Input";
import Form from "../../../components/Base/Form/Form";
import { toast } from "react-toastify";

const Premios = () => {
  const [sorteo, setSorteo] = useState("");
  const [billete, setBillete] = useState("");
  const [serie, setSerie] = useState("");
  const [phone, setPhone] = useState("");
  const [hash, setHash] = useState("");

  const [winner, setWinner] = useState(false);
  const [isSelf, setIsSelf] = useState(false);

  const [disabledBtns, setDisabledBtns] = useState(false);

  const { isWinner, makePayment } = useLoteria();

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
    toast.error(msg, {
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
        setDisabledBtns(false);
        if ("msg" in res) {
          notify("No ganador");
          setWinner(false);
          setIsSelf(false);
        } else {
          notify("Ganador");
          setWinner(true);
          setIsSelf(true);
        }
      })
      .catch(() => setDisabledBtns(false));
  };

  const onPay = (e) => {
    setDisabledBtns(true);
    e.preventDefault();

    makePayment(sorteo, billete, serie, phone, hash)
      .then((res) => {
        setDisabledBtns(false);
        if ("msg" in res) {
          notifyError(res.msg);
        } else {
          notify(JSON.stringify(res));
        }
      })
      .catch(() => setDisabledBtns(false));
  };

  return (
    <>
      <Form onSubmit={onSubmit} grid>
        <Input
          id="numSorteo"
          label="Numero de sorteo"
          type="text"
          minLength="4"
          maxLength="4"
          autoComplete="false"
          value={sorteo}
          onInput={(e) => {
            const num = parseInt(e.target.value) || "";
            setSorteo(num);
          }}
        />
        <Input
          id="numBillete"
          label="Numero de billete"
          type="text"
          minLength="4"
          maxLength="4"
          autoComplete="false"
          value={billete}
          onInput={(e) => {
            const num = parseInt(e.target.value) || "";
            setBillete(num);
          }}
        />
        <Input
          id="numSerie"
          label="Numero de serie"
          type="text"
          minLength="3"
          maxLength="3"
          autoComplete="false"
          value={serie}
          onInput={(e) => {
            const num = parseInt(e.target.value) || "";
            setSerie(num);
          }}
        />
        <ButtonBar className="col-auto md:col-span-2">
          <Button type="submit" disabled={disabledBtns}>
            Consultar
          </Button>
        </ButtonBar>
      </Form>
      {winner ? (
        <Form onSubmit={onPay} grid>
          <>
            <Input
              id="numCel"
              label="Numero de celular"
              type="text"
              autoComplete="false"
              required={true}
              value={phone}
              onInput={(e) => {
                const num = parseInt(e.target.value) || "";
                setPhone(num);
              }}
            />
            {isSelf ? (
              <Input
                id="codHash"
                label="Codigo de seguridad"
                type="text"
                autoComplete="false"
                required={true}
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
              Confirmar pago
            </Button>
          </ButtonBar>
        </Form>
      ) : (
        ""
      )}
    </>
  );
};

export default Premios;
