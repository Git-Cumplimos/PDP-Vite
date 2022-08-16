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
import { notify, notifyError } from "../../../../../utils/notify";
import TicketsDavivienda from "../../components/TicketsDavivienda";
import {
  postConsultaConveniosDavivienda,
  postConsultaTablaConveniosEspecifico,
  postRecaudoConveniosDavivienda,
} from "../../utils/fetchRecaudoServiciosPublicosPrivados";

const RecaudoServiciosPublicosPrivados = () => {
  const { state } = useLocation();
  const { roleInfo } = useAuth();
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
  const [datosConsulta, setDatosConsulta] = useState({});
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
        console.log(autoArr?.results[0]);
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
    setShowModal((old) => ({ ...old, showModal: true }));
  };
  const onSubmitValidacion = (e) => {
    e.preventDefault();
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
      const hoy = new Date();
      const fecha =
        hoy.getDate() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getFullYear();
      /*hora actual */
      const hora =
        hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getSeconds();
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
        numTipoProductoRecaudo: convenio.tipo_cta_recaudo_cnb,
        numProductoRecaudo: convenio.nro_cta_recaudo_cnb,
        valTipoProdDestinoRecaudoCent: convenio.tipo_cta_destino_cnb,
        valProdDestinoRecaudoCent: convenio.nro_cta_destino_cnb,
        valCodigoIAC: "0",
        valor: datosTransValidacion?.valor ?? "0",
        valReferencia1: datosTransValidacion?.ref1 ?? "",
        valReferencia2: datosTransValidacion?.ref2 ?? "",
        nomConvenio: convenio.nom_convenio_cnb,
        ticket: objTicket,

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
            console.log(res);
          } else {
            setIsUploading(false);
            notifyError(res?.msg);
            handleClose();
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
        tipoTransaccion: "2",
        numNumeroConvenioIAC: convenio.cod_convenio_cnb,
        valReferencia1: datosTransValidacion?.ref1 ?? "",
        valReferencia2: datosTransValidacion?.ref2 ?? "",

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
            console.log("SSSS", res?.obj);
            setDatosConsulta(res?.obj);
            setShowModal((old) => ({ ...old, estadoPeticion: 1 }));
          } else {
            setIsUploading(false);
            notifyError(res?.msg);
            handleClose();
          }
        })
        .catch((err) => {
          setIsUploading(false);
          notifyError("No se ha podido conectar al servidor");
          console.error(err);
        });
    }
  };
  const handleClose = useCallback(() => {
    setDatosTransValidacion((old) => ({
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

    setShowModal((old) => ({ ShowModal: false, estadoPeticion: 0 }));
  }, []);
  const onChangeMoney = (ev, valor) => {
    if (!isNaN(valor)) {
      const num = valor;
      setDatosTrans((old) => {
        return { ...old, valor: num };
      });
    }
  };
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl text-center mb-5'>
        Recaudo servicios publicos y privados
      </h1>
      <h1 className='text-3xl text-center mb-5'>{`Convenio: ${
        convenio?.nom_convenio_cnb ?? ""
      }`}</h1>

      <Form grid onSubmit={onSubmit}>
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
              onInput={(e) => {
                let valor = e.target.value;
                let num = valor.replace(/[\s\.]/g, "");
                setDatosTrans((old) => {
                  return { ...old, ref1: num };
                });
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
            required
            value={datosTrans.ref2}
            onInput={(e) => {
              let valor = e.target.value;
              let num = valor.replace(/[\s\.]/g, "");
              setDatosTrans((old) => {
                return { ...old, ref2: num };
              });
            }}></Input>
        )}
        {dataConveniosPagar.includes(convenio?.num_ind_consulta_cnb) && (
          <MoneyInput
            id='valCashOut'
            name='valCashOut'
            label='Valor'
            type='text'
            autoComplete='off'
            maxLength={"15"}
            value={datosTrans.valor ?? ""}
            onInput={onChangeMoney}
            required></MoneyInput>
        )}
        <ButtonBar className='lg:col-span-2'>
          <Button type='submit'>
            {dataConveniosPagar.includes(convenio?.num_ind_consulta_cnb)
              ? "Realizar pago"
              : "Realizar consulta"}
          </Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={handleClose}>
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
                  value={datosTransValidacion.ref1}
                  onInput={(e) => {
                    let valor = e.target.value;
                    let num = valor.replace(/[\s\.]/g, "");
                    setDatosTransValidacion((old) => {
                      return { ...old, ref1: num };
                    });
                  }}></Input>
              )}
              {convenio?.ctrol_ref2_cnb === "1" && (
                <Input
                  id='ref2'
                  label={convenio?.nom_ref2_cnb}
                  type='text'
                  name='ref2'
                  minLength='1'
                  maxLength='32'
                  required
                  value={datosTransValidacion.ref2}
                  onInput={(e) => {
                    let valor = e.target.value;
                    let num = valor.replace(/[\s\.]/g, "");
                    setDatosTransValidacion((old) => {
                      return { ...old, ref2: num };
                    });
                  }}></Input>
              )}
              {dataConveniosPagar.includes(convenio?.num_ind_consulta_cnb) && (
                <MoneyInput
                  id='valCashOut'
                  name='valCashOut'
                  label='Valor'
                  type='text'
                  autoComplete='off'
                  maxLength={"15"}
                  value={datosTransValidacion.valor ?? ""}
                  onInput={(e, valor) => {
                    if (!isNaN(valor)) {
                      const num = valor;
                      setDatosTransValidacion((old) => {
                        return { ...old, valor: num };
                      });
                    }
                  }}
                  required></MoneyInput>
              )}
              <ButtonBar className='lg:col-span-2'>
                <Button type='button' onClick={handleClose}>
                  cancelar
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
            <h1 className='text-2xl text-center mb-10 font-semibold'>
              Resultado consulta
            </h1>
            {/* <h2 className='text-base'>
                {`Valor de transacción: ${formatMoney.format(
                  // datosTrans.valorCashOut
                )} `}
              </h2> */}
            {/* <h2>{`Número Daviplata: ${datosTrans.numeroTelefono}`}</h2> */}
            {/* <h2>{`Número de otp: ${datosTrans.otp}`}</h2> */}
            <ButtonBar>
              <Button onClick={handleClose}>Cancelar</Button>
              <Button type='submit' onClick={() => {}}>
                Aceptar
              </Button>
            </ButtonBar>
          </>
        ) : estadoPeticion === 2 ? (
          <>
            <h1 className='text-2xl text-center mb-10 font-semibold'>
              ¿Esta seguro de realizar el pago del servicio?
            </h1>
            {/* <h2 className='text-base'>
                {`Valor de transacción: ${formatMoney.format(
                  // datosTrans.valorCashOut
                )} `}
              </h2> */}
            {/* <h2>{`Número Daviplata: ${datosTrans.numeroTelefono}`}</h2> */}
            {/* <h2>{`Número de otp: ${datosTrans.otp}`}</h2> */}
            <ButtonBar>
              <Button onClick={handleClose}>Cancelar</Button>
              <Button type='submit' onClick={() => {}}>
                Aceptar
              </Button>
            </ButtonBar>
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
                  }}>
                  Aceptar
                </Button>
              </ButtonBar>
            </h2>
            <TicketsDavivienda
              ticket={objTicketActual}
              refPrint={printDiv}></TicketsDavivienda>
          </>
        ) : (
          <></>
        )}
      </Modal>
    </>
  );
};

export default RecaudoServiciosPublicosPrivados;
