import React, { useCallback, useState, useEffect, useMemo } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Fieldset from "../../../components/Base/Fieldset";
import Input from "../../../components/Base/Input";
import LogoPDP from "../../../components/Base/LogoPDP";
import Modal from "../../../components/Base/Modal";
import Select from "../../../components/Base/Select";
import fetchData from "../../../utils/fetchData";
import { notifyError } from "../../../utils/notify";
import { useAuth } from "../../../hooks/AuthHooks";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

import { useReactToPrint } from "react-to-print";
import Form from "../../../components/Base/Form";
import Tickets from "../../../components/Base/Tickets";
import MoneyInput from "../../../components/Base/MoneyInput";
import useQuery from "../../../hooks/useQuery";
import classes from "./PpsVoluntarioDemanda.module.css";
import SimpleLoading from "../../../components/Base/SimpleLoading";
const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const { contenedorImagen, contenedorForm } = classes;

const PpsVoluntarioDemanda = ({ ced, fun, funBorrar }) => {
  const [limitesMontos] = useState({
    max: 149100,
    min: 5000,
  });
  const [tipoIdentificacion, setTipoIdentificacion] = useState("");
  const [numDocumento, setNumDocumento] = useState(ced);
  const [numCelular, setNumCelular] = useState(null);
  const [datosRespuesta, setDatosRespuesta] = useState("");
  const [valorAportar, setValorAportar] = useState(0);
  const [showModal, setShowModal] = useState(true);
  const [showModalVoucher, setShowModalVoucher] = useState(false);
  const { quotaInfo, roleInfo, infoTicket } = useAuth();

  const [invalidCelular, setInvalidCelular] = useState("");

  // console.log(roleInfo);
  const [cupoLogin, setCupoLogin] = useState(quotaInfo?.["quota"]);
  const [idComercio, setIdComercio] = useState(roleInfo?.["id_comercio"]);
  const [idusuario, setIdUsuario] = useState(roleInfo?.["id_usuario"]);
  const [iddispositivo, setIddispositivo] = useState(
    roleInfo["id_dispositivo"]
  );
  const [tipoComercio, setTipoComercio] = useState(roleInfo["tipo_comercio"]);
  const [esPropio, setEsPropio] = useState(false);

  const [procesandoTrx, setProcesandoTrx] = useState(false);

  const [disabledBtn, setDisabledBtn] = useState(false);

  const navigate = useNavigate();

  const [cantNum, setCantNum] = useState(0);

  const url = process.env.REACT_APP_URL_COLPENSIONES;
  // const url = "http://127.0.0.1:2500/";

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    // pageStyle: "@page {size: 80mm 160mm; margin: 0; padding: 0;}",
  });

  const handleClose = useCallback(() => {
    setShowModal(false);
    navigate(`/colpensiones`);
  }, []);
  // const handleClose2 = useCallback(() => {
  //   setShowModal(false);
  // }, []);

  //------------------Funcion Para Calcular la Cantidad De Digitos Ingresados---------------------//
  useEffect(() => {
    cantidadNumero(numCelular);
  }, [numCelular]);

  function cantidadNumero(numero) {
    let contador = 0;
    while (numero >= 1) {
      contador += 1;
      numero = numero / 10;
    }
    setCantNum(contador);
    /*    console.log(cantNum); */
  }

  const tickets = useMemo(() => {
    return {
      title: " COLPENSIONES Recibo de pago",
      timeInfo: {
        "Fecha de pago": Intl.DateTimeFormat("es-CO", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }).format(new Date()),
        Hora: Intl.DateTimeFormat("es-CO", {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
        }).format(new Date()),
      },
      /*  commerceName: tipoComercio, */
      commerceInfo: [
        ["Id Comercio", roleInfo?.id_comercio],
        ["No. terminal", roleInfo?.id_dispositivo],
        ["Municipio", roleInfo?.ciudad],
        ["", ""],
        ["Dirección", roleInfo?.direccion],
        ["", ""],
      ],

      trxInfo: [
        ["PISO DE PROTECCION SOCIAL - APORTE VOLUNTARIO"],
        ["", ""],
        [
          "Número de documento",
          /* "33" */ datosRespuesta?.[1]?.["Identificacion"],
        ],
        ["", ""],
        ["Número de autorización ", datosRespuesta?.[0]?.["inserted_id"]],
        /* ["Proceso", "Aporte Voluntario A Demanda"], */
        ["", ""],
        ["N° Planilla", /* "33" */ datosRespuesta?.[1]?.["planillaCode"]],
        ["", ""],
        ["Valor", formatMoney.format(valorAportar)],
        ["", ""],
      ],

      disclamer:
        "ESTA TRANSACCION NO TIENE COSTO, VERIFIQUE QUE EL VALOR IMPRESO EN EL RECIBO CORREPONDE AL VALOR ENTREGADO POR USTED. EN CASO DE INQUIETUDES O RECLAMOS COMUNIQUESE EN BOGOTA 4870300  - NAL. 018000410777 O EN WWW.COLPENSIONES.GOV.CO",
    };
  }, [roleInfo, valorAportar, datosRespuesta, tipoComercio]);

  useEffect(() => {
    infoTicket(datosRespuesta?.[0]?.["inserted_id"], 57, tickets)
      .then((resTicket) => {
        // console.log(resTicket);
      })
      .catch((err) => {
        console.error(err);
        notifyError("Error guardando el ticket");
      });
  }, [infoTicket, tickets]);

  const enviar = (e) => {
    e.preventDefault();
    setDisabledBtn(true);
    setProcesandoTrx(true);
    /*  setShowModal(false); */
    if (cupoLogin >= valorAportar) {
      if (tipoComercio === "OFICINAS PROPIAS" || tipoComercio === "KIOSCO") {
        console.log("OFICINAS PROPIAS");
        setEsPropio(true);

        if (String(numCelular).charAt(0) === "3") {
          // console.log("es 3");

          if (valorAportar >= 5000 && valorAportar <= 149000) {
            fetchData(
              `${url}/crearplanillademandaofpropias`,
              "POST",
              {},
              {
                TipoId: tipoIdentificacion,
                Identificacion: numDocumento,
                financialInstitutionCode: "96",
                CanalCode: "20",
                OperadorCode: "84",
                trazabilityFinancialInstitutionCode: "1",
                ValueAmount: parseInt(valorAportar),
                Celular: numCelular,
                id_comercio: idComercio,
                id_dispositivo: iddispositivo,
                id_usuario: idusuario,
                /* es_Propio: esPropio, */
              },
              {},
              true
            )
              .then((respuesta) => {
                setProcesandoTrx(false);
                console.log(respuesta);
                if (respuesta?.msg) {
                  if (
                    respuesta?.msg ===
                    "El valor aportado debe ser exacto ej: 5000, debe ser múltiplo de 100"
                  ) {
                    notifyError(respuesta?.msg);
                    setDisabledBtn(false);
                  } else if (
                    respuesta?.msg ===
                    "La transaccion ha sido creada exitosamente"
                  ) {
                    setShowModalVoucher(true);
                    setDatosRespuesta(respuesta?.obj);
                  } else {
                    notifyError(respuesta?.msg);
                    navigate(`/colpensiones`);
                  }
                }
                // OJOOOOOO
                if (respuesta?.msg?.["respuesta_colpensiones"]) {
                  notifyError(respuesta?.msg?.["respuesta_colpensiones"]);
                  navigate(`/colpensiones`);
                }
                if (
                  respuesta?.msg?.["respuesta_colpensiones"] ===
                  "El aportante no existe."
                ) {
                  notifyError("El aportante no existe.");
                  navigate(`/colpensiones`);
                }
                // if (
                //   respuesta?.msg ===
                //   "El Valor Aportado Debe ser Exacto ej: 5000"
                // ) {
                //   notifyError("El valor a aportar debe ser múltiplo de 100");
                //   /* navigate(`/colpensiones`); */
                //   setDisabledBtn(false);
                // }
                // if (
                //   respuesta?.msg === "Lo Sentimos, Falló el Registro Del Cupo"
                // ) {
                //   notifyError("Lo sentimos, falló el registro del cupo");
                //   navigate(`/colpensiones`);
                // }
                if (
                  respuesta?.msg?.["respuesta_colpensiones"] ===
                  "Cotizante no existe."
                ) {
                  notifyError("Cotizante no existe.");
                  navigate(`/colpensiones`);
                }

                if (
                  respuesta?.msg ===
                  "El Valor Aportado Ingresado Esta Fuera Del Rango De 5000 y 149000"
                ) {
                  notifyError(
                    "El valor aportado ingresado esta fuera del rango de 5.000 y 149.000."
                  );
                  /* navigate(`/colpensiones`); */
                  setDisabledBtn(false);
                }
                if (
                  respuesta?.msg?.["RESPUESTA COLPENSIONES"] ===
                  "Lo Sentimos, Falló el Servicio De Colpensiones"
                ) {
                  notifyError("Lo sentimos, falló el servicio de colpensiones");
                  navigate(`/colpensiones`);
                }
                if (
                  respuesta?.msg?.["respuesta_colpensiones"] ===
                  "Transacci\u00f3n recibida fuera del horario."
                ) {
                  notifyError(
                    "Lo sentimos, transacción recibida fuera del horario."
                  );
                  navigate(`/colpensiones`);
                }
                /* if (respuesta?.msg === "Lo Sentimos, Falló el Registro Del Cupo") {
                  notifyError("Lo Sentimos, Falló el Registro Del Cupo");
                  navigate(`/colpensiones`);
                } */
                if (
                  (respuesta?.msg ===
                    "La transaccion ha sido creada exitosamente") &
                  (respuesta?.obj.length > 1)
                ) {
                  setShowModalVoucher(true);
                  setDatosRespuesta(respuesta?.obj);
                }
              })
              .catch((err) => {
                console.log(err);
                // notifyError("Error al pagar planilla voluntaria a demanda");
                notifyError(
                  "Error respuesta PDP: (Falló al consumir el servicio [0010002])"
                );
                navigate(`/colpensiones`);
              });
          } else {
            notifyError(
              "El valor aportado ingresado esta fuera del rango de 5.000 y 149.000."
            );
            setDisabledBtn(false);
          }
        } else {
          // console.log("no es 3");
          notifyError(
            "Numero invalido, el N° de celular debe comenzar con el número 3."
          );
          setProcesandoTrx(false);
          setDisabledBtn(false);
        }
      } else {
        if (cantNum == 10) {
          console.log("*Comercio");
          setEsPropio(true);
          if (String(numCelular).charAt(0) === "3") {
            if (valorAportar >= 5000 && valorAportar <= 149000) {
              fetchData(
                `${url}/crearplanillademandacomercios`,
                "POST",
                {},
                {
                  TipoId: tipoIdentificacion,
                  Identificacion: numDocumento,
                  financialInstitutionCode: "96",
                  CanalCode: "20",
                  OperadorCode: "84",
                  trazabilityFinancialInstitutionCode: "1",
                  ValueAmount: parseInt(valorAportar),
                  Celular: numCelular,
                  id_comercio: idComercio,
                  id_dispositivo: iddispositivo,
                  id_usuario: idusuario,
                  /* es_Propio: esPropio, */
                },
                {},
                true
              )
                .then((respuesta) => {
                  setProcesandoTrx(false);
                  console.log("********", respuesta);
                  if (respuesta?.msg) {
                    if (
                      respuesta?.msg ===
                      "El valor aportado debe ser exacto ej: 5000, debe ser múltiplo de 100"
                    ) {
                      notifyError(respuesta?.msg);
                      /* navigate(`/colpensiones`); */
                      setDisabledBtn(false);
                    } else if (
                      respuesta?.msg ===
                      "La transaccion ha sido creada exitosamente"
                    ) {
                      setShowModalVoucher(true);
                      setDatosRespuesta(respuesta?.obj);
                    } else {
                      console.log("mensajeeeee");
                      notifyError(respuesta?.msg);
                      navigate(`/colpensiones`);
                    }
                  }

                  // OJOOOOOO
                  if (respuesta?.msg?.["respuesta_colpensiones"]) {
                    notifyError(respuesta?.msg?.["respuesta_colpensiones"]);
                    navigate(`/colpensiones`);
                  }
                  // if (
                  //   respuesta?.msg?.["respuesta_colpensiones"] ===
                  //   "El aportante no existe."
                  // ) {
                  //   notifyError("El aportante no existe.");
                  //   navigate(`/colpensiones`);
                  // }
                  // if (
                  //   respuesta?.msg ===
                  //   "El Valor Aportado Debe ser Exacto ej: 5000"
                  // ) {
                  //   notifyError("El valor a aportar debe ser múltiplo de 100");
                  //   /* navigate(`/colpensiones`); */
                  //   setDisabledBtn(false);
                  // }
                  // if (
                  //   respuesta?.msg?.["respuesta_colpensiones"] ===
                  //   "Cotizante no existe."
                  // ) {
                  //   notifyError("Cotizante no existe.");
                  //   navigate(`/colpensiones`);
                  // }

                  // if (
                  //   respuesta?.msg ===
                  //   "El Valor Aportado Ingresado Esta Fuera Del Rango De 5000 y 149000"
                  // ) {
                  //   notifyError(
                  //     "El valor aportado ingresado esta fuera del rango de 5.000 y 149.000."
                  //   );
                  //   /* navigate(`/colpensiones`); */
                  //   setDisabledBtn(false);
                  // }
                  if (
                    (respuesta?.msg ===
                      "La transaccion ha sido creada exitosamente") &
                    (respuesta?.obj.length > 1)
                  ) {
                    setShowModalVoucher(true);
                    setDatosRespuesta(respuesta?.obj);
                  }
                })
                .catch((err) => {
                  console.log(err);
                  notifyError(
                    "Error respuesta PDP: (Falló al consumir el servicio [0010002])"
                  );
                  navigate(`/colpensiones`);
                });
            } else {
              notifyError(
                "El valor aportado ingresado esta fuera del rango de 5.000 y 149.000."
              );
              console.log("valor fuera de rango");
              setDisabledBtn(false);
            }
          } else {
            console.log("no es 3");
            notifyError(
              "Numero invalido, el N° de celular debe comenzar con el número 3."
            );
            setDisabledBtn(false);
            setProcesandoTrx(false);
          }
        } else {
          notifyError("Ingrese un número de célular valido");
          setNumCelular("");
          setDisabledBtn(false);
        }
      }
    } else {
      notifyError("No tiene el cupo suficiente para el aporte a colpensiones.");
      navigate(`/colpensiones`);
    }
  };
  // const onCelChange = (e) => {
  //   const formData = new FormData(e.target.form);
  //   const phone = ((formData.get("celular") ?? "").match(/\d/g) ?? []).join("");
  //   setNumCelular(phone);

  //   if (e.target.value.length == 1) {
  //     if (e.target.value[0] == 3) {
  //       setInvalidCelular("");
  //     } else {
  //       setInvalidCelular("numero invalido");
  //     }
  //   }
  // };
  return (
    <div>
      <SimpleLoading show={procesandoTrx}></SimpleLoading>
      <Modal show={showModal} handleClose={handleClose}>
        <div className={contenedorImagen}>
          <LogoPDP xsmall></LogoPDP>
        </div>
        <Form grid onSubmit={(e) => enviar(e)}>
          <Fieldset
            legend="Piso de Protección Social Voluntario"
            /* className="lg:col-span-3" */
          >
            <div className={contenedorForm}>
              <Select
                onChange={(event) =>
                  setTipoIdentificacion(event?.target?.value)
                }
                id="comissionType"
                label="Tipo Identificación: "
                required
                options={{
                  "": "",
                  "Cédula de Ciudadania": "1",
                  "Cédula de Extranjeria": "2",
                  "Tarjeta de Identidad": "4",
                  "Registro Civil": "5",
                  "Pasaporte ": "6",
                  "Carnét Diplomático": "7",
                  "Salvo conducto permanencia": "8",
                  "Permiso especial permanencia": "9",
                }}
              ></Select>

              <Input
                label={"N° Documento: "}
                placeholder={"Ingrese su Numero Documento"}
                value={numDocumento}
                minLength="6"
                maxLength="11"
                onInput={(e) => {
                  const num = e.target.value || "";
                  setNumDocumento(num.toString());
                }}
                type={"text"}
                required
                disabled
              ></Input>

              <Input
                id="celular"
                name="celular"
                label="N° Celular: "
                type="tel"
                autoComplete="off"
                minLength="10"
                maxLength="10"
                value={numCelular ?? ""}
                onInput={(e) => {
                  const num = parseInt(e.target.value) || "";
                  if (e.target.value.length === 1) {
                    if (e.target.value != 3) {
                      notifyError(
                        "Número inválido, el N° de celular debe comenzar con el número 3."
                      );
                    }
                  }
                  setNumCelular(num);
                }}
                required
              />

              {/*             <Input
              name="celular"
              label="Celular"
              type="tel"
              autoComplete="off"
              minLength={"10"}
              maxLength={"10"}
              invalid={invalidCelular}
              value={numCelular ?? ""}
              onChange={onCelChange}
              required
            /> */}
              <MoneyInput
                label={"Valor Aportar: "}
                placeholder={"Ingrese Valor Aportar"}
                value={valorAportar}
                min={limitesMontos?.min}
                max={limitesMontos?.max}
                minLength="6"
                maxLength="9"
                onInput={(e) => {
                  const num = e.target.value.replace(".", "") || "";
                  setValorAportar(num.replace("$", ""));
                }}
                type={"text"}
                required
              ></MoneyInput>
            </div>
          </Fieldset>
          <ButtonBar className={"lg:col-span-2"} type="">
            {
              <Button
                type="submit"
                disabled={disabledBtn} /* onClick={(e) => enviar(e)} */
              >
                Realizar Aporte
              </Button>
              /*  ) : null */
            }
            <Button
              onClick={() => {
                setShowModal(false);
                /*   hijoAPadre(); */
                fun();
                funBorrar();
              }}
            >
              Cancelar
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
      {showModalVoucher === true ? (
        <Modal show={showModal} handleClose={handleClose}>
          <div className="flex flex-col justify-center items-center">
            <Tickets refPrint={printDiv} ticket={tickets}></Tickets>
            <Button onClick={handlePrint}>Imprimir</Button>
            <Button onClick={() => setShowModal(false)}>Cancelar</Button>
          </div>
        </Modal>
      ) : (
        ""
      )}
    </div>
  );
};

export default PpsVoluntarioDemanda;
