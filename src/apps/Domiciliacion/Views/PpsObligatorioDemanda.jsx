import React, { useCallback, useState, useEffect, useMemo } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Fieldset from "../../../components/Base/Fieldset";
import Input from "../../../components/Base/Input";
import LogoPDP from "../../../components/Base/LogoPDP";
import Modal from "../../../components/Base/Modal";
import Select from "../../../components/Base/Select";
import fetchData from "../../../utils/fetchData";
import { notify, notifyError } from "../../../utils/notify";
import { useAuth } from "../../../hooks/AuthHooks";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import Voucher from "../../LoteriaBog/components/Voucher/Voucher";
import { useReactToPrint } from "react-to-print";
import Form from "../../../components/Base/Form";
import Tickets from "../../../components/Base/Tickets";
import MoneyInput from "../../../components/Base/MoneyInput";
import useQuery from "../../../hooks/useQuery";
import classes from "./PpsObligatorioDemanda.module.css";
import SimpleLoading from "../../../components/Base/SimpleLoading";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const { contenedorImagen, contenedorForm, contenedorFieldset } = classes;
const url = process.env.REACT_APP_URL_COLPENSIONES_OBLIGATORIO_DEMANDA;
// const url = "http://127.0.0.1:5000";
const PpsObligatorioDemanda = ({ ced }) => {
  const { quotaInfo, roleInfo, infoTicket, pdpUser } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);
  const [showModalVoucher, setShowModalVoucher] = useState(false);
  const [isPropia, setIsPropia] = useState(false);

  const [limitesMontos] = useState({
    max: 149100,
    min: 5000,
  });
  // const [numDocumento, setNumDocumento] = useState(ced);
  const [datosAportante, setDatosAportante] = useState({
    numDocumento: ced,
    tipoIdentificacion: "",
    numPlanilla: "",
    valorAportar: "",
  });
  // useEffect(() => {
  //   if (roleInfo["tipo_comercio"] === "OFICINAS PROPIAS") {
  //     setIsPropia(true);
  //   } else {
  //     setIsPropia(false);
  //   }
  // }, [roleInfo, isPropia]);

  const [datosComercio, setDatosComercio] = useState({
    idComercio: roleInfo?.["id_comercio"],
    idusuario: roleInfo?.["id_usuario"],
    iddispositivo: roleInfo["id_dispositivo"],
    nombre_usuario: pdpUser?.uname,
    oficina_propia:
      roleInfo["tipo_comercio"] === "OFICINAS PROPIAS" ||
      roleInfo["tipo_comercio"] === "KIOSCO"
        ? true
        : false,

    cupoLogin: quotaInfo?.["quota"],
    tipoComercio: roleInfo?.["tipo_comercio"],
    nombreComercio: roleInfo?.["nombre comercio"],
    idTrx: "",
  });
  const [procesandoTrx, setProcesandoTrx] = useState(false);
  const [disabledBtn, setDisabledBtn] = useState(false);

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    // pageStyle: "@page {size: 80mm 160mm; margin: 0; padding: 0;}",
  });
  const tickets = useMemo(() => {
    return {
      title: ["COLPENSIONES Recibo de pago"],
      // title: [["Recibo De Pago"]],
      // "COLPENSIONES Recibo de pago"],
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
      // commerceName: datosComercio?.["tipoComercio"],
      commerceInfo: [
        ["Id Comercio", roleInfo?.id_comercio],
        ["No. terminal", roleInfo?.id_dispositivo],
        ["Municipio", roleInfo?.ciudad],
        ["", ""],
        ["Dirección", roleInfo?.direccion],
        ["", ""],
      ],

      trxInfo: [
        ["PISO DE PROTECCION SOCIAL - APORTE OBLIGATORIO"],
        ["", ""],
        ["Número de documento", datosAportante?.["numDocumento"]],
        ["", ""],
        ["Número de autorización: ", datosComercio?.["idTrx"]],
        ["", ""],
        ["N° Planilla", datosAportante?.["numPlanilla"]],
        ["", ""],
        ["Valor", formatMoney.format(datosAportante?.["valorAportar"])],
        ["", ""],
      ],

      disclamer:
        "ESTA TRANSACCION NO TIENE COSTO, VERIFIQUE QUE EL VALOR IMPRESO EN EL RECIBO CORREPONDE AL VALOR ENTREGADO POR USTED. EN CASO DE INQUIETUDES O RECLAMOS COMUNIQUESE EN BOGOTA 4870300  - NAL. 018000410777 O EN WWW.COLPENSIONES.GOV.CO",
    };
  }, [
    roleInfo,
    datosAportante?.["valorAportar"],
    datosComercio?.["idTrx"],
    datosComercio?.["tipoComercio"] /* respPinCancel, roleInfo, valor */,
  ]);
  // console.log(roleInfo);
  const enviar = (e) => {
    e.preventDefault();

    // console.log("*********DATOS COMERCIO", datosComercio);
    // console.log("*********role-info", roleInfo["tipo_comercio"]);
    // console.log("*********isPropia", isPropia);

    setDisabledBtn(true);
    setProcesandoTrx(true);
    if (datosComercio?.["cupoLogin"] >= datosAportante?.["valorAportar"]) {
      if (
        datosAportante?.["valorAportar"] >= 5000 &&
        datosAportante?.["valorAportar"] <= 149000
      ) {
        if (datosAportante?.["valorAportar"] % 100 == 0) {
          fetchData(
            `${url}/pps_obligatorio_demada_colpensiones`,
            // `http://127.0.0.1:5000/pps_obligatorio_demada_colpensiones`,
            // `http://127.0.0.1:5000//simulacionColpensiones`,
            "POST",
            {},
            {
              comercio: {
                id_comercio: datosComercio?.["idComercio"],
                id_terminal: datosComercio?.["iddispositivo"],
                id_usuario: datosComercio?.["idusuario"],
              },
              ticket: tickets,
              oficina_propia: datosComercio?.["oficina_propia"],
              valor_total_trx: datosAportante?.["valorAportar"],
              nombre_comercio: datosComercio?.["nombreComercio"],
              nombre_usuario: datosComercio?.["nombre_usuario"],
              obligatorioDemanda: {
                Identificacion: datosAportante?.["numDocumento"],
                PlanillaCode: datosAportante?.["numPlanilla"],
                trazabilityOperatorCode: datosAportante?.["numPlanilla"],
                ValueAmount: datosAportante?.["valorAportar"],
              },
            },
            {},
            true
          )
            .then((respuesta) => {
              // console.log(
              //   "RESPUESTA:",
              //   respuesta?.obj?.datos_recibidos?.["ResponseCode"]
              // );
              // console.log("RESPUESTA", respuesta);
              setProcesandoTrx(false);
              setDatosComercio((old) => {
                return {
                  ...old,
                  idTrx:
                    respuesta?.obj?.datos_recibidos
                      ?.trazabilityFinancialInstitutionCode,
                };
              });
              // console.log("++++++idtrx", datosComercio?.idTrx);

              // nuevo respuesta
              if (respuesta?.msg) {
                if (
                  respuesta?.msg ===
                  "El valor aportado debe ser exacto ej: 5000, debe ser múltiplo de 100"
                ) {
                  notifyError(respuesta?.msg);
                  /* navigate(`/colpensiones`); */
                  setDisabledBtn(false);
                } else if (
                  respuesta?.obj?.datos_recibidos?.["ResponseCode"] == "SUCCESS"
                ) {
                  setShowModalVoucher(true);
                  notify(respuesta?.msg);
                  //  setDatosRespuesta(respuesta?.obj);
                } else {
                  // console.log("mensajeeeee");
                  notifyError(respuesta?.msg);
                  navigate(`/colpensiones`);
                }
              }

              // console.log("DATOS RECIBIDOS:", respuesta?.obj?.datos_recibidos);
              // console.log(
              //   "idtrx:",
              //   respuesta?.obj?.datos_recibidos
              //     ?.trazabilityFinanciialInstitutionCode
              // );

              // console.log("MENSJAE", datosComercio?.["idTrx"]);
              // setDisabledBtn(false);

              // if (
              //   respuesta?.obj?.datos_recibidos?.["ResponseCode"] == "SUCCESS"
              // ) {
              //   notify(
              //     "Transaccion Colpensiones PPS obligatorio demanda Exitosa."
              //   );
              //   setShowModalVoucher(true);
              // }

              // //si la respuesta de colpensiones viene vacia entra a este if
              // if (
              //   Object.entries(respuesta?.obj?.datos_recibidos).length === 0
              // ) {
              //   notifyError(respuesta?.msg);
              // }

              // if (
              //   respuesta?.obj?.datos_recibidos?.["ResponseCode"] == "FAILED"
              // ) {
              //   notifyError(respuesta?.obj?.datos_recibidos?.["messageError"]);
              //   navigate(`/colpensiones`);
              // }

              // ---------------------------------------------
              // if (respuesta.obj["datos_recibidos"].ResponseCode == "SUCCESS") {
              //   notify("Pago Exitoso.");
              //   setShowModalVoucher(true);
              // }
              // if (respuesta.obj["datos_recibidos"].ResponseCode == "FAILED") {
              //   notifyError(respuesta.obj["datos_recibidos"].messageError);
              // }
              // if (respuesta?.obj?.ResponseCode == "FAILED") {
              //   notifyError(respuesta?.obj?.messageError);
              // }
              // if (
              //   respuesta?.msg[0] ==
              //   "Lo Sentimos, Error pago, la planilla no se puede pagar"
              // ) {
              //   notifyError(respuesta?.msg[0]);
              // }
              // if (
              //   respuesta.obj["datos_recibidos"] ==
              //   "Error pago, la planilla no se puede pagar"
              // ) {
              //   notifyError(respuesta.obj["datos_recibidos"]);
              // }

              /* if (respuesta?.msg?.respuesta_colpensiones) {
                notifyError(respuesta?.msg?.respuesta_colpensiones);
                setDisabledBtn(false);
              }
              if (respuesta?.msg) {
                notifyError(respuesta?.msg);
                setDisabledBtn(false);
              } */
            })
            .catch((err) => {
              // console.log(err);
              notifyError("Error al pagar planilla obligatoria a demanda");
              navigate(`/colpensiones`);
            });
        } else {
          notifyError("El Valor Aportado Debe ser Exacto ej: 5000.");
          setProcesandoTrx(false);
          setDisabledBtn(false);
        }
      } else {
        notifyError(
          "El valor aportado ingresado esta fuera del rango de 5.000 y 149.000."
        );
        setProcesandoTrx(false);
        setDisabledBtn(false);
      }
    } else {
      notifyError("No tiene el cupo suficiente para el aporte a colpensiones.");
      navigate(`/colpensiones`);
    }
  };
  useEffect(() => {}, [datosComercio, isPropia]);

  // useEffect(() => {
  //   ,pdpUser(datosComercio?.["idTrx"], 108, tickets)
  //     .then((resTicket) => {
  //       // console.log("RESTICKET:", resTicket);
  //     })
  //     .catch((err) => {
  //       // console.error(err);
  //       notifyError("Error guardando el ticket");
  //     });
  // }, [,pdpUser, tickets]);

  const handleClose = useCallback(() => {
    setShowModal(false);
    navigate(`/colpensiones`);
  }, []);

  return (
    <div>
      {" "}
      <SimpleLoading show={procesandoTrx}></SimpleLoading>
      <Modal show={showModal} handleClose={handleClose}>
        <div className={contenedorImagen}>
          <LogoPDP xsmall></LogoPDP>
        </div>
        <Form grid onSubmit={(e) => enviar(e)}>
          <Fieldset
            // className={contenedorFieldset}
            legend="Piso de Protección Social Obligatorio"
            /* className="lg:col-span-3" */
          >
            <div className={contenedorForm}>
              <Select
                onChange={(event) =>
                  // setTipoIdentificacion(event?.target?.value)
                  setDatosAportante((old) => {
                    return { ...old, tipoIdentificacion: event?.target?.value };
                  })
                }
                id="comissionType"
                label="Tipo Identificación"
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
                label={"N° Documento"}
                placeholder={"Ingrese su Numero Documento"}
                value={datosAportante?.["numDocumento"]}
                minLength="6"
                maxLength="11"
                type={"text"}
                required
                disabled
              ></Input>
              <Input
                id="planilla"
                name="planilla"
                label="N° Planilla: "
                type="tel"
                autoComplete="off"
                minLength="10"
                maxLength="10"
                value={datosAportante?.["numPlanilla"] ?? ""}
                onInput={(e) => {
                  const num2 = parseInt(e.target.value) || "";

                  setDatosAportante((old) => {
                    return { ...old, numPlanilla: num2.toString() };
                  });
                }}
                required
              />
              <MoneyInput
                label={"Valor Aportar"}
                placeholder={"Ingrese Valor Aportar"}
                value={datosAportante?.["valorAportar"]}
                min={limitesMontos?.min}
                max={limitesMontos?.max}
                minLength="6"
                maxLength="9"
                onInput={(e) => {
                  const num = e.target.value.replace(".", "") || "";

                  setDatosAportante((old) => {
                    return { ...old, valorAportar: num.replace("$", "") };
                  });
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
                disabled={disabledBtn}
                onSubmit={(e) => enviar(e)}
              >
                Realizar Aporte
              </Button>
              /*  ) : null */
            }
            <Button onClick={() => setShowModal(false)}>Cancelar</Button>
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

export default PpsObligatorioDemanda;
