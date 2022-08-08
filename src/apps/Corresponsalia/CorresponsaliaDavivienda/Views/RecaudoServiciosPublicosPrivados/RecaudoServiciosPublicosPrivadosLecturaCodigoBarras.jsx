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
import { useAuth } from "../../../../../hooks/AuthHooks";
import useMoney from "../../../../../hooks/useMoney";
import { makeMoneyFormatter } from "../../../../../utils/functions";
import { notify, notifyError } from "../../../../../utils/notify";
import TicketsDavivienda from "../../components/TicketsDavivienda";
import { postConsultaCodigoBarrasConveniosEspecifico } from "../../utils/fetchRecaudoServiciosPublicosPrivados";

const RecaudoServiciosPublicosPrivadosLecturaCodigoBarras = () => {
  const { roleInfo } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [peticion, setPeticion] = useState(0);
  const formatMoney = makeMoneyFormatter(2);
  const [objTicketActual, setObjTicketActual] = useState({
    title: "Recibo de pago por giro Davivienda CB",
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
      ["Municipio", roleInfo?.ciudad ? roleInfo?.ciudad : "Sin datos"],
      /*direccion*/
      ["Dirección", roleInfo?.direccion ? roleInfo?.direccion : "Sin datos"],
      ["Tipo de operación", "Pago por giro"],
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
    valorSinModificar: "",
    data: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  const onChangeFormat = useCallback((ev) => {
    const valor = ev.target.value;
    setDatosTrans((old) => {
      return { ...old, [ev.target.name]: valor };
    });
    if (valor.slice(0, 4) === "C281") {
      setIsUploading(true);
      fecthTablaConveniosEspecificoFunc(valor);
    }
  }, []);
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const fecthTablaConveniosEspecificoFunc = useCallback((codigoBar) => {
    postConsultaCodigoBarrasConveniosEspecifico({
      codigoBarras: codigoBar,
    })
      .then((autoArr) => {
        if (autoArr?.status) {
          notify(autoArr?.msg);
          console.log(autoArr);
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
          let valorTrx = autoArr?.obj.datosCodigoBarras.pago[0];
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
        }
        setIsUploading(false);
      })
      .catch((err) => {
        setIsUploading(false);
        notifyError("No se ha podido conectar al servidor");
        console.error(err);
      });
  }, []);
  // const handleKeyDown = (e) => {
  //   if (e.key === "Enter") {
  //     console.log("do validate");
  //   }
  // };
  const onSubmit = (e) => {
    e.preventDefault();
    if (datosTrans?.codBarras.slice(0, 4) === "C281") {
      setIsUploading(true);
      fecthTablaConveniosEspecificoFunc(datosTrans?.codBarras);
    } else {
      notifyError("El codigo de barras no tiene el formato correcto");
    }
  };
  const habilitarModal = () => {
    setShowModal(true);
  };

  const hideModal = () => {
    setShowModal(false);
  };
  const onSubmitConfirm = (e) => {
    e.preventDefault();
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
    if (
      datosEnvio?.datosConvenio?.num_ind_consulta_cnb === "0" ||
      datosEnvio?.datosConvenio?.num_ind_consulta_cnb === "3"
    ) {
      console.log("realizar pago");
    } else {
      console.log("realizar consulta");
    }
    setPeticion(1);
    habilitarModal();
  };
  const onSubmitPago = (estado) => (e) => {
    e.preventDefault();
    console.log(estado);
    if (
      datosEnvio?.datosConvenio?.num_ind_consulta_cnb === "0" ||
      datosEnvio?.datosConvenio?.num_ind_consulta_cnb === "3"
    ) {
      console.log("realizar pago");
    } else {
      console.log("realizar consulta");
    }
    setPeticion(2);
    habilitarModal();
  };
  const onChangeMoney = useMoney({
    limits: [0, 20000000],
    decimalDigits: 2,
  });
  const printDiv = useRef();
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl text-center mb-10'>
        Recaudo servicios publicos y privados
      </h1>
      {!datosEnvio.estadoConsulta ? (
        <>
          <h1 className='text-3xl text-center'>Ingrese el código de barras</h1>
          <Form grid onSubmit={onSubmit}>
            <Input
              id='codBarras'
              label='Código de barras'
              type='text'
              name='codBarras'
              required
              value={datosTrans.codBarras}
              autoFocus
              autoComplete='off'
              onInput={onChangeFormat}
              // onKeyDown={handleKeyDown}
            ></Input>
            <ButtonBar className='lg:col-span-2'>
              <Button type='submit'>Realizar consulta</Button>
            </ButtonBar>
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
              datosEnvio?.datosCodigoBarras?.fechaCaducidad?.length > 0 && (
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
            {(datosEnvio?.datosConvenio?.num_ind_consulta_cnb === "0" ||
              datosEnvio?.datosConvenio?.num_ind_consulta_cnb === "3") &&
            datosEnvio?.datosConvenio?.ind_valor_exacto_cnb === "0" ? (
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
                  });
                  setDatosTrans({ codBarras: "" });
                }}>
                Volver a ingresar codigo de barras
              </Button>
              {!datosEnvio.estadoFecha && (
                <Button type='submit'>
                  {datosEnvio?.datosConvenio?.num_ind_consulta_cnb === "0" ||
                  datosEnvio?.datosConvenio?.num_ind_consulta_cnb === "3"
                    ? "Realizar pago"
                    : "Realizar consulta"}
                </Button>
              )}
            </ButtonBar>
          </Form>
          <Modal show={showModal} handleClose={hideModal}>
            <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
              {peticion === 1 && (
                <>
                  <h1 className='text-2xl font-semibold'>
                    {datosEnvio?.datosConvenio?.num_ind_consulta_cnb === "0" ||
                    datosEnvio?.datosConvenio?.num_ind_consulta_cnb === "3"
                      ? "¿Está seguro de realizar el pago?"
                      : "¿Está seguro de realizar la consulta?"}
                  </h1>
                  <h2>{`Convenio: ${
                    datosEnvio?.datosConvenio?.nom_convenio_cnb ?? ""
                  }`}</h2>
                  <h2>{`Valor transacción: ${formatMoney.format(
                    datosTransaccion.valor
                  )}`}</h2>
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
                  <ButtonBar>
                    <Button onClick={hideModal}>Cancelar</Button>
                    <Button type='submit' onClick={onSubmitPago("pago")}>
                      Aceptar
                    </Button>
                  </ButtonBar>
                </>
              )}
              {peticion === 2 && (
                <>
                  <h1 className='text-2xl font-semibold'>
                    Consulta de pago por giro
                  </h1>
                  <h2>{`Valor transacción: ${formatMoney.format()}`}</h2>
                  <ButtonBar>
                    <Button onClick={hideModal}>Cancelar</Button>
                    <Button type='submit' onClick={() => setPeticion(3)}>
                      Aceptar
                    </Button>
                  </ButtonBar>
                </>
              )}
              {peticion === 4 && (
                <>
                  <h2>
                    <ButtonBar>
                      <Button onClick={handlePrint}>Imprimir</Button>
                      <Button type='submit' onClick={hideModal}>
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
