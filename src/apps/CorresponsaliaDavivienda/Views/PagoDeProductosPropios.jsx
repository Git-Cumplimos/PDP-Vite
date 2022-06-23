import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Modal from "../../../components/Base/Modal";
import useQuery from "../../../hooks/useQuery";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  postCashOut,
  postRealizarCashoutDavivienda,
} from "../utils/fetchCorresponsaliaDavivienda";
import { notify, notifyError } from "../../../utils/notify";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import MoneyInput, { formatMoney } from "../../../components/Base/MoneyInput";
import { useFetch } from "../../../hooks/useFetch";
import { useAuth } from "../../../hooks/AuthHooks";
import SimpleLoading from "../../../components/Base/SimpleLoading";
import TicketsDavivienda from "../components/TicketsDavivienda";
import Select from "../../../components/Base/Select";
import {
  postConsultaProductosPropiosDavivienda,
  postPagoProductosPropiosDavivienda,
} from "../utils/fetchProductosPropios";
import { fetchParametrosAutorizadores } from "../../TrxParams/utils/fetchParametrosAutorizadores";
import { enumParametrosAutorizador } from "../utils/enumParametrosAutorizador";

const PagoDeProductosPropios = () => {
  const { roleInfo } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [limiteRecarga, setLimiteRecarga] = useState({
    superior: 720000,
    inferior: 1,
  });
  const [peticion, setPeticion] = useState(0);
  const [botonAceptar, setBotonAceptar] = useState(false);
  const [datosTrans, setDatosTrans] = useState({
    tipoIdentificacion: "",
    numeroIdentificacion: "",
    tipoProducto: "",
    nombreProducto: "",
    numeroProducto: "",
    codigoFamilia: "",
    nombreTipoIdentificacion: "",
    binTarjetaCredito: "",
    ultimosTarjetaCredito: "",
  });
  const [tipoAbono, setTipoAbono] = useState({
    tipoAbonoId: "",
    tipoAbonoNombre: "",
    valorAbono: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [datosConsulta, setDatosConsulta] = useState({});

  const [objTicketActual, setObjTicketActual] = useState({
    title: "Recibo de retiro DaviPlata",
    timeInfo: {
      "Fecha de venta": "",
      Hora: "",
    },
    commerceInfo: [
      /*id transaccion recarga*/
      /*id_comercio*/
      ["Id comercio", roleInfo?.id_comercio ? roleInfo?.id_comercio : 1],
      /*id_dispositivo*/
      ["No. terminal", roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 1],
      /*ciudad*/
      ["Municipio", roleInfo?.ciudad ? roleInfo?.ciudad : "Bogota"],
      /*direccion*/
      [
        "Dirección",
        roleInfo?.direccion ? roleInfo?.direccion : "Calle 13 # 233 - 2",
      ],
      ["Tipo de operación", "Pago de Productos de Crédito"],
      ["", ""],
    ],
    commerceName: roleInfo?.["nombre comercio"]
      ? roleInfo?.["nombre comercio"]
      : "prod",
    trxInfo: [],
    disclamer:
      "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot) Línea de atención Bogotá:338 38 38 Resto del país:01 8000 123 838",
  });

  // /*ENVIAR NUMERO DE TARJETA Y VALOR DE LA RECARGA*/
  useEffect(() => {
    fetchParametrosAutorizadoresFunc();
  }, []);
  const fetchParametrosAutorizadoresFunc = useCallback(() => {
    fetchParametrosAutorizadores({})
      .then((autoArr) => {
        setLimiteRecarga({
          superior: parseInt(
            autoArr?.results?.filter(
              (i) =>
                i.id_tabla_general_parametros_autorizadores ===
                enumParametrosAutorizador.limite_superior_pago_productos_propios_davivienda_cb
            )[0]?.valor_parametro
          ),
          inferior: parseInt(
            autoArr?.results?.filter(
              (i) =>
                i.id_tabla_general_parametros_autorizadores ===
                enumParametrosAutorizador.limite_inferior_pago_productos_propios_davivienda_cb
            )[0]?.valor_parametro
          ),
        });
      })
      .catch((err) => console.error(err));
  }, []);
  const onSubmit = (e) => {
    e.preventDefault();
    if (datosTrans?.tipoProducto == 1) {
      setDatosTrans((pre) => ({
        ...pre,
        numeroProducto: `${pre.binTarjetaCredito}******${pre.ultimosTarjetaCredito}`,
      }));
    }
    setPeticion(1);
    habilitarModal();
  };

  /*Funcion para habilitar el modal*/
  const habilitarModal = () => {
    setShowModal(!showModal);
  };

  const hideModal = () => {
    setShowModal(false);
    setDatosTrans({
      tipoIdentificacion: "",
      numeroIdentificacion: "",
      tipoProducto: "",
      nombreProducto: "",
      numeroProducto: "",
      codigoFamilia: "",
      nombreTipoIdentificacion: "",
      binTarjetaCredito: "",
      ultimosTarjetaCredito: "",
    });
    setTipoAbono({ tipoAbonoId: "", tipoAbonoNombre: "", valorAbono: "" });
    setObjTicketActual((old) => {
      return {
        ...old,
        commerceInfo: [
          /*id transaccion recarga*/
          /*id_comercio*/
          ["Id comercio", roleInfo?.id_comercio ? roleInfo?.id_comercio : 1],
          /*id_dispositivo*/
          [
            "No. terminal",
            roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 1,
          ],
          /*ciudad*/
          ["Municipio", roleInfo?.ciudad ? roleInfo?.ciudad : "Bogota"],
          /*direccion*/
          [
            "Dirección",
            roleInfo?.direccion ? roleInfo?.direccion : "Calle 13 # 233 - 2",
          ],
          ["Tipo de operación", "Pago de Productos de Crédito"],
          ["", ""],
        ],
        trxInfo: [],
      };
    });
    setPeticion(0);
  };

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const peticionConsulta = () => {
    setIsUploading(true);
    postConsultaProductosPropiosDavivienda({
      tipoIdentificacion: datosTrans.tipoIdentificacion,
      numeroIdentificacion: datosTrans.numeroIdentificacion,
      numProducto: datosTrans.numeroProducto,
      valConsulta: datosTrans.tipoProducto,
      idComercio: roleInfo?.id_comercio ? roleInfo?.id_comercio : 8,
      idUsuario: roleInfo?.id_usuario ? roleInfo?.id_usuario : 1,
      idTerminal: roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 801,
      issuerIdDane: roleInfo?.codigo_dane ? roleInfo?.codigo_dane : 1121,
      nombreComercio: roleInfo?.["nombre comercio"]
        ? roleInfo?.["nombre comercio"]
        : "prod",
      municipio: roleInfo?.["ciudad"] ? roleInfo?.["ciudad"] : "Bogota",
      oficinaPropia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ? true : false,
    })
      .then((res) => {
        if (res?.status) {
          setIsUploading(false);
          notify(res?.msg);
          // hideModal();
          setDatosConsulta(res?.obj?.respuesta_davivienda);
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
  };
  const peticionIntermedia = () => {
    if (tipoAbono.tipoAbonoId === "")
      return notifyError("Ingrese un tipo de abono");
    if (
      (tipoAbono.tipoAbonoId === "0003" ||
        tipoAbono.tipoAbonoId === "0004" ||
        tipoAbono.tipoAbonoId === "0005" ||
        tipoAbono.tipoAbonoId === "0006") &&
      tipoAbono.valorAbono === ""
    )
      return notifyError("Ingrese el valor del abono");
    if (tipoAbono.valorAbono > datosConsulta.valPagoTotal)
      return notifyError("El valor del abono debe ser menor al valor total");
    if (tipoAbono.valorAbono > limiteRecarga.superior)
      return notifyError(
        `El valor del abono debe ser menor a ${formatMoney(
          limiteRecarga.superior
        )}`
      );
    if (tipoAbono.valorAbono < limiteRecarga.inferior)
      return notifyError(
        `El valor del abono debe ser mayor a ${formatMoney(
          limiteRecarga.superior
        )}`
      );
    setPeticion(3);
  };
  const peticionPagoPropios = () => {
    const hoy = new Date();
    const fecha =
      hoy.getDate() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getFullYear();
    /*hora actual */
    const hora =
      hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getSeconds();
    let numeroProducto =
      datosTrans.tipoProducto === "01"
        ? datosTrans.binTarjetaCredito
        : datosTrans.numeroProducto.slice(datosTrans.numeroProducto.length - 4);
    const objTicket = { ...objTicketActual };
    objTicket["timeInfo"]["Fecha de venta"] = fecha;
    objTicket["timeInfo"]["Hora"] = hora;
    objTicket["trxInfo"].push(["Tipo de producto", datosTrans.nombreProducto]);
    objTicket["trxInfo"].push(["", ""]);
    objTicket["trxInfo"].push([
      "Número de producto",
      `*******${numeroProducto}`,
    ]);
    objTicket["trxInfo"].push(["", ""]);
    setIsUploading(true);
    postPagoProductosPropiosDavivienda({
      tipoIdentificacion: datosTrans.tipoIdentificacion,
      numeroIdentificacion: datosTrans.numeroIdentificacion,
      numProducto: datosTrans.numeroProducto,
      valConsulta: datosTrans.tipoProducto,
      tipoAbono: tipoAbono.tipoAbonoId,
      valAbono: tipoAbono.valorAbono,

      idComercio: roleInfo?.id_comercio ? roleInfo?.id_comercio : 8,
      idUsuario: roleInfo?.id_usuario ? roleInfo?.id_usuario : 1,
      idTerminal: roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 801,
      issuerIdDane: roleInfo?.codigo_dane ? roleInfo?.codigo_dane : 1121,
      nombreComercio: roleInfo?.["nombre comercio"]
        ? roleInfo?.["nombre comercio"]
        : "prod",
      ticket: objTicket,
      municipio: roleInfo?.["ciudad"] ? roleInfo?.["ciudad"] : "Bogota",
      oficinaPropia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ? true : false,
      direccion: roleInfo?.direccion ? roleInfo?.direccion : "",
    })
      .then((res) => {
        if (res?.status) {
          setIsUploading(false);
          notify(res?.msg);
          // hideModal();
          objTicket["commerceInfo"][1] = [
            "No. terminal",
            res?.obj?.codigoTotal,
          ];
          objTicket["commerceInfo"].push([
            "No. de aprobación Banco",
            res?.obj?.respuestaDavivienda?.numTalon,
          ]);
          objTicket["commerceInfo"].push(["", ""]);
          objTicket["commerceInfo"].push([
            "No. de aprobación Aliado",
            res?.obj?.idTrx,
          ]);
          objTicket["commerceInfo"].push(["", ""]);
          objTicket["trxInfo"].push([
            "Valor",
            formatMoney.format(res?.obj?.respuestaDavivienda?.numValorPago),
          ]);
          objTicket["trxInfo"].push(["", ""]);
          objTicket["trxInfo"].push([
            "Costo transacción",
            formatMoney.format(res?.obj?.respuestaDavivienda?.numValorCobro),
          ]);
          objTicket["trxInfo"].push(["", ""]);
          objTicket["trxInfo"].push([
            "Total",
            formatMoney.format(res?.obj?.respuestaDavivienda?.numValorPago),
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
  };
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl'>Pago de productos de crédito</h1>
      <Form grid onSubmit={onSubmit}>
        <Select
          id='tipoIdentificacion'
          name='tipoIdentificacion'
          label='Tipo de identificación'
          options={{
            "": "",
            Cedula: "01",
            "Cedula extranjeria": "02",
            NIT: "03",
            "NIT Persona natural": "04",
          }}
          value={datosTrans?.tipoIdentificacion}
          onChange={(e) =>
            setDatosTrans((old) => {
              return {
                ...old,
                tipoIdentificacion: e.target.value,
                nombreTipoIdentificacion:
                  e.target.options[e.target.selectedIndex].text,
              };
            })
          }
          required
        />
        <Input
          id='numeroIdentificacion'
          label='Número de identificación'
          type='text'
          name='numeroIdentificacion'
          minLength='10'
          maxLength='10'
          required
          value={datosTrans.numeroIdentificacion}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setDatosTrans((old) => {
                return { ...old, numeroIdentificacion: num };
              });
            }
          }}></Input>
        <Select
          id='tipoProducto'
          name='tipoProducto'
          label='Tipo de producto'
          options={{
            "": "",
            "Tarjeta de crédito": "1",
            Crédito: "2",
          }}
          value={datosTrans?.tipoProducto}
          onChange={(e) =>
            setDatosTrans((old) => {
              return {
                ...old,
                tipoProducto: e.target.value,
                nombreProducto: e.target.options[e.target.selectedIndex].text,
                binTarjetaCredito: "",
                ultimosTarjetaCredito: "",
                numeroProducto: "",
              };
            })
          }
          required
        />

        {datosTrans?.tipoProducto === "2" && (
          <Input
            id='numeroProducto'
            label='Número de producto'
            type='text'
            name='numeroProducto'
            minLength='16'
            maxLength='16'
            required
            value={datosTrans.numeroProducto}
            onInput={(e) => {
              if (!isNaN(e.target.value)) {
                const num = e.target.value;
                setDatosTrans((old) => {
                  return { ...old, numeroProducto: num };
                });
              }
            }}></Input>
        )}
        {datosTrans?.tipoProducto === "1" && (
          <>
            <Input
              id='binTarjetaCredito'
              label='Primeros seis dígitos tarjeta de crédito'
              type='text'
              name='binTarjetaCredito'
              minLength='6'
              maxLength='6'
              required
              value={datosTrans.binTarjetaCredito}
              onInput={(e) => {
                if (!isNaN(e.target.value)) {
                  const num = e.target.value;
                  setDatosTrans((old) => {
                    return { ...old, binTarjetaCredito: num };
                  });
                }
              }}></Input>
            <Input
              id='ultimosTarjetaCredito'
              label='Ultimos cuatro dígitos tarjeta de crédito'
              type='text'
              name='ultimosTarjetaCredito'
              minLength='4'
              maxLength='4'
              required
              value={datosTrans.ultimosTarjetaCredito}
              onInput={(e) => {
                if (!isNaN(e.target.value)) {
                  const num = e.target.value;
                  setDatosTrans((old) => {
                    return { ...old, ultimosTarjetaCredito: num };
                  });
                }
              }}></Input>
          </>
        )}
        <ButtonBar className='lg:col-span-2'>
          <Button type='submit'>Aceptar</Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={hideModal}>
        <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
          {peticion === 1 && (
            <>
              <h1 className='text-2xl font-semibold'>
                ¿Esta seguro de realizar la consulta del producto?
              </h1>
              <h2>{`Número de documento: ${datosTrans.numeroIdentificacion}`}</h2>
              <h2>{`Tipo de documento: ${datosTrans.nombreTipoIdentificacion}`}</h2>
              <h2>{`Producto: ${datosTrans.nombreProducto}`}</h2>
              <h2>{`Número producto: ${datosTrans.numeroProducto}`}</h2>
              <ButtonBar>
                <Button type='submit' onClick={peticionConsulta}>
                  Aceptar
                </Button>
                <Button onClick={hideModal}>Cancelar</Button>
              </ButtonBar>
            </>
          )}
          {peticion === 2 && (
            <>
              <h1 className='text-2xl font-semibold'>
                Respuesta de consulta Davivienda
              </h1>
              <h2>{`Valor de pago minimo: ${formatMoney.format(
                datosConsulta.valPagoMinimo
              )}`}</h2>
              <h2>{`Valor de pago total: ${formatMoney.format(
                datosConsulta.valPagoTotal
              )}`}</h2>
              <Select
                id='tipoAbono'
                name='tipoAbono'
                label='Indique el tipo de abono'
                options={{
                  "": "",
                  "Valor mínimo": "0001",
                  "Valor total": "0002",
                  ...(datosConsulta.valIndAbonoExtraordinario === "N" && {
                    "Disminución de cuota": "0003",
                    "Adelanto de cuota": "0004",
                    "Abono a capital": "0005",
                    "Indicador extraordinario": "0006",
                    Otro: "0006",
                  }),
                }}
                value={tipoAbono?.tipoAbonoId}
                onChange={(e) =>
                  setTipoAbono((old) => {
                    return {
                      ...old,
                      tipoAbonoId: e.target.value,
                      tipoAbonoNombre:
                        e.target.options[e.target.selectedIndex].text,
                    };
                  })
                }
                required
              />
              {(tipoAbono.tipoAbonoId === "0003" ||
                tipoAbono.tipoAbonoId === "0004" ||
                tipoAbono.tipoAbonoId === "0005" ||
                tipoAbono.tipoAbonoId === "0006") && (
                <MoneyInput
                  id='valorAbono'
                  label='Valor abono'
                  type='text'
                  autoComplete='off'
                  value={tipoAbono.valorAbono}
                  onInput={(e, valor) =>
                    setTipoAbono((old) => {
                      return {
                        ...old,
                        valorAbono: valor,
                      };
                    })
                  }
                />
              )}
              <ButtonBar>
                <Button type='submit' onClick={peticionIntermedia}>
                  Aceptar
                </Button>
                <Button onClick={hideModal}>Cancelar</Button>
              </ButtonBar>
            </>
          )}
          {peticion === 3 && (
            <>
              <h1 className='text-2xl font-semibold'>
                ¿Esta seguro de realizar el pago del producto de crédito?
              </h1>
              <h2>{`Número de documento: ${datosTrans.numeroIdentificacion}`}</h2>
              <h2>{`Tipo de documento: ${datosTrans.nombreTipoIdentificacion}`}</h2>
              <h2>{`Producto: ${datosTrans.nombreProducto}`}</h2>
              <h2>{`Número producto: ${tipoAbono.tipoAbonoNombre}`}</h2>
              <h2>{`Valor a pagar: ${formatMoney.format(
                tipoAbono.tipoAbonoId === "0001"
                  ? datosConsulta.valPagoMinimo
                  : tipoAbono.tipoAbonoId === "0002"
                  ? datosConsulta.valPagoTotal
                  : tipoAbono.valorAbono
              )}`}</h2>

              <ButtonBar>
                <Button type='submit' onClick={peticionPagoPropios}>
                  Aceptar
                </Button>
                <Button onClick={hideModal}>Cancelar</Button>
              </ButtonBar>
            </>
          )}
          {peticion === 4 && (
            <>
              <h2>
                <ButtonBar>
                  <Button
                    type='submit'
                    onClick={() => {
                      hideModal();
                    }}>
                    Aceptar
                  </Button>
                  <Button onClick={handlePrint}>Imprimir</Button>
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
  );
};

export default PagoDeProductosPropios;
