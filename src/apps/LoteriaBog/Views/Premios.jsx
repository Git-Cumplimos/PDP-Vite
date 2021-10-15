import { useEffect, useState } from "react";
import { useLoteria } from "../utils/LoteriaHooks";

import Select from "../../../components/Base/Select/Select";
import ConsultaPremio from "../components/ConsultaPremio/ConsultaPremio";

const Premios = () => {
  const [operacion, setOperacion] = useState("");
  const [sorteo, setSorteo] = useState("");
  const [billete, setBillete] = useState("");
  const [serie, setSerie] = useState("");
  const [hash, setHash] = useState("");
  const [msgConsulta, setMsgConsulta] = useState("");
  const [msgPago, setMsgPago] = useState("");

  const { isWinner, makePayment } = useLoteria();

  useEffect(() => {
    setMsgConsulta("");
    setMsgPago("");
  }, [operacion]);

  return (
    <>
      <Select
        id="selectSorteo"
        label="Tipo de sorteo"
        options={[
          { value: "", label: "" },
          { value: "consulta", label: "Consulta" },
          { value: "pago", label: "Pago" },
        ]}
        value={operacion}
        onChange={(e) => setOperacion(e.target.value)}
      />
      {operacion !== "" ? (
        <>
          <ConsultaPremio
            operacion={operacion}
            sorteo={sorteo}
            setSorteo={setSorteo}
            billete={billete}
            setBillete={setBillete}
            serie={serie}
            setSerie={setSerie}
            hash={hash}
            setHash={setHash}
            onSubmit={(e) => {
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
                  makePayment(sorteo, billete, serie, hash).then((res) => {
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
            }}
          />
          <h1>{msgConsulta || msgPago || ""}</h1>
        </>
      ) : (
        ""
      )}
    </>
  );
};

export default Premios;
