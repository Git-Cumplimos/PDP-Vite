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
    ref3: "",
    valor: "",
    valorConst: "",
    valorVar: "",
  });
  const [objTicketActual, setObjTicketActual] = useState({
    title: "Recibo de Pago",
    timeInfo: {
      "Fecha de pago": "",
      Hora: "",
    },
    commerceInfo: [
      /*id transaccion recarga*/
      /*comercio*/
      [
        "Comercio",
        roleInfo?.["nombre comercio"]
          ? roleInfo?.["nombre comercio"]
          : "Sin datos",
      ],
      /*id_dispositivo*/
      ["No. Terminal", roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 0],
      /*direccion*/
      ["Dirección", roleInfo?.direccion ? roleInfo?.direccion : "Sin datos"],
      /*telefono*/
      ["Teléfono", roleInfo?.telefono ? roleInfo?.telefono : "Sin datos"],
    ],
    commerceName: "Recaudo de facturas",
    trxInfo: [],
    disclamer:
      "Corresponsal bancario para Banco de Occidente. La impresión de este tiquete implica su aceptación, verifique la información. Este es el unico recibo oficial de pago. Requerimientos 018000 514652.",
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
      pk_tbl_convenios_banco_agrario: state?.id,
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
    //Valdicacion de luhm
    if (convenio?.algoritmo_ref1?.match(/(Q 108)/g)) {
    }
    if (convenio?.algoritmo_ref2?.match(/(Q 108)/g)) {
    }
    if (convenio?.algoritmo_ref2?.match(/(Q 108)/g)) {
    }

    setIsUploading(true);
    // setShowModal((old) => ({ ...old, showModal: true }));
  };
  const onSubmitValidacion = (e) => {
    e.preventDefault();
    let valorTransaccion = parseInt(datosTrans?.valorVar) ?? 0;
    const fecha = Intl.DateTimeFormat("es-CO", {
      year: "numeric",
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
    objTicket["timeInfo"]["Fecha de pago"] = fecha;
    objTicket["timeInfo"]["Hora"] = hora;
    objTicket["trxInfo"].push(["Convenio", convenio.convenio]);
    objTicket["trxInfo"].push(["", ""]);
    // objTicket["trxInfo"].push(["Código convenio", convenio.nura]);
    // objTicket["trxInfo"].push(["", ""]);
    objTicket["trxInfo"].push(["Referencia de pago", datosTrans?.ref1 ?? ""]);
    objTicket["trxInfo"].push(["", ""]);
    objTicket["trxInfo"].push([
      "Valor",
      formatMoney.format(valorTransaccion ?? "0"),
    ]);
    objTicket["trxInfo"].push(["", ""]);
    setIsUploading(true);
    postRecaudoConveniosAval({
      oficina_propia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
        roleInfo?.tipo_comercio === "KIOSCO"
          ? true
          : false,
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
          objTicket["commerceInfo"].push(["Id Trx", res?.obj?.id_trx]);
          objTicket["commerceInfo"].push([
            "Id Aut",
            res?.obj?.codigo_autorizacion,
          ]);
          objTicket["commerceInfo"].push(["", ""]);

          setObjTicketActual(objTicket);
          setShowModal((old) => ({ ...old, estadoPeticion: 4 }));
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
          /*comercio*/
          [
            "Comercio",
            roleInfo?.["nombre comercio"]
              ? roleInfo?.["nombre comercio"]
              : "Sin datos",
          ],
          /*id_dispositivo*/
          [
            "No. Terminal",
            roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 0,
          ],
          /*direccion*/
          [
            "Dirección",
            roleInfo?.direccion ? roleInfo?.direccion : "Sin datos",
          ],
          /*telefono*/
          ["Teléfono", roleInfo?.telefono ? roleInfo?.telefono : "Sin datos"],
        ],
        trxInfo: [],
      };
    });
    setDatosConsulta({});
  }, []);
  const onChangeFormat = useCallback(
    (ev) => {
      let valor = ev.target.value;
      valor = valor.replace(/[\s\.]/g, "");
      if (ev.target.name === "ref1") {
        if (convenio?.algoritmo_ref1?.match(/(N 010)|(Q 108)/g)) {
          if (isNaN(valor)) {
            valor = datosTrans[ev.target.name];
          }
        }
      }
      if (ev.target.name === "ref2") {
        if (convenio?.algoritmo_ref2?.match(/(N 010)|(Q 108)/g)) {
          if (isNaN(valor)) {
            valor = datosTrans[ev.target.name];
          }
        }
      }
      if (ev.target.name === "ref3") {
        if (convenio?.algoritmo_ref3?.match(/(N 010)|(Q 108)/g)) {
          if (isNaN(valor)) {
            valor = datosTrans[ev.target.name];
          }
        }
      }
      setDatosTrans((old) => {
        return { ...old, [ev.target.name]: valor };
      });
    },
    [convenio, datosTrans]
  );
  const onChangeMoneyLocal = (ev, valor) => {
    if (!isNaN(valor)) {
      const num = valor;
      setDatosTrans((old) => {
        return { ...old, valor: onChangeMoney(ev) };
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
        convenio?.nombre_convenio ?? ""
      }`}</h1>

      <Form
        grid={
          (convenio?.nombre_ref2 !== "" &&
            !convenio?.nombre_ref2?.match(/-/g)) ||
          (convenio?.nombre_ref3 !== "" && !convenio?.nombre_ref3?.match(/-/g))
        }
        onSubmit={onSubmit}>
        {convenio?.nombre_ref1 !== "" &&
          !convenio?.nombre_ref1?.match(/-/g) && (
            <Input
              id='ref1'
              label={convenio?.nombre_ref1}
              type='text'
              name='ref1'
              minLength={convenio?.longitud_min_ref1}
              maxLength={convenio?.longitud_max_ref1}
              required
              value={datosTrans.ref1}
              autoComplete='off'
              onInput={onChangeFormat}></Input>
          )}
        {convenio?.nombre_ref2 !== "" &&
          !convenio?.nombre_ref2?.match(/-/g) && (
            <Input
              id='ref2'
              label={convenio?.nombre_ref2}
              type='text'
              name='ref2'
              minLength={convenio?.longitud_min_ref2}
              maxLength={convenio?.longitud_max_ref2}
              required
              value={datosTrans.ref2}
              autoComplete='off'
              onInput={onChangeFormat}></Input>
          )}
        {convenio?.nombre_ref3 !== "" &&
          !convenio?.nombre_ref3?.match(/-/g) && (
            <Input
              id='ref3'
              label={convenio?.nombre_ref3}
              type='text'
              name='ref3'
              minLength={convenio?.longitud_min_ref3}
              maxLength={convenio?.longitud_max_ref3}
              required
              value={datosTrans.ref3}
              autoComplete='off'
              onInput={onChangeFormat}></Input>
          )}

        {/* {convenio?.parciales === "1" && ( */}
        <MoneyInput
          id='valCashOut'
          name='valCashOut'
          label='Valor a pagar'
          type='text'
          autoComplete='off'
          maxLength={"12"}
          value={datosTrans.valor ?? ""}
          onInput={onChangeMoneyLocal}
          required></MoneyInput>
        {/* )} */}
        <ButtonBar
          className={
            (convenio?.nombre_ref2 !== "" &&
              !convenio?.nombre_ref2?.match(/-/g)) ||
            (convenio?.nombre_ref3 !== "" &&
              !convenio?.nombre_ref3?.match(/-/g))
              ? "lg:col-span-2"
              : ""
          }>
          <Button type='submit'>Realizar pago</Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={handleClose}>
        <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
          {estadoPeticion === 0 ? (
            <>
              <h1 className='text-2xl text-center mb-5 font-semibold'>
                ¿Está seguro de realizar el recaudo?
              </h1>
              <h2>{`Nombre convenio: ${convenio?.convenio}`}</h2>
              <h2>{`Número convenio: ${convenio?.nura}`}</h2>
              <h2>{`Referencia 1: ${datosTrans.ref1}`}</h2>
              <h2 className='text-base'>
                {`Valor a pagar: ${formatMoney.format(
                  datosTrans.valorConst ?? "0"
                )} `}
              </h2>
              <>
                <ButtonBar>
                  <Button onClick={handleClose}>Cancelar</Button>
                  <Button type='submit' onClick={onSubmitValidacion}>
                    Realizar pago
                  </Button>
                </ButtonBar>
              </>
            </>
          ) : estadoPeticion === 4 ? (
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
