import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import { useState } from "react";
import Card from "../../../components/Base/Card/Card";
import Modal from "../../../components/Base/Modal/Modal";
import LogoPDP from "../../../components/Base/LogoPDP/LogoPDP";
const ConsultaEnrolamiento = () => {
  const [numconsultaProceso, setNumConsultaProceso] = useState("");
  const [respuestaProceso, setRespuestaProceso] = useState("");

  const funConsultaProceso = (e) => {
    e.preventDefault();
    const datos = {
      procesoConvenioGuid: numconsultaProceso,
    };
    fetch(`http://127.0.0.1:5000/consultavalidacion`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(datos),
    })
      .then((res) => res.json())
      .then((respuesta) => setRespuestaProceso(respuesta.obj.data));
    console.log(respuestaProceso);
  };
  return (
    <Form grid={true} onSubmit={(e) => funConsultaProceso(e)}>
      <Input
        label={"Ingrese su Numero de Proceso:"}
        placeholder="Ej:88e68c46-9e5c-459c-99bd-298f51a59xxx"
        onChange={(e) => setNumConsultaProceso(e.target.value)}
      ></Input>
      <ButtonBar className={"lg:col-span-2"} type="">
        <Button type="submit" onClick={(e) => funConsultaProceso(e)}>
          Consultar Proceso
        </Button>
      </ButtonBar>
      {respuestaProceso ? (
        <Modal show>
          <Form grid={true}>
            <LogoPDP></LogoPDP>
            <h2>{`Primer Apellido: ${respuestaProceso.primerApellido}`}</h2>
            <h2>{`Segundo Apellido: ${respuestaProceso.segundoApellido}`}</h2>
            <h2>{`Primer Nombre: ${respuestaProceso.primerNombre}`}</h2>
            <h2>{`Segundo Nombre: ${respuestaProceso.segundoNombre}`}</h2>
            <h2>{`Cedula Ciudadania: ${respuestaProceso.numDoc}`}</h2>
            <h2>{`Correo Electronico: ${respuestaProceso.email}`}</h2>
            <h2>{`Celular: ${respuestaProceso.celular}`}</h2>
            <h2>{`Porcentaje de Validación: ${respuestaProceso.scoreRostroDocumento}%`}</h2>
          </Form>
        </Modal>
      ) : (
        ""
      )}
    </Form>
  );
};

export default ConsultaEnrolamiento;
