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
  postConsultaCodigoBarrasConveniosEspecifico,
  postConsultaConveniosDavivienda,
  postRecaudoConveniosDavivienda,
} from "../../utils/fetchRecaudoServiciosPublicosPrivados";

const RecaudoServiciosPublicosPrivadosLecturaCodigoBarrasAval = () => {
  const { roleInfo } = useAuth();
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
    if (datosTrans?.codBarras.slice(0, 3) === "]C1") {
      setIsUploading(true);
      fetchTablaConveniosEspecificoFunc(datosTrans?.codBarras);
    } else {
      notifyError("El codigo de barras no tiene el formato correcto");
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
      const hoy = new Date();
      const fecha =
        hoy.getDate() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getFullYear();
      /*hora actual */
      const hora =
        hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getSeconds();
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
        numTipoProductoRecaudo: datosEnvio?.datosConvenio?.tipo_cta_recaudo_cnb,
        numProductoRecaudo: datosEnvio?.datosConvenio?.nro_cta_recaudo_cnb,
        valTipoProdDestinoRecaudoCent:
          datosEnvio?.datosConvenio?.tipo_cta_destino_cnb,
        valProdDestinoRecaudoCent:
          datosEnvio?.datosConvenio?.nro_cta_destino_cnb,
        valCodigoIAC: datosEnvio?.datosConvenio?.cod_iac_cnb,
        valor: valorTransaccion,
        valReferencia1: datosEnvio.datosCodigoBarras.codigosReferencia[0] ?? "",
        valReferencia2: datosEnvio.datosCodigoBarras.codigosReferencia[1] ?? "",
        nomConvenio: datosEnvio?.datosConvenio?.nom_convenio_cnb,
        ticket: objTicket,
        fecCodigDeBarras:
          datosEnvio?.datosCodigoBarras?.fechaCaducidad[0] ?? "",
        valCodigoDeBarras: datosTrans.codBarras.slice(3).replace(/[.]/g, ""),

        idComercio: roleInfo?.id_comercio,
        idUsuario: roleInfo?.id_usuario,
        idTerminal: roleInfo?.id_dispositivo,
        issuerIdDane: roleInfo?.codigo_dane,
        nombreComercio: roleInfo?.["nombre comercio"],
        municipio: roleInfo?.["ciudad"],
        oficinaPropia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ? true : false,
      })
        .then((res) => {
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
            setIsUploading(false);
            notifyError(res?.msg);
            hideModal();
          }
        })
        .catch((err) => {
          setIsUploading(false);
          notifyError("No se ha podido conectar al servidor");
          console.error(err);
        });
    } else {
      setIsUploading(true);
      postConsultaConveniosDavivienda({
        tipoTransaccion: "1",
        numNumeroConvenioIAC: datosEnvio?.datosConvenio?.cod_iac_cnb,
        valReferencia1: datosEnvio.datosCodigoBarras.codigosReferencia[0] ?? "",
        valReferencia2: datosEnvio.datosCodigoBarras.codigosReferencia[1] ?? "",
        fecFechaCodigoBarras:
          datosEnvio?.datosCodigoBarras?.fechaCaducidad[0] ?? "",
        numValorCodigoBarras: datosTrans.codBarras.slice(3).replace(/[.]/g, ""),

        idComercio: roleInfo?.id_comercio,
        idUsuario: roleInfo?.id_usuario,
        idTerminal: roleInfo?.id_dispositivo,
        issuerIdDane: roleInfo?.codigo_dane,
        nombreComercio: roleInfo?.["nombre comercio"],
        municipio: roleInfo?.["ciudad"],
        oficinaPropia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ? true : false,
      })
        .then((res) => {
          if (res?.status) {
            setIsUploading(false);
            notify(res?.msg);
            console.log("consulta", res);
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
            hideModal();
          }
        })
        .catch((err) => {
          setIsUploading(false);
          notifyError("No se ha podido conectar al servidor");
          console.error(err);
        });
    }
  };
  const onChangeMoney = useMoney({
    limits: [0, 20000000],
    decimalDigits: 2,
  });
  const printDiv = useRef();
  const isAlt = useRef("");
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl text-center mb-10 mt-5'>
        Recaudo servicios publicos y privados
      </h1>
      {!datosEnvio.estadoConsulta ? (
        <>
          <Form>
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
                  if (ev.keyCode !== 18) {
                    isAlt.current += ev.key;
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
              }}></TextArea>
            {datosTrans.codBarras !== "" && (
              <ButtonBar>
                <Button
                  type='button'
                  onClick={() => {
                    setDatosTrans({ codBarras: "" });
                  }}>
                  Volver a ingresar codigo de barras
                </Button>
              </ButtonBar>
            )}
          </Form>
        </>
      ) : (
        <>
          <h1 className='text-3xl text-center  mb-10'>{`Convenio: ${
            datosEnvio?.datosConvenio?.convenio ?? ""
          }`}</h1>
          <Form grid onSubmit={onSubmitConfirm}>
            <Input
              id='ref1'
              label='Referencia 1'
              type='text'
              name='ref1'
              minLength='32'
              maxLength='32'
              disabled={true}
              value={datosEnvio.datosCodigoBarras.codigosReferencia[0] ?? ""}
              onInput={(e) => {
                // setDatosTransaccion((old) => {
                //   return { ...old, ref1: e.target.value };
                // });
              }}></Input>
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
            {datosEnvio.datosCodigoBarras.pago[0] && (
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
              <Input
                id='valor'
                name='valor'
                label='Valor a depositar'
                autoComplete='off'
                type='tel'
                minLength={"5"}
                maxLength={"20"}
                defaultValue={datosTransaccion.showValor ?? ""}
                onInput={(ev) =>
                  setDatosTransaccion((old) => ({
                    ...old,
                    valor: onChangeMoney(ev),
                    showValor: onChangeMoney(ev),
                  }))
                }
                required
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
                Volver a ingresar codigo de barras
              </Button>
              {!datosEnvio.estadoFecha && (
                <Button type='submit'>Realizar consulta</Button>
              )}
            </ButtonBar>
          </Form>
          <Modal show={showModal} handleClose={hideModal}>
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
                    <Button onClick={hideModal}>Cancelar</Button>
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
                      datosEnvio?.datosConvenio?.ind_mayor_vlr_cnb !== "0") && (
                      <Form grid onSubmit={onSubmitPago}>
                        <Input
                          id='valor'
                          name='valor'
                          label='Valor a depositar'
                          autoComplete='off'
                          type='tel'
                          minLength={"5"}
                          maxLength={"20"}
                          defaultValue={datosTransaccion.showValor2 ?? ""}
                          onInput={(ev) =>
                            setDatosTransaccion((old) => ({
                              ...old,
                              valor: onChangeMoney(ev),
                              showValor2: onChangeMoney(ev),
                            }))
                          }
                          required
                        />
                        <ButtonBar>
                          <Button onClick={hideModalReset}>Cancelar</Button>
                          <Button type='submit'>Realizar pago</Button>
                        </ButtonBar>
                      </Form>
                    )}
                </>
              )}
              {peticion === 4 && (
                <>
                  <h2>
                    <ButtonBar>
                      <Button onClick={handlePrint}>Imprimir</Button>
                      <Button type='submit' onClick={hideModalReset}>
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

export default RecaudoServiciosPublicosPrivadosLecturaCodigoBarrasAval;
