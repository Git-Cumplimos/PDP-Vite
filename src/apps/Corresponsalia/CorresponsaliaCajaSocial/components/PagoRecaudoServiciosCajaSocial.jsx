import { useCallback, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { useAuth } from "../../../../hooks/AuthHooks";
import { useFetch } from "../../../../hooks/useFetch";
import { fetchCustom } from "../utils/fetchCajaSocial";
import { notifyError, notifyPending } from "../../../../utils/notify";
import Form from "../../../../components/Base/Form";
import Fieldset from "../../../../components/Base/Fieldset";
import Input from "../../../../components/Base/Input";
import MoneyInput, {
  formatMoney,
} from "../../../../components/Base/MoneyInput";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import Modal from "../../../../components/Base/Modal";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import { useReactToPrint } from "react-to-print";
import { useFetchCajaSocial } from "../hooks/fetchCajaSocial";
import { enumParametrosCajaSocial } from "../utils/enumParametrosCreditosPdp";
import TicketsCajaSocial from "./TicketsCajaSocial";

const URL_CONSULTA_RECAUDO = `${process.env.REACT_APP_URL_CORRESPONSALIA_CAJA_SOCIAL}/recaudo-servicios-caja-social/consulta-recaudo-servicios`;
const URL_PAGO_RECAUDO_CAJA_SOCIAL = `${process.env.REACT_APP_URL_CORRESPONSALIA_CAJA_SOCIAL}/recaudo-servicios-caja-social/recaudo-servicios`;
const URL_CONSULTA_ESTADO_PAGO_RECAUDO = `${process.env.REACT_APP_URL_CORRESPONSALIA_CAJA_SOCIAL}/recaudo-servicios-caja-social/consulta-estado-recaudo-servicios`;

const DATA_RECAUDO_INIT = {
  codigoConvenio: "",
  nombreConvenio: "",
  ref1: "",
  ref2: "",
  ref3: "",
  valorTrx: 0,
  ref1Validacion: "",
  ref2Validacion: "",
  ref3Validacion: "",
  valorTrxValidacion: 0,
  valorTrxOriginal: 0,
  fechaCaducidad: "",
};

const PagoRecaudoServiciosCajaSocial = ({
  convenio,
  dataCodigoBarras,
  tipoRecaudo = "manual",
}) => {
  const uniqueId = v4();
  const validNavigate = useNavigate();
  const [dataRecaudo, setDataRecaudo] = useState(DATA_RECAUDO_INIT);
  const [objTicketActual, setObjTicketActual] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [stateTicketTrx, setStateTicketTrx] = useState(false);
  const [estadoPeticion, setEstadoPeticion] = useState("hidden");
  const [resConsulta, setResConsulta] = useState({});
  const { roleInfo, pdpUser } = useAuth();
  const printDiv = useRef();
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const [loadingPeticionPagoRecaudo, peticionPagoRecaudo] = useFetchCajaSocial(
    URL_PAGO_RECAUDO_CAJA_SOCIAL,
    URL_CONSULTA_ESTADO_PAGO_RECAUDO,
    "Pago recaudo servicios"
  );
  const [loadingPeticionConsultaRecaudo, peticionConsultaRecaudo] = useFetch(
    fetchCustom(URL_CONSULTA_RECAUDO, "POST", "Consulta recaudo servicios")
  );
  useEffect(() => {
    if (tipoRecaudo === "manual") {
      setDataRecaudo((old) => ({
        ...old,
        codigoConvenio: convenio.pk_convenios,
        nombreConvenio: convenio.nombre_convenio,
      }));
    } else {
      setDataRecaudo((old) => ({
        ...old,
        codigoConvenio: convenio.pk_convenios,
        nombreConvenio: convenio.nombre_convenio,
        ref1: dataCodigoBarras.codigos_referencia[0] ?? "",
        ref2: dataCodigoBarras.codigos_referencia[1] ?? "",
        ref3: dataCodigoBarras.codigos_referencia[2] ?? "",
        valorTrxOriginal: dataCodigoBarras.pago[0] ?? 0,
        valorTrx: dataCodigoBarras.pago[0] ?? 0,
        fechaCaducidad: dataCodigoBarras.fecha_caducidad[0] ?? "",
      }));
    }
  }, [convenio, dataCodigoBarras, tipoRecaudo]);

  const transaccionRecaudoServiciosCajaSocial = useCallback(
    (ev) => {
      ev.preventDefault();
      if (
        tipoRecaudo === "manual" &&
        estadoPeticion === "hidden" &&
        convenio.tipo_recaudo === "01"
      ) {
        setEstadoPeticion("validate");
        setShowModal(true);
        return;
      }
      if (
        tipoRecaudo === "manual" &&
        estadoPeticion === "validate" &&
        convenio.tipo_recaudo === "01"
      ) {
        for (let i = 0; i < 3; i++) {
          if (dataRecaudo[`ref${i}`] !== dataRecaudo[`ref${i}Validacion`]) {
            return notifyError(
              "Error: Los valores de las referencias son diferentes"
            );
          }
        }
        if (dataRecaudo.valorTrx !== dataRecaudo.valorTrxValidacion) {
          return notifyError("Error: El valor de la transacción es diferente");
        }
        pagoRecaudoServicios(ev);
      }
      if (
        tipoRecaudo === "codigoBarras" &&
        estadoPeticion === "hidden" &&
        convenio.tipo_recaudo === "01"
      ) {
        setEstadoPeticion("validatePayment");
        setShowModal(true);
        return;
      }
      consultaRecaudoServicios(ev);
    },
    [dataRecaudo, pdpUser, roleInfo]
  );
  const consultaRecaudoServicios = useCallback(
    (ev) => {
      ev.preventDefault();
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: dataRecaudo?.valorTrx,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        location: {
          address: roleInfo?.["direccion"],
          dane_code: roleInfo?.codigo_dane,
          city: roleInfo?.["ciudad"],
        },
        recaudo_servicios_caja_social: {
          codigo_convenio: dataRecaudo?.codigoConvenio,
          referencias: [
            ...Array(parseInt(convenio.cant_referencias)).keys(),
          ].map((i) => ({
            name: convenio?.[`nom_ref${i + 1}`],
            value: dataRecaudo?.[`ref${i + 1}`],
          })),
          flag_otro_valor: false,
          tipo_convenio_recaudo: convenio.tipo_recaudo,
          nombre_convenio: dataRecaudo?.nombreConvenio,
        },
        id_user_pdp: pdpUser.uuid,
      };
      notifyPending(
        peticionConsultaRecaudo({}, data),
        {
          render: () => {
            return "Procesando consulta";
          },
        },
        {
          render: ({ data: res }) => {
            console.log(res?.obj);
            setShowModal(true);
            setResConsulta(res?.obj);
            setEstadoPeticion("response");
            return res?.msg ?? "Consulta satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            validNavigate(-1);
            return error?.message ?? "Consulta fallida";
          },
        }
      );
    },
    [pdpUser, dataRecaudo, roleInfo, resConsulta]
  );
  const pagoRecaudoServicios = useCallback(
    (ev) => {
      ev.preventDefault();
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: dataRecaudo?.valorDeposito,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
          id_uuid_trx: uniqueId,
        },
        location: {
          address: roleInfo?.["direccion"],
          dane_code: roleInfo?.codigo_dane,
          city: roleInfo?.["ciudad"],
        },
        deposito_caja_social: {
          numero_cuenta: dataRecaudo?.numeroCuenta,
          nom_cliente: resConsulta?.trn?.personName?.fullName,
        },
        id_trx: resConsulta?.id_trx,
        id_user_pdp: pdpUser.uuid,
      };
      const dataAditional = {
        id_uuid_trx: uniqueId,
      };
      notifyPending(
        peticionPagoRecaudo(data, dataAditional),
        {
          render: () => {
            return "Procesando pago";
          },
        },
        {
          render: ({ data: res }) => {
            const dataTemp = res.obj;
            setObjTicketActual(dataTemp.ticket ?? {});
            setEstadoPeticion(1);
            setStateTicketTrx(true);
            return "Pago satisfactorio";
          },
        },
        {
          render: ({ data: error }) => {
            if (error.hasOwnProperty("optionalObject")) {
              if (error.optionalObject.hasOwnProperty("ticket")) {
                setObjTicketActual(error.optionalObject.ticket ?? {});
                setEstadoPeticion(1);
                setStateTicketTrx(false);
              } else validNavigate(-1);
            } else validNavigate(-1);
            return error?.message ?? "Pago fallido";
          },
        }
      );
    },
    [pdpUser, dataRecaudo, roleInfo, resConsulta]
  );
  const onChangeFormat = useCallback((ev) => {
    let value = ev.target.value;
    if (ev.target.name === "numeroCuenta") {
      if (!isNaN(value)) {
        value = value.replace(/[\s\.\-+eE]/g, "");
        setDataRecaudo((old) => {
          return { ...old, [ev.target.name]: value };
        });
      }
    } else
      setDataRecaudo((old) => {
        return { ...old, [ev.target.name]: value };
      });
  }, []);
  const onChangeFormatNum = useCallback((ev, val) => {
    if (!isNaN(val)) {
      setDataRecaudo((old) => {
        return { ...old, [ev.target.name]: val };
      });
    }
  }, []);
  const closeModule = useCallback(() => {
    setDataRecaudo(DATA_RECAUDO_INIT);
    setShowModal(false);
    setEstadoPeticion("hidden");
    notifyError("Pago cancelado por el usuario");
  }, []);
  const renderReferences = (ingressType = "initial") =>
    [...Array(parseInt(convenio.cant_referencias)).keys()].map((i) => (
      <Input
        id={ingressType === "initial" ? `ref${i + 1}` : `ref${i + 1}Validacion`}
        name={
          ingressType === "initial" ? `ref${i + 1}` : `ref${i + 1}Validacion`
        }
        label={convenio?.[`nom_ref${i + 1}`] ?? ""}
        type="text"
        autoComplete="off"
        minLength={1}
        maxLength={32}
        value={
          ingressType === "initial"
            ? dataRecaudo?.[`ref${i + 1}`]
            : dataRecaudo?.[`ref${i + 1}Validacion`]
        }
        onChange={onChangeFormat}
        disabled={
          loadingPeticionPagoRecaudo ||
          loadingPeticionConsultaRecaudo ||
          tipoRecaudo !== "manual"
        }
        required
        key={i}
      />
    ));
  // const referencias = useMemo(() => {
  //   let obj = {}
  //   for (let i = 1; i <= parseInt(convenio.cant_referencias); i++) {
  //     obj = {...obj,[convenio?.[`nom_ref${i}`]]:}
  //   }
  // }, [second])
  return (
    <>
      <Form onSubmit={transaccionRecaudoServiciosCajaSocial} grid>
        <Fieldset legend="Datos del recaudo" className="lg:col-span-2">
          <Input
            id="nombreConvenio"
            name="nombreConvenio"
            label={"Convenio"}
            type="text"
            autoComplete="off"
            value={dataRecaudo?.nombreConvenio}
            onChange={() => {}}
            disabled
            required
          />
          <Input
            id="codigoConvenio"
            name="codigoConvenio"
            label={"Código convenio"}
            type="text"
            autoComplete="off"
            value={dataRecaudo?.codigoConvenio}
            onChange={() => {}}
            disabled
            required
          />
          {renderReferences("initial")}
          {tipoRecaudo === "codigoBarras" &&
            dataCodigoBarras.pago.length > 0 && (
              <MoneyInput
                id="valorTrxOriginal"
                name="valorTrxOriginal"
                label={"Valor a pagar original"}
                type="tel"
                maxLength={10}
                autoComplete="off"
                value={dataRecaudo?.valorTrxOriginal ?? 0}
                onInput={() => {}}
                disabled
                required
                equalError={false}
                equalErrorMin={false}
              />
            )}
          {convenio.permite_modificar_valor === "1" && (
            <MoneyInput
              id="valorTrx"
              name="valorTrx"
              label={"Valor a pagar"}
              type="tel"
              maxLength={10}
              autoComplete="off"
              min={enumParametrosCajaSocial?.MIN_RECAUDO_SERVICIOS_CAJA_SOCIAL}
              max={enumParametrosCajaSocial?.MAX_RECAUDO_SERVICIOS_CAJA_SOCIAL}
              value={dataRecaudo?.valorTrx ?? 0}
              onInput={onChangeFormatNum}
              disabled={
                loadingPeticionPagoRecaudo || loadingPeticionConsultaRecaudo
              }
              required
              equalError={false}
              equalErrorMin={false}
            />
          )}
        </Fieldset>
        <ButtonBar className="lg:col-span-2">
          <Button
            type="button"
            onClick={(e) => {
              closeModule(e);
              validNavigate(-1);
            }}
            disabled={
              loadingPeticionPagoRecaudo || loadingPeticionConsultaRecaudo
            }
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={
              loadingPeticionPagoRecaudo || loadingPeticionConsultaRecaudo
            }
          >
            {convenio.tipo_recaudo === "01"
              ? "Realizar pago"
              : "Realizar consulta"}
          </Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} className="flex align-middle">
        <>
          {estadoPeticion === "validate" ? (
            <PaymentSummary
              title="Ingrese nuevamente los datos de la transacción"
              subtitle=""
              summaryTrx={{}}
            >
              <Form
                onSubmit={transaccionRecaudoServiciosCajaSocial}
                grid={false}
              >
                {renderReferences("validate")}
                <MoneyInput
                  id="valorTrxValidacion"
                  name="valorTrxValidacion"
                  label={"Valor a pagar"}
                  type="tel"
                  // minLength={5}
                  maxLength={10}
                  autoComplete="off"
                  min={
                    enumParametrosCajaSocial?.MIN_RECAUDO_SERVICIOS_CAJA_SOCIAL
                  }
                  max={
                    enumParametrosCajaSocial?.MAX_RECAUDO_SERVICIOS_CAJA_SOCIAL
                  }
                  value={dataRecaudo?.valorTrxValidacion ?? 0}
                  onInput={onChangeFormatNum}
                  disabled={
                    loadingPeticionPagoRecaudo || loadingPeticionConsultaRecaudo
                  }
                  required
                  equalError={false}
                  equalErrorMin={false}
                />
                <ButtonBar className="lg:col-span-2">
                  <Button
                    type="button"
                    onClick={(e) => {
                      closeModule(e);
                      validNavigate(-1);
                    }}
                    disabled={
                      loadingPeticionPagoRecaudo ||
                      loadingPeticionConsultaRecaudo
                    }
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      loadingPeticionPagoRecaudo ||
                      loadingPeticionConsultaRecaudo
                    }
                  >
                    {convenio.tipo_recaudo === "01"
                      ? "Realizar pago"
                      : "Realizar consulta"}
                  </Button>
                </ButtonBar>
              </Form>
            </PaymentSummary>
          ) : estadoPeticion === "validatePayment" ? (
            <PaymentSummary
              title="¿Está seguro de realizar el pago?"
              subtitle="Resumen de transacción"
              summaryTrx={{
                Convenio: dataRecaudo?.nombreConvenio ?? "",
                ...Object.fromEntries(
                  [...Array(parseInt(convenio.cant_referencias)).keys()].map(
                    (i) => [
                      convenio?.[`nom_ref${i + 1}`],
                      dataRecaudo?.[`ref${i + 1}`],
                    ]
                  )
                ),
                "Valor a pagar": formatMoney.format(dataRecaudo?.valorTrx),
              }}
            >
              <ButtonBar>
                <Button
                  onClick={(e) => {
                    closeModule(e);
                    validNavigate(-1);
                  }}
                  disabled={
                    loadingPeticionPagoRecaudo || loadingPeticionConsultaRecaudo
                  }
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={pagoRecaudoServicios}
                  disabled={
                    loadingPeticionPagoRecaudo || loadingPeticionConsultaRecaudo
                  }
                >
                  Realizar pago
                </Button>
              </ButtonBar>
            </PaymentSummary>
          ) : estadoPeticion === "response" ? (
            <PaymentSummary
              title="Respuesta de consulta depósito"
              subtitle="Resumen de transacción"
              summaryTrx={{
                "Nombres titular": resConsulta?.trn?.personName?.fullName ?? "",
                "Número de cuenta": dataRecaudo?.numeroCuenta,
                "Valor a depositar": formatMoney.format(
                  dataRecaudo?.valorDeposito
                ),
              }}
            >
              <ButtonBar>
                <Button
                  onClick={closeModule}
                  disabled={
                    loadingPeticionPagoRecaudo || loadingPeticionConsultaRecaudo
                  }
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={pagoRecaudoServicios}
                  disabled={
                    loadingPeticionPagoRecaudo || loadingPeticionConsultaRecaudo
                  }
                >
                  Realizar depósito
                </Button>
              </ButtonBar>
            </PaymentSummary>
          ) : estadoPeticion === "ticket" ? (
            <div className="flex flex-col justify-center items-center">
              <TicketsCajaSocial
                stateTrx={stateTicketTrx}
                ticket={objTicketActual}
                refPrint={printDiv}
              />
              <h2>
                <ButtonBar>
                  <Button onClick={handlePrint}>Imprimir</Button>
                  <Button
                    type="submit"
                    onClick={() => {
                      validNavigate(-1);
                    }}
                  >
                    Aceptar
                  </Button>
                </ButtonBar>
              </h2>
            </div>
          ) : (
            <></>
          )}
        </>
      </Modal>
    </>
  );
};

export default PagoRecaudoServiciosCajaSocial;
