import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import { useState } from "react";
import Card from "../../../components/Base/Card/Card";
import Modal from "../../../components/Base/Modal/Modal";
import LogoPDP from "../../../components/Base/LogoPDP/LogoPDP";
import classes from "../../SolicitudEnrolamiento/views/ConsultaEnrolamiento.module.css";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
const ConsultaEnrolamiento = () => {
  const [numconsultaProceso, setNumConsultaProceso] = useState("");
  const [respuestaProceso, setRespuestaProceso] = useState("");

  const navigate = useNavigate();
  const {
    principalConsulta,
    tituloConsultaInscripcion,
    contenedorNumeroProceso,
    contenedorForm,
  } = classes;

  const funConsultaProceso = (e) => {
    e.preventDefault();

    fetch(
      `http://servicios-comercios-pdp-dev.us-east-2.elasticbeanstalk.com/actualizacionestado?numDoc=${numconsultaProceso}`
      /*  `http://127.0.0.1:5000/actualizacionestado?numDoc=${numconsultaProceso}` */
    )
      .then((res) => res.json())
      .then((respuesta) => setRespuestaProceso(respuesta.obj.results));
    /*  .then((respuesta) => console.log(respuesta.obj.results)); */
  };
  console.log(respuestaProceso);

  const handleReconoser = async () => {
    navigate(`/Solicitud-enrolamiento/reconoserid/${numconsultaProceso}`);
  };
  return (
    <div className={principalConsulta}>
      <span className={tituloConsultaInscripcion}>
        Formulario de Inscripción
      </span>
      <Form onSubmit={(e) => funConsultaProceso(e)}>
        <Input
          label={"Ingrese Numero Proceso:"}
          placeholder="Ej:1030652xxx"
          onChange={(e) => setNumConsultaProceso(e.target.value)}
        ></Input>

        <ButtonBar className={"lg:col-span-2"} type="">
          <Button type="submit" onClick={(e) => funConsultaProceso(e)}>
            Consultar Proceso
          </Button>
        </ButtonBar>

        {respuestaProceso ? (
          <Modal show>
            <div className={contenedorForm}>
              <LogoPDP></LogoPDP>
              <h2>{`Nombre: ${respuestaProceso[0]["nombre"]} ${respuestaProceso[0]["apellido"]}`}</h2>
              <h2>{`Cedula Ciudadania: ${respuestaProceso[0]["numdoc"]}`}</h2>
              <h2>{`Correo Electronico: ${respuestaProceso[0]["email"]}`}</h2>
              <h2>{`Estado del Proceso: ${
                respuestaProceso[0]["validation_state"] === "101"
                  ? "Aprobado para Proceso ReconoserID"
                  : "En Proceso de Validadción de Documentos"
              }`}</h2>
              {respuestaProceso[0].validation_state === "101" ? (
                <ButtonBar className={"lg:col-span-2"} type="">
                  <Button type="submit" onClick={() => handleReconoser()}>
                    Comenzar ReconoserID
                  </Button>
                </ButtonBar>
              ) : null}
            </div>
          </Modal>
        ) : (
          ""
        )}
      </Form>
    </div>
  );
};

export default ConsultaEnrolamiento;
