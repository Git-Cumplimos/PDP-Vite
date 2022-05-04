import Input from "../../../components/Base/Input";
import React, { Fragment, useCallback, useState } from "react";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
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
  const url = "http://127.0.0.1:7000";

  //------------------Constantes para Dar Estilos---------------------//
  const {
    contenedorForm,
    contenedorDatos,
    contenedorTitulos,
    tituloDatos,
    contenedorValoresTitulos,
    contendorBoton,
  } = classes;

  const BuscarComercio = (e) => {
    e.preventDefault();
    fetchData(
      `${url}/consultaemail`,
      "POST",
      {},
      {
        email_user: emailComercio,
      },
      {},
      {}
    )
      .then((respuesta) => {
        console.log(respuesta);
        setDatosConsulta(respuesta?.obj?.data_user);
        setEstadoConsulta(true);
        if (
          respuesta?.obj?.Message ==
          "El usuario no existe o se encuentra en estado INACTIVO. Por favor validar e intentar nuevamente !"
        ) {
          notifyError("El usuario no existe o se encuentra en estado INACTIVO");
        } else {
          if (respuesta?.obj?.Message == "Validacion de datos exitosa.") {
            notify("Consulta Exitosa");
            setEstadoConsulta(true);
            setShowModal(true);
          }
        }
      })
      .catch((err) => {
        console.log(err);
        notifyError("Error al Consultar Email");
      });
  };
  const ContinuarDomiciliacion = (e) => {
    e.preventDefault();
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
            <LogoPDP small></LogoPDP>
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
                  >{`${datosConsulta["nombre_comercio"]}`}</h2>
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
            </ButtonBar>
          </Modal>
          {/* {continuarDomiciliacion ? <PpsDomiciliacion></PpsDomiciliacion> : ""} */}
        </Fragment>
      ) : continuarDomiciliacion ? (
        <PpsDomiciliacion datosDomiciliacion={datosConsulta}></PpsDomiciliacion>
      ) : (
        <Fragment>
          <Input
            label={"Email Comercio"}
            placeholder={"Ingrese El Correo Del Comercio"}
            value={emailComercio}
            onChange={(e) => setEmailComercio(e.target.value)}
            type={"email"}
          ></Input>
          <ButtonBar className={"lg:col-span-2"} type="">
            {
              <Button type="submit" onClick={(e) => BuscarComercio(e)}>
                Buscar Comercio
              </Button>
              /*  ) : null */
            }
          </ButtonBar>
        </Fragment>
      )}
    </div>
  );
};

export default BuscarComercioEmail;
