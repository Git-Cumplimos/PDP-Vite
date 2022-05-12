import React, { Fragment, useCallback, useEffect, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Input from "../../../components/Base/Input";
import fetchData from "../../../utils/fetchData";
import classes from "./BuscarCedulaPpsDemanda.module.css";
import { notify, notifyError } from "../../../utils/notify";
import TipoPpsADemanda from "./TipoPpsADemanda";
import Modal from "../../../components/Base/Modal";
import LogoPDP from "../../../components/Base/LogoPDP";

const BuscarCedulaPpsADemanda = () => {
  const [datosConsulta, setDatosConsulta] = useState("");
  const [buscarCedula, setBuscarCedula] = useState("");
  const [cantNum, setCantNum] = useState(0);
  const [showModal, setShowModal] = useState(true);
  const [estado, setEstado] = useState(false);
  const url = `${process.env.REACT_APP_URL_TRXS_TRX}`;

  //------------------Constantes para Dar Estilos---------------------//
  const {
    contenedorForm,
    contenedorDatos,
    contenedorTitulos,
    tituloDatos,
    contenedorValoresTitulos,
    contendorBoton,
    tituloNotificacion,
    contenedorImagen,
  } = classes;

  //------------------Funcion Para Calcular la Cantidad De Digitos Ingresados---------------------//
  useEffect(() => {
    cantidadNumero(buscarCedula);
  }, [buscarCedula]);
  function cantidadNumero(numero) {
    let contador = 1;
    while (numero >= 1) {
      contador += 1;
      numero = numero / 10;
    }
    setCantNum(contador);
    console.log(cantNum);
  }

  const handleClose = useCallback(() => {
    setShowModal(false);
    setDatosConsulta(0);
    setBuscarCedula("");
  }, []);
  const BuscarCedula = (e) => {
    setShowModal(true);
    e.preventDefault();
    if (cantNum >= 6) {
      fetchData(
        `${url}/domicilio`,
        "GET",
        { identificacion: buscarCedula },
        {},
        {},
        {}
      )
        .then((respuesta) => {
          console.log(respuesta?.obj?.results);
          setDatosConsulta(respuesta?.obj?.results);
          setEstado(true);
          /* if (
            respuesta?.obj?.msg ==
            "Fallo peticion de datos para correo suser: El usuario no existe o se encuentra en estado INACTIVO. Por favor validar e intentar nuevamente !"
          ) {
            notifyError(
              "El usuario no existe o se encuentra en estado INACTIVO"
            );
          } else {
            if (
              respuesta?.msg == "La consulta a Suser del Email a sido exitosa"
            ) {
              notify("Consulta Exitosa");
              setEstadoConsulta(true);
              setShowModal(true);
            }
          } */
        })
        .catch((err) => {
          console.log(err);
          notifyError("Error al Consultar Cedula");
        });
    } else {
      notifyError("Ingrese un Numero Valido para la Consulta");
    }
  };
  return (
    <div>
      {(datosConsulta?.length === 0) & estado ? (
        <TipoPpsADemanda numCed={buscarCedula}></TipoPpsADemanda>
      ) : datosConsulta?.length > 0 ? (
        <Modal show={showModal} handleClose={handleClose}>
          <div className={contenedorImagen}>
            <LogoPDP small></LogoPDP>
          </div>
          <div className={contenedorForm}>
            <div className={contenedorDatos}>
              <div className={contenedorTitulos}>
                <h2 className={tituloDatos}>{`Tipo Pps: `}</h2>
                <h2 className={tituloDatos}>{`Celular: `}</h2>
                <h2 className={tituloDatos}>{`Estado: `}</h2>
              </div>
              <div className={contenedorValoresTitulos}>
                <h2
                  className={tituloDatos}
                >{`${datosConsulta[0]["tipo_pps"]}`}</h2>
                <h2
                  className={tituloDatos}
                >{`${datosConsulta[0]["celular"]}`}</h2>
                <h2
                  className={tituloDatos}
                >{`${datosConsulta[0]["estado"]}`}</h2>
              </div>
              <div className={contenedorTitulos}>
                <h2 className={tituloDatos}>{`Id Usuario: `}</h2>
                <h2 className={tituloDatos}>{`Id Comercio: `}</h2>
                <h2 className={tituloDatos}>{`Id Dispositivo: `}</h2>
              </div>
              <div className={contenedorTitulos}>
                <h2
                  className={tituloDatos}
                >{`${datosConsulta[0]["id_usuario"]}`}</h2>
                <h2
                  className={tituloDatos}
                >{`${datosConsulta[0]["id_comercio"]}`}</h2>
                <h2
                  className={tituloDatos}
                >{` ${datosConsulta[0]["id_dispositivo"]}`}</h2>
              </div>
            </div>
            <span className={tituloNotificacion}>
              No se Puede Realizar El Aporte, El Número de Cédula se Encuentra
              Domiciliado.
            </span>
          </div>
        </Modal>
      ) : (
        <Fragment>
          <Input
            label={"Numero Cédula"}
            placeholder={"Ingrese Numero de Cédula"}
            value={buscarCedula}
            onChange={(e) => setBuscarCedula(e.target.value)}
            type={"number"}
            required
          ></Input>
          <ButtonBar className={"lg:col-span-2"} type="">
            {
              <Button type="submit" onClick={(e) => BuscarCedula(e)}>
                Buscar Cliente
              </Button>
            }
          </ButtonBar>
        </Fragment>
      )}
    </div>
  );
};

export default BuscarCedulaPpsADemanda;
