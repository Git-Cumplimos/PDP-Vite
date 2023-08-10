import { Fragment, useCallback, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import Modal from "../../../../../components/Base/Modal";
import MoneyInputDec, {
  formatMoney,
} from "../../../../../components/Base/MoneyInputDec";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import TextArea from "../../../../../components/Base/TextArea";
import { useAuth } from "../../../../../hooks/AuthHooks";
import useMoney from "../../../../../hooks/useMoney";
import { makeMoneyFormatter } from "../../../../../utils/functions";
import { notify, notifyError } from "../../../../../utils/notify";
import TicketsDavivienda from "../../components/TicketsDavivienda";
import {
  postCheckReintentoRecaudoConveniosDavivienda,
  postConsultaCodigoBarrasConveniosEspecifico,
  postConsultaConveniosDavivienda,
  postRecaudoConveniosDavivienda,
} from "../../utils/fetchRecaudoServiciosPublicosPrivados";
import { enumParametrosDavivienda } from "../../utils/enumParametrosDavivienda";
import MoneyInput from "../../../../../components/Base/MoneyInput/MoneyInput";

const valor_maximo_recaudo = 9900000;

const RecaudoServiciosPublicosPrivadosLecturaCodigoBarras = () => {
  const { roleInfo, pdpUser } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [peticion, setPeticion] = useState(0);
  const formatMoney = makeMoneyFormatter(2);
  const dataConveniosPagar = ["3", "0"];
  const [objTicketActual, setObjTicketActual] = useState({
    title: "Recibo de Pago de Recaudo de Facturas",
    timeInfo: {
      "Fecha de venta": "",
      Hora: "",
    },
    commerceInfo: [
      /*id transaccion recarga*/
      /*id_comercio*/
      ["Id comercio", roleInfo?.id_comercio ? roleInfo?.id_comercio : 0],
      /*id_dispositivo*/
      ["No. terminal", roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 0],
      /*ciudad*/
      ["Municipio", roleInfo?.ciudad ? roleInfo?.ciudad : "Sin datos"],
      /*direccion*/
      ["Dirección", roleInfo?.direccion ? roleInfo?.direccion : "Sin datos"],
      ["Tipo de operación", "Recaudo de facturas"],
      ["", ""],
    ],
    commerceName: roleInfo?.["nombre comercio"]
      ? roleInfo?.["nombre comercio"]
      : "Sin datos",
    trxInfo: [],
    disclamer: "Línea de atención personalizada: #688\nMensaje de texto: 85888",
  });
  const [datosTrans, setDatosTrans] = useState({
    codBarras: "",
  });
  const [datosEnvio, setDatosEnvio] = useState({
    datosCodigoBarras: {},
    datosConvenio: {},
    estadoConsulta: false,
    estadoFecha: false,
  });
  const [datosTransaccion, setDatosTransaccion] = useState({
    ref1: "",
    ref2: "",
    valor: "",
    showValor: "",
    showValor2: "",
    valorSinModificar: "",
    valorSinModificar2: "",
    data: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  const onChangeFormat = useCallback(
    (ev) => {
      const valor = ev.target.value;
      if (valor.length > datosTrans.codBarras.length) {
        setDatosTrans((old) => {
          return { ...old, [ev.target.name]: valor };
        });
      }
    },
    [datosTrans]
  );
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const fetchTablaConveniosEspecificoFunc = useCallback((codigoBar) => {
    postConsultaCodigoBarrasConveniosEspecifico({
      codigoBarras: codigoBar,
    })
      .then((autoArr) => {
        if (autoArr?.status) {
          notify(autoArr?.msg);
          let dateStatus = false;
          if (
            datosEnvio?.datosCodigoBarras?.fechaCaducidad?.length &&
            datosEnvio?.datosCodigoBarras?.fechaCaducidad?.length > 0 &&
            datosEnvio?.datosConvenio[0]?.val_fecha_lim_cnb === "1"
          ) {
            const dateVenc = new Date(
              datosEnvio?.datosCodigoBarras?.fechaCaducidad[0]
            );
            dateVenc.setHours(dateVenc.getHours() + 5);
            const dateActual = new Date();
            if (dateActual.getTime() > dateVenc.getTime()) {
              dateStatus = true;
              notifyError("Se ha vencido el pago");
            }
          }
          setDatosEnvio({
            datosCodigoBarras: autoArr?.obj.datosCodigoBarras,
            datosConvenio: autoArr?.obj.datosConvenio[0],
            estadoConsulta: true,
            estadoFecha: dateStatus,
          });
          let valorTrx = autoArr?.obj.datosCodigoBarras.pago[0] ?? 0;
          setDatosTransaccion((old) => {
            return {
              ...old,
              ref1: autoArr?.obj.datosCodigoBarras.codigosReferencia[0] ?? "",
              ref2: autoArr?.obj.datosCodigoBarras.codigosReferencia[1] ?? "",
              showValor: formatMoney.format(valorTrx) ?? "",
              valor: valorTrx ?? "",
              valorSinModificar: valorTrx ?? "",
            };
          });
        } else {
          notifyError(autoArr?.msg);
          setDatosTrans((old) => ({ codBarras: "" }));
        }
        setIsUploading(false);
      })
      .catch((err) => {
        setIsUploading(false);
        notifyError("No se ha podido conectar al servidor");
        console.error(err);
        setDatosTrans((old) => ({ codBarras: "" }));
      });
  }, []);
  const onSubmit = (e) => {
    e.preventDefault();
    if (datosTrans?.codBarras.includes("415")) {
      // }
      // if (datosTrans?.codBarras.slice(0, 3) === "]C1") {
      setIsUploading(true);
      fetchTablaConveniosEspecificoFunc(datosTrans?.codBarras);
    } else {
      notifyError("El código de barras no tiene el formato correcto");
    }
  };
  const habilitarModal = () => {
    setShowModal(true);
  };

  const hideModal = () => {
    setPeticion(0);
    setShowModal(false);
  };
  const hideModalReset = () => {
    setDatosEnvio({
      datosCodigoBarras: {},
      datosConvenio: {},
      estadoConsulta: false,
      estadoFecha: false,
    });
    setDatosTrans({ codBarras: "" });
    setDatosTransaccion({
      ref1: "",
      ref2: "",
      valor: "",
      showValor: "",
      valorSinModificar: "",
      data: "",
    });
    setShowModal(false);
    setPeticion(0);
    setObjTicketActual((old) => {
      return {
        ...old,
        commerceInfo: [
          /*id transaccion recarga*/
          /*id_comercio*/
          ["Id comercio", roleInfo?.id_comercio ? roleInfo?.id_comercio : ""],
          /*id_dispositivo*/
          [
            "No. terminal",
            roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : "",
          ],
          /*ciudad*/
          ["Municipio", roleInfo?.ciudad ? roleInfo?.ciudad : ""],
          /*direccion*/
          ["Dirección", roleInfo?.direccion ? roleInfo?.direccion : ""],
          ["Tipo de operación", "Recaudo de facturas"],
          ["", ""],
        ],
        trxInfo: [],
      };
    });
  };
  const onSubmitConfirm = (e) => {
    e.preventDefault();

    if (
      dataConveniosPagar.includes(
        datosEnvio?.datosConvenio?.num_ind_consulta_cnb
      )
    ) {
      if (datosEnvio?.datosConvenio?.ind_valor_exacto_cnb === "0") {
        if (
          datosEnvio?.datosConvenio?.ind_mayor_vlr_cnb === "0" &&
          datosTransaccion.valor > datosTransaccion.valorSinModificar
        )
          return notifyError("No esta permitido el pago mayor al original");
        if (
          datosEnvio?.datosConvenio?.ind_menor_vlr_cnb === "0" &&
          datosTransaccion.valor < datosTransaccion.valorSinModificar
        ) {
          if (
            !(
              datosEnvio?.datosConvenio?.ind_valor_ceros_cnb === "1" &&
              datosTransaccion.valor === 0
            )
          ) {
            return notifyError("No esta permitido el pago menor al original");
          }
        }
        if (
          datosEnvio?.datosConvenio?.ind_valor_ceros_cnb === "0" &&
          datosTransaccion.valor === 0
        ) {
          return notifyError("No esta permitido el pago en ceros");
        }
      }
      setPeticion(1);
    } else {
      onSubmitPago(e);
      setPeticion(2);
    }
    habilitarModal();
  };
  const onSubmitPago = (e) => {
    e.preventDefault();
    if (
      dataConveniosPagar.includes(
        datosEnvio?.datosConvenio?.num_ind_consulta_cnb
      ) ||
      peticion === 2
    ) {
      let valorTransaccion = 0;
      if (peticion === 2) {
        // if (typeof datosTransaccion.valor == "string") {
        //   valorTransaccion = datosTransaccion.valor.replace(/[$ .]/g, "");
        //   valorTransaccion = parseInt(valorTransaccion);
        // } else {
        //   valorTransaccion = datosTransaccion.valor;
        // }
        if (datosEnvio?.datosConvenio?.ind_valor_exacto_cnb === "0") {
          if (
            datosEnvio?.datosConvenio?.ind_mayor_vlr_cnb === "0" &&
            datosTransaccion.valor > datosTransaccion.valorSinModificar
          )
            return notifyError("No esta permitido el pago mayor al original");
          if (
            datosEnvio?.datosConvenio?.ind_menor_vlr_cnb === "0" &&
            datosTransaccion.valor < datosTransaccion.valorSinModificar
          ) {
            if (
              !(
                datosEnvio?.datosConvenio?.ind_valor_ceros_cnb === "1" &&
                datosTransaccion.valor === 0
              )
            ) {
              return notifyError("No esta permitido el pago menor al original");
            }
          }
          if (
            datosEnvio?.datosConvenio?.ind_valor_ceros_cnb === "0" &&
            datosTransaccion.valor === 0
          ) {
            return notifyError("No esta permitido el pago en ceros");
          }
        }
        valorTransaccion = datosTransaccion.valor ?? 0;
      } else {
        valorTransaccion = datosTransaccion.valor ?? 0;
      }
      if (valorTransaccion > valor_maximo_recaudo) {
        return notifyError(
          `El valor de transacción es superior al valor máximo permitido ${formatMoney.format(
            valor_maximo_recaudo
          )}`
        );
      }
      const hoy = new Date();
      const fecha = Intl.DateTimeFormat("es-CO", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
      /*hora actual */
      const hora = Intl.DateTimeFormat("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date());
      const objTicket = { ...objTicketActual };
      objTicket["timeInfo"]["Fecha de venta"] = fecha;
      objTicket["timeInfo"]["Hora"] = hora;
      objTicket["trxInfo"].push([
        "Convenio",
        datosEnvio?.datosConvenio?.nom_convenio_cnb,
      ]);
      objTicket["trxInfo"].push(["", ""]);
      objTicket["trxInfo"].push([
        "Código convenio",
        datosEnvio?.datosConvenio?.cod_convenio_cnb,
      ]);
      objTicket["trxInfo"].push(["", ""]);
      objTicket["trxInfo"].push([
        "Referencia 1",
        datosEnvio.datosCodigoBarras.codigosReferencia[0] ?? "",
      ]);
      objTicket["trxInfo"].push(["", ""]);
      objTicket["trxInfo"].push([
        "Referencia 2",
        datosEnvio.datosCodigoBarras.codigosReferencia[1] ?? "",
      ]);
      objTicket["trxInfo"].push(["", ""]);
      setIsUploading(true);
      postRecaudoConveniosDavivienda({
        valTipoConsultaConvenio: "1",
        numConvenio: datosEnvio?.datosConvenio?.cod_convenio_cnb,

        // numTipoProductoRecaudo: datosEnvio?.datosConvenio?.tipo_cta_recaudo_cnb,
        // numProductoRecaudo: datosEnvio?.datosConvenio?.nro_cta_recaudo_cnb,
        // valTipoProdDestinoRecaudoCent:
        //   datosEnvio?.datosConvenio?.tipo_cta_destino_cnb,
        // valProdDestinoRecaudoCent:
        //   datosEnvio?.datosConvenio?.nro_cta_destino_cnb,
        numTipoProductoRecaudo: datosEnvio?.datosConvenio?.tipo_cta_destino_cnb,
        numProductoRecaudo: datosEnvio?.datosConvenio?.nro_cta_destino_cnb,
        valTipoProdDestinoRecaudoCent:
          datosEnvio?.datosConvenio?.tipo_cta_recaudo_cnb,
        valProdDestinoRecaudoCent:
          datosEnvio?.datosConvenio?.nro_cta_recaudo_cnb,

        valCodigoIAC: datosEnvio?.datosConvenio?.cod_iac_cnb,
        valor: valorTransaccion,
        valReferencia1: datosEnvio.datosCodigoBarras.codigosReferencia[0] ?? "",
        valReferencia2: datosEnvio.datosCodigoBarras.codigosReferencia[1] ?? "",
        nomConvenio: datosEnvio?.datosConvenio?.nom_convenio_cnb,
        ticket: objTicket,
        fecCodigDeBarras:
          datosEnvio?.datosCodigoBarras?.fechaCaducidad[0] ?? "",
        valCodigoDeBarras: valorTransaccion,
        // valCodigoDeBarras: datosTrans.codBarras.slice(3).replace(/[\x1D]/g, ""),

        nombre_usuario: pdpUser?.uname ?? "",
        idComercio: roleInfo?.id_comercio,
        idUsuario: roleInfo?.id_usuario,
        idTerminal: roleInfo?.id_dispositivo,
        issuerIdDane: roleInfo?.codigo_dane,
        nombreComercio: roleInfo?.["nombre comercio"],
        municipio: roleInfo?.["ciudad"],
        oficinaPropia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        direccion: roleInfo?.direccion,
      })
        .then(async (res) => {
          if (res?.status) {
            setIsUploading(false);
            notify(res?.msg);
            objTicket["commerceInfo"][1] = [
              "No. terminal",
              res?.obj?.codigoTotal,
            ];
            objTicket["commerceInfo"].push([
              "No. de aprobación Banco",
              res?.obj?.respuestaDavivienda?.valTalonOut,
            ]);
            objTicket["commerceInfo"].push(["", ""]);
            objTicket["trxInfo"].push([
              "Valor",
              formatMoney.format(res?.obj?.valor),
            ]);
            objTicket["trxInfo"].push(["", ""]);
            objTicket["trxInfo"].push([
              "Costo transacción",
              formatMoney.format(0),
            ]);
            objTicket["trxInfo"].push(["", ""]);
            objTicket["trxInfo"].push([
              "Total",
              formatMoney.format(res?.obj?.valor),
            ]);
            objTicket["trxInfo"].push(["", ""]);
            setObjTicketActual(objTicket);
            setPeticion(4);
          } else {
            // notifyError(res?.msg ?? res?.message ?? "");
            if (res?.message === "Endpoint request timed out") {
              const formatDate = Intl.DateTimeFormat("es-CO", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }).format(hoy);
              const formatDateTimeIni = Intl.DateTimeFormat("es-CO", {
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hour12: false,
              }).format(hoy);
              const newDate = new Date(hoy.getTime() + 2 * 60000);
              const formatDateTimeFin = Intl.DateTimeFormat("es-CO", {
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hour12: false,
              }).format(newDate);
              for (let i = 0; i < 5; i++) {
                try {
                  const prom = await new Promise((resolve, reject) =>
                    setTimeout(() => {
                      postCheckReintentoRecaudoConveniosDavivienda({
                        dateIni: `${formatDate} ${formatDateTimeIni}`,
                        dateEnd: `${formatDate} ${formatDateTimeFin}`,

                        idComercio: roleInfo?.id_comercio,
                        idUsuario: roleInfo?.id_usuario,
                        idTerminal: roleInfo?.id_dispositivo,
                        issuerIdDane: roleInfo?.codigo_dane,
                        nombreComercio: roleInfo?.["nombre comercio"],
                        municipio: roleInfo?.["ciudad"],
                        oficinaPropia:
                          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
                          roleInfo?.tipo_comercio === "KIOSCO"
                            ? true
                            : false,
                        direccion: roleInfo?.direccion,
                      })
                        .then((res) => {
                          if (
                            res?.msg !==
                            "Error respuesta PDP: (No ha terminado la operación)"
                          ) {
                            if (res?.status) {
                              setIsUploading(false);
                              notify(res?.msg);
                              objTicket["commerceInfo"][1] = [
                                "No. terminal",
                                res?.obj?.codigoTotal,
                              ];
                              objTicket["commerceInfo"].push([
                                "No. de aprobación Banco",
                                res?.obj?.respuestaDavivienda?.valTalonOut ??
                                  res?.obj?.idTrx,
                              ]);
                              objTicket["commerceInfo"].push(["", ""]);
                              objTicket["trxInfo"].push([
                                "Valor",
                                formatMoney.format(res?.obj?.valor),
                              ]);
                              objTicket["trxInfo"].push(["", ""]);
                              objTicket["trxInfo"].push([
                                "Costo transacción",
                                formatMoney.format(0),
                              ]);
                              objTicket["trxInfo"].push(["", ""]);
                              objTicket["trxInfo"].push([
                                "Total",
                                formatMoney.format(res?.obj?.valor),
                              ]);
                              objTicket["trxInfo"].push(["", ""]);
                              setObjTicketActual(objTicket);
                              setShowModal((old) => ({
                                ...old,
                                estadoPeticion: 3,
                              }));
                              resolve(true);
                            } else {
                              notifyError(res?.msg ?? res?.message ?? "");
                              resolve(true);
                            }
                          } else {
                            // notifyError(res?.msg ?? res?.message ?? "");
                            setIsUploading(false);
                            hideModalReset();
                            resolve(false);
                          }
                        })
                        .catch((err) => {
                          setIsUploading(false);
                          // notifyError("No se ha podido conectar al servidor");
                          console.error(err);
                        });
                    }, 15000)
                  );
                  if (prom === true) {
                    setIsUploading(false);
                    hideModalReset();
                    break;
                  }
                } catch (error) {
                  console.error(error);
                }
              }
            } else {
              setIsUploading(false);
              notifyError(res?.msg ?? res?.message ?? "");
              hideModalReset();
            }
          }
        })
        .catch((err) => {
          setIsUploading(false);
          hideModalReset();
          notifyError("No se ha podido conectar al servidor");
          console.error(err);
        });
    } else {
      setIsUploading(true);
      let codBarrasIndex = datosTrans.codBarras.indexOf("415");
      let codBarras = datosTrans.codBarras
        .slice(codBarrasIndex)
        .replace(/[\x1D]/g, "");
      postConsultaConveniosDavivienda({
        tipoTransaccion: "1",
        numNumeroConvenioIAC: datosEnvio?.datosConvenio?.cod_iac_cnb,
        valReferencia1: datosEnvio.datosCodigoBarras.codigosReferencia[0] ?? "",
        valReferencia2: datosEnvio.datosCodigoBarras.codigosReferencia[1] ?? "",
        fecFechaCodigoBarras:
          datosEnvio?.datosCodigoBarras?.fechaCaducidad[0] ?? "",
        numValorCodigoBarras: datosTransaccion.valor ?? 0,
        // numValorCodigoBarras: dataCodBarras,
        numValor: datosTransaccion.valor ?? 0,
        numValorTotalDebito: datosTransaccion.valor ?? 0,

        nombre_usuario: pdpUser?.uname ?? "",
        idComercio: roleInfo?.id_comercio,
        idUsuario: roleInfo?.id_usuario,
        idTerminal: roleInfo?.id_dispositivo,
        issuerIdDane: roleInfo?.codigo_dane,
        nombreComercio: roleInfo?.["nombre comercio"],
        municipio: roleInfo?.["ciudad"],
        oficinaPropia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
      })
        .then((res) => {
          if (res?.status) {
            setIsUploading(false);
            notify(res?.msg);
            let valorTrxCons =
              res?.obj?.respuesta_davivienda?.numValorTotalFactura ?? 0;
            setDatosTransaccion((old) => {
              return {
                ...old,
                showValor2: formatMoney.format(valorTrxCons) ?? "",
                valor: valorTrxCons ?? "",
                valorSinModificar2: valorTrxCons ?? "",
              };
            });
            setPeticion(2);
          } else {
            setIsUploading(false);
            notifyError(res?.msg);
            hideModalReset();
          }
        })
        .catch((err) => {
          setIsUploading(false);
          notifyError("No se ha podido conectar al servidor");
          console.error(err);
          hideModalReset();
        });
    }
  };
  const printDiv = useRef();
  const isAlt = useRef("");
  const isAltCR = useRef({ data: "", state: false });
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl text-center mb-10 mt-5'>
        Recaudo servicios públicos y privados
      </h1>
      {!datosEnvio.estadoConsulta ? (
        <>
          <Form onSubmit={onSubmit}>
            <TextArea
              id='codBarras'
              label='Escanee el código de barras'
              type='text'
              name='codBarras'
              required
              value={datosTrans.codBarras}
              autoFocus
              autoComplete='off'
              onInput={onChangeFormat}
              onKeyDown={(ev) => {
                if (ev.keyCode === 13 && ev.shiftKey === false) {
                  // ev.preventDefault();
                  onSubmit(ev);
                  return;
                }
                if (ev.altKey) {
                  if (isAltCR.current.state) {
                    isAltCR.current = {
                      ...isAltCR.current,
                      data: isAltCR.current.data + ev.key,
                    };
                  }
                  if (ev.keyCode !== 18) {
                    isAlt.current += ev.key;
                  } else {
                    isAltCR.current = { ...isAltCR.current, state: true };
                  }
                }
              }}
              onKeyUp={(ev) => {
                if (ev.altKey === false && isAlt.current !== "") {
                  let value = String.fromCharCode(parseInt(isAlt.current));
                  isAlt.current = "";
                  if (value === "\u001d") {
                    setDatosTrans((old) => {
                      return { ...old, codBarras: old.codBarras + "\u001d" };
                    });
                  }
                }
                if (ev.keyCode === 18) {
                  if (isAltCR.current.data === "013") {
                    onSubmit(ev);
                  }
                  isAltCR.current = {
                    ...isAltCR.current,
                    state: false,
                    data: "",
                  };
                }
              }}></TextArea>
            {datosTrans.codBarras !== "" && (
              <ButtonBar>
                <Button
                  type='button'
                  onClick={() => {
                    setDatosTrans({ codBarras: "" });
                  }}>
                  Volver a ingresar código de barras
                </Button>
              </ButtonBar>
            )}
          </Form>
        </>
      ) : (
        <>
          <h1 className='text-3xl text-center  mb-10'>{`Convenio: ${
            datosEnvio?.datosConvenio?.nom_convenio_cnb ?? ""
          }`}</h1>
          <Form grid onSubmit={onSubmitConfirm}>
            {datosEnvio?.datosConvenio?.ctrol_ref1_cnb === "1" && (
              <>
                <Input
                  id='ref1'
                  label={datosEnvio?.datosConvenio?.nom_ref1_cnb}
                  type='text'
                  name='ref1'
                  minLength='32'
                  maxLength='32'
                  disabled={true}
                  value={
                    datosEnvio.datosCodigoBarras.codigosReferencia[0] ?? ""
                  }
                  onInput={(e) => {
                    // setDatosTransaccion((old) => {
                    //   return { ...old, ref1: e.target.value };
                    // });
                  }}></Input>
              </>
            )}
            {datosEnvio?.datosConvenio?.ctrol_ref2_cnb === "1" && (
              <Input
                id='ref2'
                label={datosEnvio?.datosConvenio?.nom_ref2_cnb}
                type='text'
                name='ref2'
                minLength='32'
                maxLength='32'
                disabled={true}
                value={datosEnvio.datosCodigoBarras.codigosReferencia[1] ?? ""}
                onInput={(e) => {
                  // setDatosTransaccion((old) => {
                  //   return { ...old, ref2: e.target.value };
                  // });
                }}></Input>
            )}
            {datosEnvio?.datosCodigoBarras?.fechaCaducidad?.length &&
            datosEnvio?.datosCodigoBarras?.fechaCaducidad?.length > 0 ? (
              <Input
                id='ref2'
                label='Fecha de caducidad'
                type='text'
                name='ref2'
                minLength='32'
                maxLength='32'
                disabled={true}
                value={datosEnvio.datosCodigoBarras.fechaCaducidad[0] ?? ""}
                onInput={(e) => {
                  // setDatosTransaccion((old) => {
                  //   return { ...old, ref2: e.target.value };
                  // });
                }}></Input>
            ) : (
              <></>
            )}
            {datosEnvio.datosCodigoBarras.pago.length > 0 && (
              <MoneyInputDec
                id='valCashOut'
                name='valCashOut'
                label='Valor a pagar original'
                type='text'
                autoComplete='off'
                maxLength={"15"}
                disabled={true}
                value={datosTransaccion.valorSinModificar ?? ""}
                onInput={(e, valor) => {
                  if (!isNaN(valor)) {
                    const num = valor;
                    // setDatosTransaccion((old) => {
                    //   return { ...old, valor: num };
                    // });
                  }
                }}
                required></MoneyInputDec>
            )}
            {dataConveniosPagar.includes(
              datosEnvio?.datosConvenio?.num_ind_consulta_cnb
            ) && datosEnvio?.datosConvenio?.ind_valor_exacto_cnb === "0" ? (
              <MoneyInput
                id='valor'
                name='valor'
                label='Valor a pagar'
                autoComplete='off'
                type='tel'
                minLength={"5"}
                maxLength={"12"}
                value={datosTransaccion.showValor ?? ""}
                onInput={(ev, val) => {
                  setDatosTransaccion((old) => ({
                    ...old,
                    valor: val,
                    showValor: val,
                  }));
                }}
                required
                min={enumParametrosDavivienda.MINRECAUDO}
                max={enumParametrosDavivienda.MAXRECAUDO}
                equalError={false}
                equalErrorMin={false}
              />
            ) : (
              <></>
            )}
            <ButtonBar className='lg:col-span-2'>
              <Button
                type='button'
                onClick={() => {
                  setDatosEnvio({
                    datosCodigoBarras: {},
                    datosConvenio: {},
                    estadoConsulta: false,
                    estadoFecha: false,
                  });
                  setDatosTrans({ codBarras: "" });
                  setDatosTransaccion({
                    ref1: "",
                    ref2: "",
                    valor: "",
                    showValor: "",
                    valorSinModificar: "",
                    data: "",
                  });
                }}>
                Volver a ingresar código de barras
              </Button>
              {!datosEnvio.estadoFecha && (
                <Button type='submit'>
                  {dataConveniosPagar.includes(
                    datosEnvio?.datosConvenio?.num_ind_consulta_cnb
                  )
                    ? "Realizar pago"
                    : "Realizar consulta"}
                </Button>
              )}
            </ButtonBar>
          </Form>
          <Modal show={showModal}>
            <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
              {peticion === 1 && (
                <>
                  <h1 className='text-2xl font-semibold'>
                    {dataConveniosPagar.includes(
                      datosEnvio?.datosConvenio?.num_ind_consulta_cnb
                    )
                      ? "¿Está seguro de realizar el pago?"
                      : "¿Está seguro de realizar la consulta?"}
                  </h1>
                  <h2>{`Convenio: ${
                    datosEnvio?.datosConvenio?.nom_convenio_cnb ?? ""
                  }`}</h2>
                  {datosEnvio?.datosConvenio?.ctrol_ref1_cnb === "1" && (
                    <h2>{`${datosEnvio?.datosConvenio?.nom_ref1_cnb}: ${
                      datosEnvio.datosCodigoBarras.codigosReferencia[0] ?? ""
                    }`}</h2>
                  )}
                  {datosEnvio?.datosConvenio?.ctrol_ref2_cnb === "1" && (
                    <h2>{`${datosEnvio?.datosConvenio?.nom_ref2_cnb}: ${
                      datosEnvio.datosCodigoBarras.codigosReferencia[1] ?? ""
                    }`}</h2>
                  )}
                  <h2>{`Valor transacción: ${formatMoney.format(
                    datosTransaccion.valor
                  )}`}</h2>
                  <ButtonBar>
                    <Button onClick={hideModalReset}>Cancelar</Button>
                    <Button type='submit' onClick={onSubmitPago}>
                      Aceptar
                    </Button>
                  </ButtonBar>
                </>
              )}
              {peticion === 2 && (
                <>
                  <h1 className='text-2xl text-center mb-5 font-semibold'>
                    Resultado consulta
                  </h1>
                  <h2>{`Nombre convenio: ${datosEnvio?.datosConvenio?.nom_convenio_cnb}`}</h2>
                  <h2>{`Número convenio: ${datosEnvio?.datosConvenio?.cod_convenio_cnb}`}</h2>
                  {datosEnvio?.datosConvenio?.ctrol_ref1_cnb === "1" && (
                    <h2>{`${datosEnvio?.datosConvenio?.nom_ref1_cnb}: ${
                      datosEnvio.datosCodigoBarras.codigosReferencia[0] ?? ""
                    }`}</h2>
                  )}
                  {datosEnvio?.datosConvenio?.ctrol_ref2_cnb === "1" && (
                    <h2>{`${datosEnvio?.datosConvenio?.nom_ref2_cnb}: ${
                      datosEnvio.datosCodigoBarras.codigosReferencia[1] ?? ""
                    }`}</h2>
                  )}
                  <h2 className='text-base'>
                    {`Valor consultado: ${formatMoney.format(
                      datosTransaccion.valorSinModificar2
                    )} `}
                  </h2>
                  {datosEnvio?.datosConvenio?.ind_valor_exacto_cnb === "0" &&
                  (datosEnvio?.datosConvenio?.ind_valor_ceros_cnb !== "0" ||
                    datosEnvio?.datosConvenio?.ind_menor_vlr_cnb !== "0" ||
                    datosEnvio?.datosConvenio?.ind_mayor_vlr_cnb !== "0") ? (
                    <Form grid onSubmit={onSubmitPago}>
                      <MoneyInput
                        id='valor'
                        name='valor'
                        label='Valor a pagar'
                        autoComplete='off'
                        type='tel'
                        minLength={"5"}
                        maxLength={"12"}
                        value={datosTrans.valor ?? ""}
                        onInput={(ev, val) => {
                          setDatosTransaccion((old) => ({
                            ...old,
                            valor: val,
                            showValor2: val,
                          }));
                        }}
                        required
                        min={enumParametrosDavivienda.MINRECAUDO}
                        max={enumParametrosDavivienda.MAXRECAUDO}
                        equalError={false}
                        equalErrorMin={false}
                      />
                      <ButtonBar>
                        <Button onClick={hideModalReset}>Cancelar</Button>
                        <Button type='submit'>Realizar pago</Button>
                      </ButtonBar>
                    </Form>
                  ) : (
                    <ButtonBar>
                      <Button onClick={hideModalReset}>Cancelar</Button>
                      <Button type='submit' onClick={onSubmitPago}>
                        Realizar pago
                      </Button>
                    </ButtonBar>
                  )}
                </>
              )}
              {peticion === 4 && (
                <>
                  <h2>
                    <ButtonBar>
                      <Button onClick={handlePrint}>Imprimir</Button>
                      <Button
                        type='submit'
                        onClick={() => {
                          hideModalReset();
                          navigate(-1);
                        }}>
                        Aceptar
                      </Button>
                    </ButtonBar>
                  </h2>
                  <TicketsDavivienda
                    ticket={objTicketActual}
                    refPrint={printDiv}></TicketsDavivienda>
                </>
              )}
            </div>
          </Modal>
        </>
      )}
    </>
  );
};

export default RecaudoServiciosPublicosPrivadosLecturaCodigoBarras;
