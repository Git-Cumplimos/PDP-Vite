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
import { notifyError } from "../../../utils/notify";
import classes from "./ModificarPpsVoluntario.module.css";
const ModificarPps = () => {
  const [datosConsulta, setDatosConsulta] = useState("");
  const [buscarCedula, setBuscarCedula] = useState("");
  const [cantNum, setCantNum] = useState(0);
  const [cantNumCel, setCantNumCel] = useState(0);
  const [cantNumVal, setCantNumVal] = useState(0);
  const [showModal, setShowModal] = useState(true);
  const url = `${process.env.REACT_APP_URL_COLPENSIONES}`;
  const [estado, setEstado] = useState(false);
  const [valueAmount, setValueAmount] = useState("");
  const [celular, setCelular] = useState("");
  const [identificacion, setIdentificacion] = useState("");
  const [numPagosPdp, setNumPagosPdp] = useState("");
  const [estadoComercio, setEstadoComercio] = useState("");
  const [estadoComercioString, setEstadoComercioString] = useState("");
  const { contenedorLogo, contenedorSubtitle } = classes;
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
  const BuscarCedula = (e) => {
    setShowModal(true);
    e.preventDefault();
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
          console.log(respuesta?.obj?.results[0]);
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
        })
        .catch((err) => {
          console.log(err);
          notifyError("Error al Consultar Cedula");
        });
    } else {
      notifyError("Ingrese un Numero Valido para la Consulta");
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
        ).then((respuesta) => {
          console.log(respuesta);
        });
      } else {
        notifyError(
          "El Valor Aportado Ingresado Esta Fuera Del Rango De 5000 y 149000."
        );
      }
    }
  };
  return (
    <div>
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

      {Array.isArray(datosConsulta) && datosConsulta?.length > 0 ? (
        <Modal show={showModal} handleClose={handleClose}>
          <div className={contenedorLogo}>
            <LogoPDP small></LogoPDP>
          </div>
          <Form>
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
              <Input
                label={"Valor Aportar"}
                /* placeholder={datosParams[0]["nombre_comercio"]} */
                value={valueAmount /* ?? datosParams[0]["nombre_comercio"] */}
                onChange={(e) => setValueAmount(e.target.value)}
                minLength="1"
                maxLength="6"
                type="number"
                required
              ></Input>
              <Input
                label={"Numero Celular"}
                /* placeholder={datosParams[0]["nombre_comercio"]} */
                value={celular /* ?? datosParams[0]["nombre_comercio"] */}
                onChange={(e) => setCelular(e.target.value)}
                minLength="1"
                maxLength="10"
                type="number"
              ></Input>
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
              {
                <Button type="submit" onClick={(e) => ModificarGuardar(e)}>
                  Modificar y Guardar
                </Button>
              }
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
