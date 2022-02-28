import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import { useCallback, useState } from "react";
import Card from "../../../components/Base/Card/Card";
import Modal from "../../../components/Base/Modal/Modal";
import LogoPDP from "../../../components/Base/LogoPDP/LogoPDP";
import classes from "../../SolicitudEnrolamiento/views/ConsultaEnrolamiento.module.css";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
const ConsultaEnrolamiento = () => {
  const [numconsultaProceso, setNumConsultaProceso] = useState("");
  const [respuestaProceso, setRespuestaProceso] = useState("");
  const [estado, setEstado] = useState(false);
  const [cantNum, setCantNum] = useState("");
  /* const [showModal, setShowModal] = useState(false); */

  const navigate = useNavigate();
  const {
    principalConsulta,
    tituloConsultaInscripcion,
    contenedorNumeroProceso,
    contenedorForm,
    contenedorBotones,
    estadoConsulta,
    contenedorDatos,
    contenedorTitulos,
    tituloDatos,
    contenedorValoresTitulos,
  } = classes;

  const funConsultaProceso = (e) => {
    e.preventDefault();
    setEstado(true);
    if (numconsultaProceso) {
      fetch(
        `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actualizacionestado?numDoc=${numconsultaProceso}`
        /*  `http://127.0.0.1:5000/actualizacionestado?numDoc=${numconsultaProceso}` */
      )
        .then((res) => res.json())
        .then((respuesta) => setRespuestaProceso(respuesta.obj.results))
        .catch(() => {});
    }
  };
  console.log(respuestaProceso);

  const handleReconoser = async () => {
    navigate(`/Solicitud-enrolamiento/reconoserid/${numconsultaProceso}`);
  };
  const handleCorregir = async () => {
    navigate(
      `/Solicitud-enrolamiento/correccionformulario/${numconsultaProceso}`
    );
  };

  const handleContinuarReconoser = async () => {
    console.log(respuestaProceso[0].id_reconocer);
    navigate(
      `/Solicitud-enrolamiento/continuarreconoserid/${respuestaProceso[0].id_reconocer}`
    );
  };
  const handleClose = useCallback(() => {
    setEstado(false);
    setNumConsultaProceso("");
    setRespuestaProceso("");
  }, []);

  useEffect(() => {
    cantidadNumero(numconsultaProceso);
  }, [numconsultaProceso]);
  function cantidadNumero(numero) {
    let contador = 1;
    while (numero >= 1) {
      contador += 1;
      numero = numero / 10;
    }
    setCantNum(contador);
    /* console.log(cantNum); */
  }

  return (
    <div className={principalConsulta}>
      <span className={tituloConsultaInscripcion}>
        Consultar Proceso de Inscripción
      </span>

      <Form onSubmit={(e) => funConsultaProceso(e)}>
        <Input
          label={"Ingrese Numero Proceso:"}
          placeholder="Ej:1030652xxx"
          value={numconsultaProceso}
          minlength="5"
          onChange={(e) => setNumConsultaProceso(e.target.value)}
        ></Input>

        <ButtonBar className={contenedorBotones} type="">
          <Button type="submit" onClick={(e) => funConsultaProceso(e)}>
            Consultar Proceso
          </Button>
        </ButtonBar>

        {
          /* console.log(respuestaProceso.length) &&
        respuestaProceso.length <= 0 && */
          estado && cantNum < 5 ? (
            <Modal show={estado} handleClose={() => handleClose()}>
              <LogoPDP></LogoPDP>

              <h1>
                El número ingresado no se encuentra en proceso de enrolamiento,
                por favor revise si esta bien escrito o realice el proceso de
                inscripción.
              </h1>
            </Modal>
          ) : cantNum >= 5 &&
            respuestaProceso?.length > 0 &&
            respuestaProceso.filter(
              (element) => element["numdoc"] === numconsultaProceso
            )[0]["numdoc"] === numconsultaProceso ? (
            <Modal show={estado} handleClose={() => handleClose()}>
              <div className={contenedorForm}>
                <LogoPDP></LogoPDP>
                <div className={contenedorDatos}>
                  <div className={contenedorTitulos}>
                    <h2 className={tituloDatos}>{`Nombre: `}</h2>
                    <h2 className={tituloDatos}>{`Cedula Ciudadania: `}</h2>
                    <h2 className={tituloDatos}>{`Correo Electronico: `}</h2>
                  </div>
                  <div className={contenedorValoresTitulos}>
                    <h2
                      className={tituloDatos}
                    >{`${respuestaProceso[0]["nombre"]} ${respuestaProceso[0]["apellido"]}`}</h2>
                    <h2
                      className={tituloDatos}
                    >{` ${respuestaProceso[0]["numdoc"]}`}</h2>
                    <h2
                      className={tituloDatos}
                    >{`${respuestaProceso[0]["email"]}`}</h2>
                  </div>
                </div>
                <h2 className={estadoConsulta}>{`Estado del Proceso: ${
                  respuestaProceso[0]["validation_state"] === "101"
                    ? "Señor usuario ha sido aprobado para realizar la prueba biometrica, lo invitamos a darle click en el botón para realizar el proceso."
                    : respuestaProceso[0]["validation_state"] === "102"
                    ? `Proceso Rechazado por el Asesor Comercial por el siguiente motivo, ${respuestaProceso[0]["causal_rechazo"]}`
                    : respuestaProceso[0]["validation_state"] === "201"
                    ? "Señor usuario su en enrolamiento ha Exitoso, gracias por confiar en nosotros."
                    : respuestaProceso[0]["validation_state"] === "202"
                    ? "Proceso Rechazado por Hellen"
                    : "Señor usuario su Proceso se encuentra en Validación de documentos por parte del Asesor Comercial."
                }`}</h2>
                {respuestaProceso[0]["validation_state"] === "102" ? (
                  <ButtonBar className={"lg:col-span-2"} type="">
                    <Button type="submit" onClick={() => handleCorregir()}>
                      Corregir Formulario
                    </Button>
                  </ButtonBar>
                ) : (
                  ""
                )}

                {(respuestaProceso[0].validation_state === "101" &&
                  respuestaProceso[0].id_reconocer === "None") ||
                (respuestaProceso[0].validation_state === "101" &&
                  respuestaProceso[0].id_reconocer === "") ? (
                  <ButtonBar className={"lg:col-span-2"} type="">
                    <Button type="submit" onClick={() => handleReconoser()}>
                      Comenzar ReconoserID
                    </Button>
                  </ButtonBar>
                ) : (respuestaProceso[0].validation_state === "101" &&
                    respuestaProceso[0].id_reconocer !== "None") ||
                  (respuestaProceso[0].validation_state === "101" &&
                    respuestaProceso[0].id_reconocer !== "") ? (
                  <ButtonBar type="">
                    <Button
                      className={contenedorBotones}
                      type="submit"
                      onClick={() => handleContinuarReconoser()}
                    >
                      Continuar Proceso ReconoserID
                    </Button>
                  </ButtonBar>
                ) : (
                  ""
                )}
              </div>
            </Modal>
          ) : /*  respuestaProceso && */
          respuestaProceso.lenth > 1 &&
            respuestaProceso.filter(
              (element) => element["numdoc"] === numconsultaProceso
            )[0]["numdoc"] !== numconsultaProceso ? (
            <Modal show={estado} handleClose={() => handleClose()}>
              <LogoPDP></LogoPDP>
              <h1>
                El número ingresado no se encuentra en proceso de enrolamiento,
                por favor revise si esta bien escrito o realice el proceso de
                inscripción.
              </h1>
            </Modal>
          ) : (
            <Modal show={estado} handleClose={() => handleClose()}>
              <LogoPDP></LogoPDP>
              <h1>
                El número ingresado no se encuentra en proceso de enrolamiento,
                por favor revise si esta bien escrito o realice el proceso de
                inscripción.
              </h1>
            </Modal>
          )
        }
      </Form>
    </div>
  );
};

export default ConsultaEnrolamiento;
