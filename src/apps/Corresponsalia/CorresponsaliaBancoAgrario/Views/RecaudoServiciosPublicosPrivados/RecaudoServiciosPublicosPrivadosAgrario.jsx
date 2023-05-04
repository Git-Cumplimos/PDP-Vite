import { Fragment, useCallback, useEffect, useRef, useState } from "react";
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
import { checkLuhn } from "../../../../../utils/validationUtils";
import TicketsAgrario from "../../components/TicketsBancoAgrario/TicketsAgrario";
import { enumParametrosBancoAgrario } from "../../utils/enumParametrosBancoAgrario";
import {
  postConsultaTablaConveniosEspecifico,
  postRecaudoConveniosAgrario,
} from "../../utils/fetchRecaudoServiciosPublicosPrivados";

const RecaudoServiciosPublicosPrivadosAgrario = () => {
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
    ref3: "",
    valor: 0,
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
      "En caso de reclamo o inquietud favor comunicarse en Bogota al Tel 594-8500 o gratis en el resto del pais al 01800-915000 o la pagina web http://www.bancoagrario.gov.co",
  });
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
      if (!checkLuhn(datosTrans?.ref1))
        return notifyError("Validación de la referencia 1 erronea");
    }
    if (convenio?.algoritmo_ref2?.match(/(Q 108)/g)) {
      if (!checkLuhn(datosTrans?.ref2))
        return notifyError("Validación de la referencia 2 erronea");
    }
    if (convenio?.algoritmo_ref3?.match(/(Q 108)/g)) {
      if (!checkLuhn(datosTrans?.ref3))
        return notifyError("Validación de la referencia 3 erronea");
    }

    // setIsUploading(true);
    setShowModal((old) => ({ ...old, showModal: true }));
  };
  const onSubmitValidacion = (e) => {
    e.preventDefault();
    let valorTransaccion = parseInt(datosTrans?.valor) ?? 0;
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
    objTicket["trxInfo"].push(["Convenio", convenio.nombre_convenio]);
    objTicket["trxInfo"].push(["", ""]);
    // objTicket["trxInfo"].push(["Código convenio", convenio.nura]);
    // objTicket["trxInfo"].push(["", ""]);
    objTicket["trxInfo"].push(["Referencia de pago 1", datosTrans?.ref1 ?? ""]);
    objTicket["trxInfo"].push(["", ""]);
    let objRecaudo = {
      nombreConvenio: convenio?.nombre_convenio,
      codigoConvenio: convenio?.codigo,
      referencia1: datosTrans?.ref1,
    };
    if (convenio?.nombre_ref2 !== "" && !convenio?.nombre_ref2?.match(/-/g)) {
      objTicket["trxInfo"].push([
        "Referencia de pago 2",
        datosTrans?.ref2 ?? "",
      ]);
      objTicket["trxInfo"].push(["", ""]);
      objRecaudo["referencia2"] = datosTrans?.ref2;
    }
    if (convenio?.nombre_ref3 !== "" && !convenio?.nombre_ref3?.match(/-/g)) {
      objTicket["trxInfo"].push([
        "Referencia de pago 3",
        datosTrans?.ref3 ?? "",
      ]);
      objTicket["trxInfo"].push(["", ""]);
      objRecaudo["referencia3"] = datosTrans?.ref3;
    }
    objTicket["trxInfo"].push([
      "Valor",
      formatMoney.format(valorTransaccion ?? "0"),
    ]);
    objTicket["trxInfo"].push(["", ""]);
    setIsUploading(true);

    postRecaudoConveniosAgrario({
      oficina_propia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
        roleInfo?.tipo_comercio === "KIOSCO"
          ? true
          : false,
      valor_total_trx: valorTransaccion,
      nombre_comercio: roleInfo?.["nombre comercio"],
      nombre_usuario: pdpUser?.uname ?? "",
      ticket: objTicket,
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
      },
      recaudoAgrario: {
        ...objRecaudo,
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
      valor: 0,
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
        {convenio?.nombre_ref2 &&
          convenio?.nombre_ref2 !== "" &&
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
        {convenio?.nombre_ref3 &&
          convenio?.nombre_ref3 !== "" &&
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
        <MoneyInput
          id='valCashOut'
          name='valCashOut'
          label='Valor a pagar'
          type='text'
          min={enumParametrosBancoAgrario.minRecaudo}
          max={enumParametrosBancoAgrario.maxRecaudo}
          autoComplete='off'
          maxLength={"12"}
          value={parseInt(datosTrans.valor)}
          onInput={(e, val) => {
            setDatosTrans((old) => {
              return { ...old, valor: val };
            });
          }}
          required
        />
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
              <h2>{`Nombre convenio: ${convenio?.nombre_convenio}`}</h2>
              <h2>{`Número convenio: ${convenio?.codigo}`}</h2>
              {convenio?.nombre_ref1 !== "" &&
                !convenio?.nombre_ref1?.match(/-/g) && (
                  <h2>{`Referencia 1: ${datosTrans.ref1}`}</h2>
                )}
              {convenio?.nombre_ref2 &&
                convenio?.nombre_ref2 !== "" &&
                !convenio?.nombre_ref2?.match(/-/g) && (
                  <h2>{`Referencia 2: ${datosTrans.ref2}`}</h2>
                )}
              {convenio?.nombre_ref3 &&
                convenio?.nombre_ref3 !== "" &&
                !convenio?.nombre_ref3?.match(/-/g) && (
                  <h2>{`Referencia 3: ${datosTrans.ref3}`}</h2>
                )}
              <h2 className='text-base'>
                {`Valor a pagar: ${formatMoney.format(
                  datosTrans.valor ?? "0"
                )} `}
              </h2>
              <>
                <ButtonBar>
                  <Button
                    onClick={() => {
                      handleClose();
                      notifyError("Transacción cancelada por el usuario");
                    }}>
                    Cancelar
                  </Button>
                  <Button type='submit' onClick={onSubmitValidacion}>
                    Realizar pago
                  </Button>
                </ButtonBar>
              </>
            </>
          ) : estadoPeticion === 1 ? (
            <>
              <TicketsAgrario ticket={objTicketActual} refPrint={printDiv} />
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
