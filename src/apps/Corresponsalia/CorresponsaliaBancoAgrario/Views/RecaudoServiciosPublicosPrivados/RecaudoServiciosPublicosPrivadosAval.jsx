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
import Tickets from "../../../../../components/Base/Tickets";
import { useAuth } from "../../../../../hooks/AuthHooks";
import useMoney from "../../../../../hooks/useMoney";
import { notify, notifyError } from "../../../../../utils/notify";
import {
  postConsultaConveniosAval,
  postConsultaTablaConveniosEspecifico,
  postRecaudoConveniosAval,
  postRecaudoConveniosDavivienda,
} from "../../utils/fetchRecaudoServiciosPublicosPrivados";

const RecaudoServiciosPublicosPrivadosAgrario = () => {
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
    valorConst: "",
    valorVar: "",
  });
  const [objTicketActual, setObjTicketActual] = useState({
    title: "Recibo de Pago de Recaudo de Facturas Banco de Occidente",
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
    disclamer:
      "Corresponsal bancario para Banco de Occidente. La impresión de este tiquete implica su aceptación. Verifique la información. Este es el único recibo oficial de pago. Requerimientos 01 8000 514652 Opción X",
  });
  const [datosConsulta, setDatosConsulta] = useState({});
  const [isUploading, setIsUploading] = useState(true);
  const [convenio, setConvenio] = useState([]);
  useEffect(() => {
    if (state?.id) {
      fecthTablaConveniosEspecificoFunc();
    } else {
      navigate("../");
    }
  }, [state?.id]);

  const fecthTablaConveniosEspecificoFunc = () => {
    postConsultaTablaConveniosEspecifico({
      pk_convenios_recaudo_aval: state?.id,
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
    // setShowModal((old) => ({ ...old, showModal: true }));
    setIsUploading(true);
    postConsultaConveniosAval({
      oficina_propia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ? true : false,
      valor_total_trx: datosTrans.valor !== "" ? datosTrans.valor : 0,
      nombre_comercio: roleInfo?.["nombre comercio"],
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
      },
      recaudoAval: {
        numeroConvenio: convenio.nura,
        valReferencia1: datosTrans.ref1,
        location: {
          address: roleInfo?.["direccion"],
          dane_code: roleInfo?.codigo_dane,
          city: roleInfo?.["ciudad"],
        },
      },
    })
      .then((res) => {
        if (res?.status) {
          setIsUploading(false);
          notify(res?.msg);
          setShowModal((old) => ({ ...old, showModal: true }));
          setDatosConsulta(res?.obj);
          setDatosTrans((old) => ({
            ...old,
            valorConst: formatMoney.format(res?.obj?.valorTrx) ?? "",
            valorVar: res?.obj?.valorTrx,
          }));
        } else {
          setIsUploading(false);
          notifyError(res?.msg);
        }
      })
      .catch((err) => {
        setIsUploading(false);
        notifyError("No se ha podido conectar al servidor");
        handleClose();
        console.error(err);
      });
  };
  const onSubmitValidacion = (e) => {
    e.preventDefault();
    let valorTransaccion = parseInt(datosTrans?.valorVar) ?? 0;
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
    objTicket["trxInfo"].push(["Convenio", convenio.convenio]);
    objTicket["trxInfo"].push(["", ""]);
    // objTicket["trxInfo"].push(["Código convenio", convenio.nura]);
    // objTicket["trxInfo"].push(["", ""]);
    objTicket["trxInfo"].push(["No factura", datosTrans?.ref1 ?? ""]);
    objTicket["trxInfo"].push(["", ""]);
    objTicket["trxInfo"].push([
      "Valor factura",
      formatMoney.format(valorTransaccion ?? "0"),
    ]);
    objTicket["trxInfo"].push(["", ""]);
    setIsUploading(true);
    postRecaudoConveniosAval({
      oficina_propia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ? true : false,
      valor_total_trx: valorTransaccion,
      nombre_comercio: roleInfo?.["nombre comercio"],
      ticket: objTicket,
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
      },
      recaudoAval: {
        pila: datosConsulta?.["pila"] ?? "",
        54: datosConsulta?.tipoRecaudo?.["54"] ?? "",
        62: datosConsulta?.tipoRecaudo?.["62"] ?? "",
        103: datosConsulta?.tipoRecaudo?.["103"] ?? "",
        104: datosConsulta?.tipoRecaudo?.["104"] ?? "",
        location: {
          address: roleInfo?.["direccion"],
          dane_code: roleInfo?.codigo_dane,
          city: roleInfo?.["ciudad"],
        },
      },
    })
      .then((res) => {
        if (res?.status) {
          setIsUploading(false);
          notify(res?.msg);
          objTicket["commerceInfo"].push([
            "No. de aprobación Banco",
            res?.obj?.codigo_autorizacion,
          ]);
          objTicket["commerceInfo"].push(["", ""]);
          objTicket["commerceInfo"].push([
            "No. de aprobación PDP",
            res?.obj?.id_trx,
          ]);
          objTicket["commerceInfo"].push(["", ""]);

          setObjTicketActual(objTicket);
          setShowModal((old) => ({ ...old, estadoPeticion: 3 }));
        } else {
          setIsUploading(false);
          notifyError(res?.msg);
          handleClose();
        }
      })
      .catch((err) => {
        setIsUploading(false);
        notifyError("No se ha podido conectar al servidor");
        handleClose();
        console.error(err);
      });
  };
  const handleClose = useCallback(() => {
    setShowModal((old) => ({ ShowModal: false, estadoPeticion: 0 }));
    setDatosTrans((old) => ({
      ...old,
      ref1: "",
      ref2: "",
      valor: "",
      valorConst: "",
      valorVar: "",
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
        return { ...old, valor: num };
      });
    }
  };
  const onChangeMoney = useMoney({
    limits: [0, 20000000],
    decimalDigits: 2,
  });
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl text-center mb-10 mt-5'>
        Recaudo servicios públicos y privados
      </h1>
      <h1 className='text-2xl text-center mb-10'>{`Convenio: ${
        convenio?.convenio ?? ""
      }`}</h1>

      <Form onSubmit={onSubmit}>
        <Input
          id='ref1'
          label='Referencia 1'
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
        {convenio?.parciales === "1" && (
          <MoneyInput
            id='valCashOut'
            name='valCashOut'
            label='Valor a pagar'
            type='text'
            autoComplete='off'
            maxLength={"15"}
            value={datosTrans.valor ?? ""}
            onInput={onChangeMoneyLocal}
            required></MoneyInput>
        )}
        <ButtonBar>
          <Button type='submit'>Realizar consulta</Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={handleClose}>
        <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
          {estadoPeticion === 0 ? (
            <>
              <h1 className='text-2xl text-center mb-5 font-semibold'>
                Resultado consulta
              </h1>
              <h2>{`Nombre convenio: ${convenio?.convenio}`}</h2>
              <h2>{`Número convenio: ${convenio?.nura}`}</h2>
              <h2>{`Referencia 1: ${datosTrans.ref1}`}</h2>
              <h2 className='text-base'>
                {`Valor consultado: ${formatMoney.format(
                  datosConsulta?.valorTrx ?? "0"
                )} `}
              </h2>
              {convenio?.parciales === "1" && (
                <Form grid onSubmit={onSubmitValidacion}>
                  <Input
                    id='valor'
                    name='valor'
                    label='Valor a pagar'
                    autoComplete='off'
                    type='tel'
                    minLength={"2"}
                    maxLength={"20"}
                    defaultValue={datosTrans.valorConst ?? ""}
                    onInput={(ev) =>
                      setDatosTrans((old) => ({
                        ...old,
                        valorConst: onChangeMoney(ev),
                        valorVar: onChangeMoney(ev),
                      }))
                    }
                    required
                  />
                </Form>
              )}
              <ButtonBar>
                <Button onClick={handleClose}>Cancelar</Button>
                <Button type='submit' onClick={onSubmitValidacion}>
                  Realizar pago
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
                      navigate(-1);
                    }}>
                    Aceptar
                  </Button>
                </ButtonBar>
              </h2>
              <Tickets ticket={objTicketActual} refPrint={printDiv}></Tickets>
            </>
          ) : (
            <></>
          )}
        </div>
      </Modal>
    </>
  );
};

export default RecaudoServiciosPublicosPrivadosAgrario;