import React, { Fragment, useCallback, useEffect, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Fieldset from "../../../components/Base/Fieldset";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import LogoPDP from "../../../components/Base/LogoPDP";
import Modal from "../../../components/Base/Modal";
import Select from "../../../components/Base/Select";
import ToggleInput from "../../../components/Base/ToggleInput";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import fetchData from "../../../utils/fetchData";
import { notify, notifyError } from "../../../utils/notify";
import classes from "./ModificarPpsVoluntario.module.css";
import { useNavigate } from "react-router-dom";
import MoneyInput from "../../../components/Base/MoneyInput";

const ModificarPps = () => {
  const [datosConsulta, setDatosConsulta] = useState("");
  const [sinDatosConsulta, setSinDatosConsulta] = useState(false);
  const [buscarCedula, setBuscarCedula] = useState("");
  const [cantNum, setCantNum] = useState(0);
  const [cantNumCel, setCantNumCel] = useState(0);
  const [cantNumVal, setCantNumVal] = useState(0);
  const [showModal, setShowModal] = useState(true);
  const [showModalUsuarioNoEncontrado, setShowModalUsuarioNoEncontrado] =
    useState(true);
  const [estadoUsuarioNoEncontrado, setEstadoUsuarioNoEncontrado] =
    useState(false);
  const url = `${process.env.REACT_APP_URL_COLPENSIONES}`;
  const [estado, setEstado] = useState(false);
  const [valueAmount, setValueAmount] = useState("");
  const [celular, setCelular] = useState("");
  const [identificacion, setIdentificacion] = useState("");
  const [numPagosPdp, setNumPagosPdp] = useState("");
  const [estadoComercio, setEstadoComercio] = useState("");
  const [estadoComercioString, setEstadoComercioString] = useState("");
  const { contenedorLogo, contenedorSubtitle, tituloNotificacion } = classes;
  const navigate = useNavigate();
  //------------------Funcion Para Calcular la Cantidad De Digitos Ingresados---------------------//
  useEffect(() => {
    cantidadNumero(buscarCedula);
  }, [buscarCedula]);
  function cantidadNumero(numero) {
    let contador = 0;
    while (numero >= 1) {
      contador += 1;
      numero = numero / 10;
    }
    setCantNum(contador);
    console.log(cantNum);
  }

  useEffect(() => {
    cantidadNumeroCel(celular);
  }, [celular]);

  function cantidadNumeroCel(numero) {
    let contadorCel = 0;
    while (numero >= 1) {
      contadorCel += 1;
      numero = numero / 10;
    }
    setCantNumCel(contadorCel);
    console.log(cantNumCel);
  }
  useEffect(() => {
    cantidadNumeroVal(valueAmount);
  }, [valueAmount]);

  function cantidadNumeroVal(numero) {
    let contadorVal = 0;
    while (numero >= 1) {
      contadorVal += 1;
      numero = numero / 10;
    }
    setCantNumVal(contadorVal);
    console.log(cantNumVal);
  }

  const handleClose = useCallback(() => {
    setShowModal(false);
    setDatosConsulta(0);
    setBuscarCedula("");
  }, []);
  const handleCloseUsuarioNoEncontrado = useCallback(() => {
    setShowModalUsuarioNoEncontrado(false);
    /*  setDatosConsulta(""); */
    setBuscarCedula("");
  }, []);

  const UsuarioNoEncontradoNotify = useCallback(() => {
    if (setShowModalUsuarioNoEncontrado) {
      notifyError("Usuario No Encontrad");
    }
    /*  setDatosConsulta(""); */
    setBuscarCedula("");
  }, []);

  const BuscarCedula = (e) => {
    setShowModal(true);
    /*    setShowModalUsuarioNoEncontrado(true) */ e.preventDefault();
    if (cantNum >= 7) {
      fetchData(
        `${url}/domicilio`,
        "GET",
        { identificacion: buscarCedula },
        {},
        {},
        {}
      )
        .then((respuesta) => {
          console.log(respuesta?.obj?.results.length);
          if (respuesta?.obj?.results.length > 0) {
            setDatosConsulta(respuesta?.obj?.results);
            setEstado(true);
            valorAportar: setValueAmount(
              respuesta?.obj?.results[0]?.value_amount
            );
            celular: setCelular(respuesta?.obj?.results[0]?.celular);
            identificacion: setIdentificacion(
              respuesta?.obj?.results[0]?.identificacion
            );
            num_pagos: setNumPagosPdp(respuesta?.obj?.results[0]?.num_pago_pdp);
            console.log(respuesta?.obj?.results[0]?.estado);
            if (respuesta?.obj?.results[0]?.estado === "activo") {
              setEstadoComercio(true);
            } else {
              setEstadoComercio(false);
            }
          } else {
            setEstadoUsuarioNoEncontrado(true);
            console.log("entre");
            setSinDatosConsulta(true);
            setShowModalUsuarioNoEncontrado(true);
            notifyError(
              "No se puede realizar la modificación, el número de documento no se encuentra domiciliado"
            );
          }
        })
        .catch((err) => {
          console.log(err);
          notifyError("Error al consultar cédula");
        });
    } else {
      notifyError("Ingrese un número valido para la consulta");
    }
  };
  useEffect(() => {
    if (estadoComercio === true) {
      setEstadoComercioString("activo");
    } else if (estadoComercio === false) {
      setEstadoComercioString("inactivo");
    }
  }, [estadoComercio]);

  const ModificarGuardar = (e) => {
    e.preventDefault();
    if (cantNumCel == 10 /* */) {
      if (valueAmount >= 5000 && valueAmount <= 149000) {
        if (String(celular).charAt(0) === "3") {
          fetchData(
            `${url}/domicilio`,
            "PUT",
            { identificacion: buscarCedula },
            {
              value_amount: valueAmount,
              celular: celular.toString(),
              num_pago_pdp: numPagosPdp,
              estado: estadoComercioString,
            },
            {},
            {}
          )
            .then((respuesta) => {
              console.log(respuesta);
              if (
                respuesta?.msg === "El usuario ha sido modificado exitosamente"
              ) {
                notify("El usuario ha sido modificado exitosamente");
                navigate(`/domiciliacion`);
              } else if (
                respuesta?.msg === "El Valor Aportado Debe ser Exacto ej: 5000"
              ) {
                notifyError("El valor a aportar debe ser múltiplo de 100");
                /* navigate(`/domiciliacion`); */
              } else {
                notifyError("El usuario no ha sido modificado exitosamente");
                navigate(`/domiciliacion`);
              }
            })
            .catch((err) => {
              console.log(err);
              notifyError("Error al modificar");
            });
        } else {
          console.log("no es 3");
          notifyError(
            "Numero invalido, el N° de celular debe comenzar con el número 3."
          );
          /* setDisabledBtn(false); */
        }
      } else {
        notifyError(
          "El valor aportado ingresado esta fuera del rango de 5000 y 149000."
        );
      }
    }
  };
  return (
    <div>
      <Form grid onSubmit={(e) => BuscarCedula(e)}>
        <Input
          label={"N° Identificación"}
          placeholder={"Ingrese N° Identificación"}
          value={buscarCedula}
          minLength="5"
          maxLength="10"
          onInput={(e) => {
            const num = e.target.value || "";
            setBuscarCedula(num);
          }}
          type={"text"}
          required
        ></Input>
        <ButtonBar className={"lg:col-span-2"} type="">
          {
            <Button type="submit" /* onClick={(e) => BuscarCedula(e)} */>
              Buscar Cliente
            </Button>
          }
        </ButtonBar>
      </Form>
      {/*       {estadoUsuarioNoEncontrado && sinDatosConsulta ? (
        <Modal
          show={showModalUsuarioNoEncontrado}
          handleClose={handleCloseUsuarioNoEncontrado}
        >
          <div className={contenedorLogo}>
            <LogoPDP xsmall></LogoPDP>
          </div>
          <span className={tituloNotificacion}>
            No se puede realizar la modificación, el número de documento no se
            encuentra domiciliado.
          </span>
        </Modal>
      ) : (
        ""
      )} */}
      {Array.isArray(datosConsulta) && datosConsulta?.length > 0 ? (
        <Modal show={showModal} handleClose={handleClose}>
          <div className={contenedorLogo}>
            <LogoPDP xsmall></LogoPDP>
          </div>
          <Form onSubmit={(e) => ModificarGuardar(e)}>
            <PaymentSummary
              title="Editar Comercio Domiciliado"
              subtitle={`Tipo De Domiciliación: ${datosConsulta[0]?.tipo_pps}`}
              /* summaryTrx={{
                "Numero De Identificación":
                  datosConsulta[0]?.identificacion ?? "", */
              /* "Tipo De Domiciliación": datosConsulta[0]?.tipo_pps ?? "", */
              /*     "N° Pagos Punto Pago": datosConsulta[0]?.num_pago_pdp ?? "", */
              /*    }} */
            ></PaymentSummary>
            <ul className={contenedorSubtitle}>
              Numero De Identificación: {datosConsulta[0]?.identificacion ?? ""}
            </ul>
            <Fieldset legend="Modificar Domiciliación">
              {/*  <Input
                label={"Valor Aportar"}
                placeholder={"Ingrese Valor Aportar"}
                value={valueAmount}
                minLength="4"
                maxLength="6"
                onInput={(e) => {
                  const num = parseInt(e.target.value) || "";
                  setValueAmount(num);
                }}
                type={"text"}
                required
              ></Input> */}
              <MoneyInput
                label={"Valor Aportar"}
                placeholder={"Ingrese Valor Aportar"}
                value={valueAmount}
                minLength="6"
                maxLength="9"
                onInput={(e) => {
                  const num = e.target.value.replace(".", "") || "";
                  setValueAmount(num.replace("$", ""));
                }}
                type={"text"}
                required
              ></MoneyInput>
              <Input
                id="celular"
                name="celular"
                label="Celular: "
                type="tel"
                autoComplete="off"
                minLength="10"
                maxLength="10"
                value={celular ?? ""}
                onInput={(e) => {
                  const num = parseInt(e.target.value) || "";
                  if (e.target.value.length === 1) {
                    if (e.target.value != 3) {
                      notifyError(
                        "Número inválido, el N° de celular debe comenzar con el número 3."
                      );
                    }
                  }
                  setCelular(num);
                }}
                required
              />

              <div className={contenedorLogo}>
                <Select
                  onChange={(event) => setNumPagosPdp(event?.target?.value)}
                  id="comissionType"
                  label="N° Pagos Incentivo"
                  value={numPagosPdp}
                  options={{
                    0: 0,
                    1: 1,
                    2: 2,
                    3: 3,
                  }}
                ></Select>
                <ToggleInput
                  checked={estadoComercio}
                  onClick={() => setEstadoComercio((old) => !old)}
                  id="estadoComercio"
                  label={"Estado Comercio"}
                  name="estado"
                />
              </div>
            </Fieldset>
            <ButtonBar className={"lg:col-span-2"} type="">
              {<Button type="submit">Modificar y Guardar</Button>}
            </ButtonBar>
          </Form>
        </Modal>
      ) : (
        ""
      )}
    </div>
  );
};

export default ModificarPps;
