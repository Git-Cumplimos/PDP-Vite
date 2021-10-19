import { useEffect, useState } from "react";
import { useLoteria } from "../utils/LoteriaHooks";

import Select from "../../../components/Base/Select/Select";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import Input from "../../../components/Base/Input/Input";
import Form from "../../../components/Base/Form/Form";

const Premios = () => {
  const [operacion, setOperacion] = useState("");
  const [sorteo, setSorteo] = useState("");
  const [billete, setBillete] = useState("");
  const [serie, setSerie] = useState("");
  const [phone, setPhone] = useState("");
  const [hash, setHash] = useState("");

  const [msgConsulta, setMsgConsulta] = useState("");
  const [msgPago, setMsgPago] = useState("");

  const { isWinner, makePayment } = useLoteria();

  useEffect(() => {
    setMsgConsulta("");
    setMsgPago("");
  }, [operacion]);

  const onSubmit = (e) => {
    e.preventDefault();
    switch (operacion) {
      case "consulta":
        isWinner(sorteo, billete, serie).then((res) => {
          if ("msg" in res) {
            setMsgConsulta("No ganador");
          } else {
            setMsgConsulta("Ganador");
          }
        });
        break;
      case "pago":
        makePayment(sorteo, billete, serie, phone, hash).then((res) => {
          if ("msg" in res) {
            setMsgPago(res.msg);
          } else {
            setMsgPago(JSON.stringify(res));
          }
        });
        break;

      default:
        break;
    }
  };

  return (
    <>
      <Form onSubmit={onSubmit} grid>
        <Select
          id="selectSorteo"
          label="Tipo de operacion"
          options={[
            { value: "", label: "" },
            { value: "consulta", label: "Consulta" },
            { value: "pago", label: "Pago" },
          ]}
          required={true}
          value={operacion}
          onChange={(e) => setOperacion(e.target.value)}
        />
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
        {operacion === "pago" ? (
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
          </>
        ) : (
          ""
        )}
        <ButtonBar className="col-span-2">
          <Button type="submit">Buscar</Button>
        </ButtonBar>
      </Form>
      <h1>{msgConsulta || msgPago || ""}</h1>
    </>
  );
};

export default Premios;
