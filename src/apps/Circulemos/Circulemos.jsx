import { useState } from "react";
import Form from "../../components/Base/Form";
import Input from "../../components/Base/Input";
import Button from "../../components/Base/Button";
import ButtonBar from "../../components/Base/ButtonBar";
import { consultarPrefactura } from "./utils/fetchCirculemos";
import Prefactura from "./views/Prefactura";

const Circulemos = () => {
  const [prefactura, setPrefactura] = useState("");
  const [consulta, setConsulta] = useState("");

  const HandleClick = (e) => {
    e.preventDefault();
    const query = {
      numeroPrefactura: prefactura,
      codigoTipoIdentificacion: "",
      numeroIdentificacion: "",
      consultarTodosLosEstados: "true",
      codigoServicioFacturacion: "",
      radicadoSolicitud: "",
      codigoOrganismoTransito: 13001000,
      listadoEstadosPrefactura: [],
      username: "usuario4",
      password: "ithfnc45",
      codigoOrganismo: "13001000",
      origen: "c1",
    };
    consultarPrefactura(query)
      .then((res) => {
        console.log(res);
        setConsulta(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <h1 className="text-3xl mt-6">Consulta radicado</h1>
      <Form>
        <>
          <Input
            id="codigoTipoIdentificacion"
            label="Tipo Identificación"
            type="text"
            minLength="7"
            maxLength="12"
            autoComplete="off"
            value="Valor quemado"
          />
          <Input
            id="numeroIdentificacion"
            label="Numero identificación"
            type="text"
            minLength="7"
            maxLength="12"
            autoComplete="off"
            value="Valor quemado"
          />
          <Input
            id="numeroPrefactura"
            label="Numero prefactura"
            type="text"
            autoComplete="off"
            value={prefactura}
            onChange={(e) => {
              if (!isNaN(e.target.value)) {
                const num = e.target.value;
                setPrefactura(num);
              }
            }}
          />
          <ButtonBar className="col-auto md:col-span-2">
            <Button type="submit" onClick={(e) => HandleClick(e)}>
              Consultar radicado
            </Button>
          </ButtonBar>
        </>
      </Form>
      <Prefactura prefacturaInfo={consulta?.obj} numero={prefactura} />
    </>
  );
};

export default Circulemos;
