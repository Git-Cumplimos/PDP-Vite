import Input from "../../../components/Base/Input";
import React, { Fragment, useCallback, useState } from "react";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import Form from "../../../components/Base/Form";
import fetchData from "../../../utils/fetchData";
import { notify, notifyError } from "../../../utils/notify";
import LogoPDP from "../../../components/Base/LogoPDP";
import Modal from "../../../components/Base/Modal";
import classes from "./BuscarComercioEmail.module.css";
import PpsDomiciliacion from "./PpsDomiciliacion";

const BuscarComercioEmail = () => {
  const [emailComercio, setEmailComercio] = useState("");
  const [estadoConsulta, setEstadoConsulta] = useState(false);
  const [datosConsulta, setDatosConsulta] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [continuarDomiciliacion, setContinuarDomiciliacion] = useState(false);
  const [emailVerificado, setEmailVerificado] = useState(true);
  const url = `${process.env.REACT_APP_URL_COLPENSIONES}`;

  //------------------Constantes para Dar Estilos---------------------//
  const {
    contenedorForm,
    contenedorDatos,
    contenedorTitulos,
    tituloDatos,
    contenedorValoresTitulos,
    contendorBoton,
    contenedorImagen,
  } = classes;

  const BuscarComercio = (e) => {
    e.preventDefault();
    setShowModal(true);
    if (emailComercio != "") {
      fetchData(
        `${url}/consultaemail`,
        "GET",
        { correo: emailComercio },
        {},
        {},
        {}
      )
        .then((respuesta) => {
          /*   console.log(respuesta); */
          setDatosConsulta(respuesta?.obj);
          setEstadoConsulta(true);
          if (
            respuesta?.obj?.msg ==
            "Fallo peticion de datos para correo suser: El usuario no existe o se encuentra en estado INACTIVO. Por favor validar e intentar nuevamente !"
          ) {
            notifyError(
              "El usuario no existe o se encuentra en estado INACTIVO"
            );
            setEstadoConsulta(false);
          } else {
            if (
              respuesta?.msg == "La consulta a Suser del email a sido exitosa"
            ) {
              notify("Consulta Exitosa");
              setEstadoConsulta(true);
              setShowModal(true);
            }
          }
        })
        .catch((err) => {
          console.log(err);
          notifyError("Error al consultar email");
        });
    } else {
      notifyError("Ingrese un correo para la consulta");
    }
  };
  const ContinuarDomiciliacion = (e) => {
    e.preventDefault();
    /*   console.log("entre continuar"); */
    setShowModal(false);
    setContinuarDomiciliacion(true);
  };

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);
  return (
    <div>
      {estadoConsulta && showModal && datosConsulta ? (
        <Fragment>
          <Modal show={showModal} handleClose={handleClose}>
            <div className={contenedorImagen}>
              <LogoPDP xsmall></LogoPDP>
            </div>
            <div class={contenedorForm}>
              <div class={contenedorDatos}>
                <div class={contenedorTitulos}>
                  <h2 className={tituloDatos}>{`Nombre Comercio: `}</h2>
                  <h2 className={tituloDatos}>{`Tipo de Comercio: `}</h2>
                  <h2 className={tituloDatos}>{`Id Comercio: `}</h2>
                  <h2 className={tituloDatos}>{`Id Dispositivo: `}</h2>
                  <h2 className={tituloDatos}>{`Id Usuario: `}</h2>
                </div>
                <div className={contenedorValoresTitulos}>
                  <h2
                    className={tituloDatos}
                  >{`${datosConsulta["nombre comercio"]}`}</h2>
                  <h2
                    className={tituloDatos}
                  >{`${datosConsulta["tipo_comercio"]}`}</h2>
                  <h2
                    className={tituloDatos}
                  >{` ${datosConsulta["id_comercio"]}`}</h2>
                  <h2
                    className={tituloDatos}
                  >{`${datosConsulta["id_dispositivo"]}`}</h2>
                  <h2
                    className={tituloDatos}
                  >{`${datosConsulta["id_usuario"]}`}</h2>
                </div>
              </div>
            </div>
            <ButtonBar className={"lg:col-span-2"} type="">
              {
                <Button
                  type="submit"
                  onClick={(e) => ContinuarDomiciliacion(e)}
                >
                  Continuar Domiciliación
                </Button>
                /*  ) : null */
              }
              <Button onClick={() => setShowModal(false)}>Cancelar</Button>
            </ButtonBar>
          </Modal>
          {/* {continuarDomiciliacion ? <PpsDomiciliacion></PpsDomiciliacion> : ""} */}
        </Fragment>
      ) : continuarDomiciliacion ? (
        <PpsDomiciliacion datosDomiciliacion={datosConsulta}></PpsDomiciliacion>
      ) : (
        <Form grid onSubmit={(e) => BuscarComercio(e)}>
          <Input
            label={"Email Comercio"}
            placeholder={"Ingrese El Correo Del Comercio"}
            value={emailComercio}
            onChange={(e) => setEmailComercio(e.target.value)}
            type={"email"}
            required
          ></Input>
          <ButtonBar className={"lg:col-span-2"} type="">
            {
              <Button type="submit" /* onClick={(e) => BuscarComercio(e)} */>
                Buscar Comercio
              </Button>
              /*  ) : null */
            }
          </ButtonBar>
        </Form>
      )}
    </div>
  );
};

export default BuscarComercioEmail;
