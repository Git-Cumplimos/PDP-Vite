import React, { Fragment, useCallback, useEffect, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Input from "../../../components/Base/Input";
import Form from "../../../components/Base/Form";
import fetchData from "../../../utils/fetchData";
import classes from "./BuscarCedulaPpsDemanda.module.css";
import { notify, notifyError } from "../../../utils/notify";
import TipoPpsADemanda from "./TipoPpsADemanda";
import Modal from "../../../components/Base/Modal";
import LogoPDP from "../../../components/Base/LogoPDP";

const BuscarCedulaPpsADemanda = () => {
  const [datosConsulta, setDatosConsulta] = useState("");
  const [buscarCedula, setBuscarCedula] = useState(null);
  const [invalidCedula, setInvalidCedula] = useState("");
  const [cantNum, setCantNum] = useState(0);
  const [showModal, setShowModal] = useState(true);
  const [estado, setEstado] = useState(false);
  const [message, setMessage] = useState("3");
  const url = `${process.env.REACT_APP_URL_COLPENSIONES}`;

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
    if (cantNum >= 6 && cantNum <= 13) {
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
          notifyError("Error al consultar identificación");
        });
    } else {
      if (cantNum < 6 || cantNum > 13) {
        notifyError("Ingrese un número valido para la consulta.");
      }
    }
  };

  const onCedChange = (e) => {
    const formData = new FormData(e.target.form);
    const cedula = (
      (formData.get("N° Identificación") ?? "").match(/\d/g) ?? []
    ).join("");
    setBuscarCedula(cedula);
  };
  return (
    <div>
      {(datosConsulta?.length >= 0) & estado ? (
        <TipoPpsADemanda numCed={buscarCedula}></TipoPpsADemanda>
      ) : (
        ""
      )}
      <Form grid onSubmit={(e) => BuscarCedula(e)}>
        <Input
          name="N° Identificación"
          label="N° Identificación"
          type="tel"
          autoComplete="off"
          minLength={"5"}
          maxLength={"10"}
          invalid={invalidCedula}
          value={buscarCedula ?? ""}
          onChange={onCedChange}
          required
        />

        <ButtonBar className={"lg:col-span-2"} type="">
          {
            <Button type="submit" /* onClick={(e) => BuscarCedula(e)} */>
              Buscar Cliente
            </Button>
          }
        </ButtonBar>
      </Form>
    </div>
  );
};

export default BuscarCedulaPpsADemanda;
