import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import { useCallback, useState } from "react";
import Modal from "../../../components/Base/Modal";
import LogoPDP from "../../../components/Base/LogoPDP/LogoPDP";
import classes from "../../SolicitudEnrolamiento/views/ConsultaEnrolamiento.module.css";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const ConsultaEnrolamiento = () => {
  //------------------Estados Consulta---------------------//
  const [numconsultaProceso, setNumConsultaProceso] = useState("");
  const [respuestaProceso, setRespuestaProceso] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [cantNum, setCantNum] = useState(0);

  const navigate = useNavigate();

  //------------------Constantes para Dar Estilos---------------------//
  const {
    principalConsulta,
    tituloConsultaInscripcion,
    contenedorForm,
    contenedorBotones,
    estadoConsulta,
    contenedorDatos,
    contenedorTitulos,
    tituloDatos,
    contenedorValoresTitulos,
  } = classes;

  //------------------Funcion Para Consultar Proceso---------------------//
  const funConsultaProceso = (e) => {
    e.preventDefault();
    setShowModal(true);
    if (numconsultaProceso) {
      fetch(
        `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actualizacionestado?numDoc=${numconsultaProceso}`
        /*  `http://127.0.0.1:5000/actualizacionestado?numDoc=${numconsultaProceso}` */
      )
        .then((res) => res.json())
        .then((respuesta) => {
          setRespuestaProceso(respuesta.obj.results);
          console.log(respuesta);
        })
        .catch((e) => console.log(e));
    }
  };

  //------------------Funcion Para Dirigir a ReconoserID---------------------//
  const handleReconoser = async () => {
    navigate(
      `/public/solicitud-enrolamiento/reconoserid/${numconsultaProceso}`
    );
  };

  //------------------Funcion Para Dirigir a Correcion Formulario---------------------//
  const handleCorregir = async () => {
    navigate(
      `/public/solicitud-enrolamiento/correccionformulario/${numconsultaProceso}`
    );
  };
  //------------------Funcion Para Dirigir a Continuar Proceso ReconoserID---------------------//
  const handleContinuarReconoser = async () => {
    console.log(respuestaProceso[0].id_reconocer);
    navigate(
      `/public/solicitud-enrolamiento/continuarreconoserid/${respuestaProceso[0].id_reconocer}`
    );
  };

  //------------------Funcion Para Modal---------------------//
  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  //------------------Funcion Para Calcular la Cantidad De Digitos Ingresados---------------------//
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

      <Form /* onSubmit={(e) => funConsultaProceso(e)} */>
        <Input
          label={"Ingrese Numero Proceso:"}
          placeholder="Ej:1030652xxx"
          value={numconsultaProceso}
          type="number"
          minlength="5"
          onChange={(e) => setNumConsultaProceso(e.target.value)}
        ></Input>

        <ButtonBar className={contenedorBotones} type="">
          <Button
            /* type="submit" */ type=""
            onClick={(e) => funConsultaProceso(e)}
          >
            Consultar Proceso
          </Button>
        </ButtonBar>

        {
          /* console.log(respuestaProceso.length) &&
        respuestaProceso.length <= 0 && */
          showModal && cantNum < 5 ? (
            <Modal show={showModal} handleClose={handleClose}>
              <LogoPDP></LogoPDP>

              <h1>
                El número ingresado no se encuentra en proceso de enrolamiento,
                por favor revise si esta bien escrito o realice el proceso de
                inscripción.
              </h1>
            </Modal>
          ) : cantNum >= 5 && respuestaProceso?.length > 0 /* &&
            respuestaProceso?.filter(
              (element) => element["numdoc"] === numconsultaProceso
            )[0]["numdoc"] === numconsultaProceso */ ? (
            <Modal show={showModal} handleClose={handleClose}>
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
                    : respuestaProceso[0]["validation_state"] === "200"
                    ? "Señor usuario su Proceso se encuentra en Validación de Identidad por parte del Asesor de Apertura De Comercios"
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
              {/* <ProgressBar></ProgressBar> */}
            </Modal>
          ) : /*  respuestaProceso && */
          respuestaProceso?.lenth > 1 /* &&
            respuestaProceso.filter(
              (element) => element["numdoc"] === numconsultaProceso
            )[0]["numdoc"] !== numconsultaProceso */ ? (
            /*  (
            <Modal show={showModal} handleClose={handleClose}>
              <LogoPDP></LogoPDP>
              <h1>
                El número ingresado no se encuentra en proceso de enrolamiento,
                por favor revise si esta bien escrito o realice el proceso de
                inscripción.
              </h1>
            </Modal>
          ) */ ""
          ) : (
            <Modal show={showModal} handleClose={handleClose}>
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
