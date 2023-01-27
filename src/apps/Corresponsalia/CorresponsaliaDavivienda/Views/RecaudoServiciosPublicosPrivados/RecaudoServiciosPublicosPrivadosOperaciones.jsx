import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import Modal from "../../../../../components/Base/Modal";
import MoneyInput, {
  formatMoney,
} from "../../../../../components/Base/MoneyInput";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import { useAuth } from "../../../../../hooks/AuthHooks";
import useMoney from "../../../../../hooks/useMoney";
import { notify, notifyError } from "../../../../../utils/notify";
import TicketsDavivienda from "../../components/TicketsDavivienda";
import {
  postCheckReintentoRecaudoConveniosDavivienda,
  postConsultaConveniosDavivienda,
  postConsultaTablaConveniosEspecifico,
  postRecaudoConveniosDavivienda,
} from "../../utils/fetchRecaudoServiciosPublicosPrivados";

const RecaudoServiciosPublicosPrivadosOperaciones = () => {
  const { state } = useLocation();
  const { roleInfo, pdpUser } = useAuth();
  const navigate = useNavigate();
  const [{ showModal, estadoPeticion }, setShowModal] = useState({
    showModal: false,
    estadoPeticion: 0,
  });
  const [datosTrans, setDatosTrans] = useState({
    ref1: "",
    ref2: "",
    valor: "",
  });
  const [datosTransValidacion, setDatosTransValidacion] = useState({
    ref1: "",
    ref2: "",
    valor: "",
  });
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
  const [datosConsulta, setDatosConsulta] = useState({
    idTrx: "",
    consultaDavivienda: {},
  });
  const [isUploading, setIsUploading] = useState(true);
  const [convenio, setConvenio] = useState([]);
  const dataConveniosPagar = ["3", "0"];
  useEffect(() => {
    if (state?.id) {
      fecthTablaConveniosEspecificoFunc();
    } else {
      navigate("../");
    }
  }, [state?.id]);

  const fecthTablaConveniosEspecificoFunc = () => {
    postConsultaTablaConveniosEspecifico({
      pk_tbl_transaccional_convenios_davivienda_cb: state?.id,
    })
      .then((autoArr) => {
        setConvenio(autoArr?.results[0]);
        setIsUploading(false);
      })
      .catch((err) => console.error(err));
  };
  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const onSubmit = (e) => {
    e.preventDefault();
    if (convenio.tipo_convenio_cnb === "DNR") {
      setShowModal((old) => ({ ...old, showModal: true }));
    } else {
      setDatosTransValidacion((old) => ({
        ref1: datosTrans.ref1,
        ref2: datosTrans.ref2,
        valor: datosTrans.valor,
      }));
      setShowModal((old) => ({ ...old, showModal: true, estadoPeticion: 4 }));
      // onSubmitValidacion(e);
    }
  };
  const onSubmitValidacion = (e) => {
    e.preventDefault();
    if (estadoPeticion !== 1 && convenio.tipo_convenio_cnb === "DNR") {
      if (convenio?.ctrol_ref1_cnb === "1") {
        if (datosTrans.ref1 !== datosTransValidacion.ref1)
          return notifyError("Los datos ingresados son diferentes");
      }
      if (convenio?.ctrol_ref2_cnb === "1") {
        if (datosTrans.ref2 !== datosTransValidacion.ref2)
          return notifyError("Los datos ingresados son diferentes");
      }
      if (dataConveniosPagar.includes(convenio?.num_ind_consulta_cnb)) {
        if (datosTrans.valor !== datosTransValidacion.valor) {
          return notifyError("El valor ingresado es diferente");
        }
      }
    }
    if (
      dataConveniosPagar.includes(convenio?.num_ind_consulta_cnb) ||
      estadoPeticion === 1
    ) {
      let valorTransaccion = 0;
      if (estadoPeticion === 1) {
        if (typeof datosTransValidacion?.valor == "string") {
          valorTransaccion = datosTransValidacion?.valor.replace(/[$ .]/g, "");
          valorTransaccion = parseInt(valorTransaccion);
        } else {
          valorTransaccion = datosTransValidacion?.valor;
        }
        if (convenio?.ind_valor_exacto_cnb === "0") {
          if (
            convenio?.ind_mayor_vlr_cnb === "0" &&
            valorTransaccion >
              datosConsulta.consultaDavivienda?.numValorTotalFactura
          )
            return notifyError("No esta permitido el pago mayor al consultado");
          if (
            convenio?.ind_menor_vlr_cnb === "0" &&
            valorTransaccion <
              datosConsulta.consultaDavivienda?.numValorTotalFactura
          ) {
            if (
              !(convenio?.ind_valor_ceros_cnb === "1" && valorTransaccion === 0)
            ) {
              return notifyError(
                "No esta permitido el pago menor al consultado"
              );
            }
          }
          if (convenio?.ind_valor_ceros_cnb === "0" && valorTransaccion === 0) {
            return notifyError("No esta permitido el pago en ceros");
          }
        }
      } else {
        valorTransaccion = datosTransValidacion?.valor ?? "0";
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
      objTicket["trxInfo"].push(["Convenio", convenio.nom_convenio_cnb]);
      objTicket["trxInfo"].push(["", ""]);
      objTicket["trxInfo"].push(["Código convenio", convenio.cod_convenio_cnb]);
      objTicket["trxInfo"].push(["", ""]);
      objTicket["trxInfo"].push([
        "Referencia 1",
        datosTransValidacion?.ref1 ?? "",
      ]);
      objTicket["trxInfo"].push(["", ""]);
      objTicket["trxInfo"].push([
        "Referencia 2",
        datosTransValidacion?.ref2 ?? "",
      ]);
      objTicket["trxInfo"].push(["", ""]);
      setIsUploading(true);
      postRecaudoConveniosDavivienda({
        valTipoConsultaConvenio: "2",
        numConvenio: convenio.cod_convenio_cnb,
        // numTipoProductoRecaudo: convenio.tipo_cta_recaudo_cnb,
        // numProductoRecaudo: convenio.nro_cta_recaudo_cnb,
        // valTipoProdDestinoRecaudoCent: convenio.tipo_cta_destino_cnb,
        // valProdDestinoRecaudoCent: convenio.nro_cta_destino_cnb,
        numTipoProductoRecaudo: convenio.tipo_cta_destino_cnb,
        numProductoRecaudo: convenio.nro_cta_destino_cnb,
        valTipoProdDestinoRecaudoCent: convenio.tipo_cta_recaudo_cnb,
        valProdDestinoRecaudoCent: convenio.nro_cta_recaudo_cnb,
        valCodigoIAC: "0",
        valor: valorTransaccion,
        valReferencia1: datosTransValidacion?.ref1 ?? "",
        valReferencia2: datosTransValidacion?.ref2 ?? "",
        nomConvenio: convenio.nom_convenio_cnb,
        ticket: objTicket,

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
              res?.obj?.respuestaDavivienda?.valTalonOut ?? res?.obj?.idTrx,
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
            setShowModal((old) => ({ ...old, estadoPeticion: 3 }));
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
                          if (res?.msg !== "No ha terminado el reintento") {
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
                            handleClose();
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
                    handleClose();
                    break;
                  }
                } catch (error) {
                  console.error(error);
                }
              }
            } else {
              notifyError(res?.msg ?? res?.message ?? "");
              setIsUploading(false);
              handleClose();
            }
          }
        })
        .catch((err) => {
          setIsUploading(false);
          notifyError("No se ha podido conectar al servidor");
          console.error(err);
          handleClose();
        });
    } else {
      setIsUploading(true);
      postConsultaConveniosDavivienda({
        tipoTransaccion: "2",
        numNumeroConvenioIAC: convenio.cod_convenio_cnb,
        valReferencia1: datosTransValidacion?.ref1 ?? "",
        valReferencia2: datosTransValidacion?.ref2 ?? "",
        numValorTotalDebito: datosTransValidacion.valor ?? 0,

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
            setDatosConsulta((old) => ({
              ...old,
              idTrx: res?.obj?.idTrx,
              consultaDavivienda: res?.obj?.respuesta_davivienda,
            }));
            setDatosTransValidacion((old) => ({
              ...old,
              valor:
                formatMoney.format(
                  res?.obj?.respuesta_davivienda?.numValorTotalFactura
                ) ?? "",
            }));
            setShowModal((old) => ({ ...old, estadoPeticion: 1 }));
          } else {
            setIsUploading(false);
            notifyError(res?.msg);
            handleClose();
          }
        })
        .catch((err) => {
          handleClose();
          setIsUploading(false);
          notifyError("No se ha podido conectar al servidor");
          console.error(err);
        });
    }
  };
  const handleClose = useCallback(() => {
    setShowModal((old) => ({ ShowModal: false, estadoPeticion: 0 }));
    setDatosTransValidacion((old) => ({
      ...old,
      ref1: "",
      ref2: "",
      valor: "",
    }));
    setDatosTrans((old) => ({
      ...old,
      ref1: "",
      ref2: "",
      valor: "",
    }));
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
    setDatosConsulta({});
  }, []);
  const onChangeMoneyLocal = (ev, valor) => {
    if (!isNaN(valor)) {
      const num = valor;
      setDatosTrans((old) => {
        return { ...old, valor: onChangeMoney(ev) };
      });
    }
  };
  const onChangeMoney = useMoney({
    limits: [1000, 1000000000],
    decimalDigits: 2,
  });
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl text-center mb-10 mt-5'>
        Recaudo servicios públicos y privados
      </h1>
      <h1 className='text-2xl text-center mb-10'>{`Convenio: ${
        convenio?.nom_convenio_cnb ?? ""
      }`}</h1>

      <Form
        grid={
          convenio?.ctrol_ref2_cnb === "1" &&
          dataConveniosPagar.includes(convenio?.num_ind_consulta_cnb)
        }
        onSubmit={onSubmit}>
        {convenio?.ctrol_ref1_cnb === "1" && (
          <>
            <Input
              id='ref1'
              label={convenio?.nom_ref1_cnb}
              type='text'
              name='ref1'
              minLength='1'
              maxLength='32'
              required
              value={datosTrans.ref1}
              autoComplete='off'
              onInput={(e) => {
                let valor = e.target.value;
                let num = valor.replace(/[\s\.]/g, "");
                if (!isNaN(num)) {
                  setDatosTrans((old) => {
                    return { ...old, ref1: num };
                  });
                }
              }}></Input>
          </>
        )}
        {convenio?.ctrol_ref2_cnb === "1" && (
          <Input
            id='ref2'
            label={convenio?.nom_ref2_cnb}
            type='text'
            name='ref2'
            minLength='1'
            maxLength='32'
            autoComplete='off'
            required
            value={datosTrans.ref2}
            onInput={(e) => {
              let valor = e.target.value;
              let num = valor.replace(/[\s\.]/g, "");
              if (!isNaN(num)) {
                setDatosTrans((old) => {
                  return { ...old, ref2: num };
                });
              }
            }}></Input>
        )}
        {dataConveniosPagar.includes(convenio?.num_ind_consulta_cnb) && (
          <MoneyInput
            id='valCashOut'
            name='valCashOut'
            label='Valor'
            type='text'
            autoComplete='off'
            maxLength={"20"}
            value={datosTrans.valor ?? ""}
            onInput={onChangeMoneyLocal}
            required></MoneyInput>

          // <Input
          //   id='valor'
          //   name='valor'
          //   label='Valor'
          //   autoComplete='off'
          //   type='tel'
          //   minLength={"0"}
          //   maxLength={"20"}
          //   value={datosTrans.valor ?? ""}
          //   onInput={(ev) =>
          //     setDatosTrans((old) => ({
          //       ...old,
          //       valor: onChangeMoney(ev),
          //     }))
          //   }
          //   required
          // />
        )}
        <ButtonBar
          className={
            convenio?.ctrol_ref2_cnb === "1" &&
            dataConveniosPagar.includes(convenio?.num_ind_consulta_cnb)
              ? "lg:col-span-2"
              : ""
          }>
          <Button type='submit'>
            {dataConveniosPagar.includes(convenio?.num_ind_consulta_cnb)
              ? "Realizar pago"
              : "Realizar consulta"}
          </Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal}>
        <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
          {estadoPeticion === 0 ? (
            <>
              <h1 className='text-2xl text-center mb-10 font-semibold'>
                Ingrese nuevamente los datos de la transacción
              </h1>
              <Form grid onSubmit={onSubmitValidacion}>
                {convenio?.ctrol_ref1_cnb === "1" && (
                  <Input
                    id='ref1'
                    label={convenio?.nom_ref1_cnb}
                    type='text'
                    name='ref1'
                    minLength='1'
                    maxLength='32'
                    required
                    autoComplete='off'
                    value={datosTransValidacion.ref1}
                    onInput={(e) => {
                      let valor = e.target.value;
                      let num = valor.replace(/[\s\.]/g, "");
                      if (!isNaN(num)) {
                        setDatosTransValidacion((old) => {
                          return { ...old, ref1: num };
                        });
                      }
                    }}></Input>
                )}
                {convenio?.ctrol_ref2_cnb === "1" && (
                  <Input
                    id='ref2'
                    label={convenio?.nom_ref2_cnb}
                    type='text'
                    name='ref2'
                    minLength='1'
                    autoComplete='off'
                    maxLength='32'
                    required
                    value={datosTransValidacion.ref2}
                    onInput={(e) => {
                      let valor = e.target.value;
                      let num = valor.replace(/[\s\.]/g, "");
                      if (!isNaN(num)) {
                        setDatosTransValidacion((old) => {
                          return { ...old, ref2: num };
                        });
                      }
                    }}></Input>
                )}
                {dataConveniosPagar.includes(
                  convenio?.num_ind_consulta_cnb
                ) && (
                  <Input
                    id='valor'
                    name='valor'
                    label='Valor a pagar'
                    autoComplete='off'
                    type='tel'
                    minLength={"0"}
                    maxLength={"20"}
                    defaultValue={datosTransValidacion.valor ?? ""}
                    onInput={(ev) =>
                      setDatosTransValidacion((old) => ({
                        ...old,
                        valor: onChangeMoney(ev),
                      }))
                    }
                    required
                  />
                )}
                <ButtonBar>
                  <Button type='button' onClick={handleClose}>
                    Cancelar
                  </Button>
                  <Button type='submit'>
                    {dataConveniosPagar.includes(convenio?.num_ind_consulta_cnb)
                      ? "Realizar pago"
                      : "Realizar consulta"}
                  </Button>
                </ButtonBar>
              </Form>
            </>
          ) : estadoPeticion === 1 ? (
            <>
              <h1 className='text-2xl text-center mb-5 font-semibold'>
                Resultado consulta
              </h1>
              <h2>{`Nombre convenio: ${datosConsulta.consultaDavivienda.valNombreConvenio}`}</h2>
              <h2>{`Número convenio: ${datosConsulta.consultaDavivienda.numNumeroConvenio}`}</h2>
              {convenio?.ctrol_ref1_cnb === "1" && (
                <h2>{`${convenio?.nom_ref1_cnb}: ${datosTransValidacion.ref1}`}</h2>
              )}
              {convenio?.ctrol_ref2_cnb === "1" && (
                <h2>{`${convenio?.nom_ref2_cnb}: ${datosTransValidacion.ref2}`}</h2>
              )}
              <h2 className='text-base'>
                {`Valor consultado: ${formatMoney.format(
                  datosConsulta.consultaDavivienda.numValorTotalFactura
                )} `}
              </h2>
              {convenio?.ind_valor_exacto_cnb === "0" &&
              (convenio?.ind_valor_ceros_cnb !== "0" ||
                convenio?.ind_menor_vlr_cnb !== "0" ||
                convenio?.ind_mayor_vlr_cnb !== "0") ? (
                <Form grid onSubmit={onSubmitValidacion}>
                  <Input
                    id='valor'
                    name='valor'
                    label='Valor a pagar'
                    autoComplete='off'
                    type='tel'
                    minLength={"2"}
                    maxLength={"20"}
                    defaultValue={datosTransValidacion.valor ?? ""}
                    onInput={(ev) =>
                      setDatosTransValidacion((old) => ({
                        ...old,
                        valor: onChangeMoney(ev),
                      }))
                    }
                    required
                  />
                  <ButtonBar>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button type='submit'>Realizar pago</Button>
                  </ButtonBar>
                </Form>
              ) : (
                <>
                  <ButtonBar>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button type='submit' onClick={onSubmitValidacion}>
                      Realizar pago
                    </Button>
                  </ButtonBar>
                </>
              )}
            </>
          ) : estadoPeticion === 3 ? (
            <>
              <h2>
                <ButtonBar>
                  <Button onClick={handlePrint}>Imprimir</Button>
                  <Button
                    type='submit'
                    onClick={() => {
                      handleClose();
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
          ) : estadoPeticion === 4 ? (
            <>
              <h1 className='text-2xl font-semibold'>
                {dataConveniosPagar.includes(convenio?.num_ind_consulta_cnb)
                  ? "¿Está seguro de realizar el pago del servicio?"
                  : "¿Está seguro de realizar la consulta servicio?"}
              </h1>
              <h2>{`Nombre convenio: ${convenio?.nom_convenio_cnb ?? ""}`}</h2>
              {convenio?.ctrol_ref1_cnb === "1" && (
                <h2>{`${convenio?.nom_ref1_cnb}: ${datosTransValidacion.ref1}`}</h2>
              )}
              {convenio?.ctrol_ref2_cnb === "1" && (
                <h2>{`${convenio?.nom_ref2_cnb}: ${datosTransValidacion.ref2}`}</h2>
              )}
              {dataConveniosPagar.includes(convenio?.num_ind_consulta_cnb) && (
                <h2>{`Valor consultado: ${formatMoney.format(
                  datosTrans?.valor
                )} `}</h2>
              )}
              <ButtonBar>
                <Button onClick={handleClose}>Cancelar</Button>
                <Button type='submit' onClick={onSubmitValidacion}>
                  {dataConveniosPagar.includes(convenio?.num_ind_consulta_cnb)
                    ? "Realizar pago"
                    : "Realizar consulta"}
                </Button>
              </ButtonBar>
            </>
          ) : (
            <></>
          )}
        </div>
      </Modal>
    </>
  );
};

export default RecaudoServiciosPublicosPrivadosOperaciones;