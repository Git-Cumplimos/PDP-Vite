import { useCallback, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { useAuth } from "../../../../hooks/AuthHooks";
import { useFetch } from "../../../../hooks/useFetch";
import { fetchCustom } from "../utils/fetchItau";
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
import { useFetchItau } from "../hooks/fetchItau";
import { enumParametrosItau } from "../utils/enumParametrosItau";
import TicketsItau from "./TicketsItau/TicketsItau";

const URL_CONSULTA_RECAUDO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/recaudo-servicios-itau/consulta-recaudo-servicios`;
const URL_PAGO_RECAUDO_ITAU = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/recaudo-servicios-itau/recaudo-servicios`;
const URL_CONSULTA_ESTADO_PAGO_RECAUDO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/recaudo-servicios-itau/consulta-estado-recaudo-servicios`;

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

const PagoRecaudoServiciosItau = ({
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

  const [loadingPeticionPagoRecaudo, peticionPagoRecaudo] = useFetchItau(
    URL_PAGO_RECAUDO_ITAU,
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
        codigoConvenio: convenio.codigo_convenio,
        nombreConvenio: convenio.nombre_convenio,
      }));
    } else {
      setDataRecaudo((old) => ({
        ...old,
        codigoConvenio: convenio.codigo_convenio,
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

  const transaccionRecaudoServiciosItau = useCallback(
    (ev) => {
      ev.preventDefault();
      if (
        tipoRecaudo === "manual" &&
        estadoPeticion === "hidden" &&
        convenio.consultaweb === "N"
      ) {
        setEstadoPeticion("validate");
        setShowModal(true);
        return;
      }
      if (
        tipoRecaudo === "manual" &&
        estadoPeticion === "validate" &&
        convenio.consultaweb === "N"
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
        return;
      }
      if (
        tipoRecaudo === "codigoBarras" &&
        estadoPeticion === "hidden" &&
        convenio.consultaweb === "N"
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
      let extraData = {};
      if (
        dataCodigoBarras?.fecha_caducidad?.length &&
        dataCodigoBarras?.fecha_caducidad?.length > 0
      ) {
        extraData["fecha_pago_codigo_barras"] =
          dataCodigoBarras?.fecha_caducidad[0];
      }
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: 0,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        address: roleInfo?.["direccion"],
        dane_code: roleInfo?.codigo_dane,
        city: roleInfo?.["ciudad"],
        Datos: {
          codigo_convenio: dataRecaudo?.codigoConvenio,
          referencia_1: dataRecaudo?.ref1,
          referencia_2: dataRecaudo?.ref2 === "" ? "" : dataRecaudo?.ref2,
          // flag_otro_valor:
          //   dataRecaudo.valorTrxOriginal.toString() !==
          //   dataRecaudo.valorTrx.toString(),
          // tipo_convenio_recaudo: convenio.consultaweb,
          // nombre_convenio: dataRecaudo?.nombreConvenio,
          // ...extraData,
        },
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
            setDataRecaudo((old) => ({
              ...old,
              valorTrx: res?.obj?.amt,
            }));
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
      let valor_send = 0;
      if (
        dataRecaudo?.valorTrxOriginal !== 0 &&
        convenio?.modvalor_consweb === "N" &&
        convenio?.consultaweb === "N"
      ) {
        valor_send = dataRecaudo?.valorTrxOriginal;
      } else if (
        convenio?.modvalor_consweb === "N" &&
        convenio?.consultaweb === "S"
      ) {
        valor_send = parseInt(resConsulta?.amt);
      } else {
        valor_send = parseInt(dataRecaudo?.valorTrx);
      }
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: valor_send,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
          id_uuid_trx: uniqueId,
        },
        address: roleInfo?.["direccion"],
        dane_code: roleInfo?.codigo_dane,
        city: roleInfo?.["ciudad"],
        Datos: {
          codigo_convenio: dataRecaudo?.codigoConvenio,
          nombre_convenio: dataRecaudo?.nombreConvenio,
          referencia_1: dataRecaudo?.ref1,
          referencia_2: dataRecaudo?.ref2 === "" ? "" : dataRecaudo?.ref2,
          refInfoRec: resConsulta?.RecInfoRec ? resConsulta?.RecInfoRec : [],
        },
        id_trx: resConsulta?.id_trx,
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
            setEstadoPeticion("ticket");
            setStateTicketTrx(true);
            return "Pago satisfactorio";
          },
        },
        {
          render: ({ data: error }) => {
            if (error?.cause === "custom") {
              return <p style={{ whiteSpace: "pre-wrap" }}>{error?.message}</p>;
            }
            console.error(error?.message);
            validNavigate(-1);
            return error?.message ?? "Transacción fallida";
          },
        }
      );
    },
    [pdpUser, dataRecaudo, roleInfo, resConsulta]
  );

  const onChangeFormat = useCallback((ev) => {
    let value = ev.target.value;
    if (!isNaN(value)) {
      value = value.replace(/[\s\.\-+eE]/g, "");
      setDataRecaudo((old) => {
        return { ...old, [ev.target.name]: value };
      });
    }
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
    [...Array(parseInt(convenio.referencia_2)).keys()].map((i) => (
      <Input
        id={ingressType === "initial" ? `ref${i + 1}` : `ref${i + 1}Validacion`}
        name={
          ingressType === "initial" ? `ref${i + 1}` : `ref${i + 1}Validacion`
        }
        label={convenio?.[`referencia${i + 1}`] ?? ""}
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

  return (
    <>
      <Form onSubmit={transaccionRecaudoServiciosItau} grid>
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
          {tipoRecaudo === "codigoBarras" && convenio.consultaweb === "N" && (
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
          {convenio.consultaweb === "N" &&
            convenio.modvalor_consweb === "S" &&
            tipoRecaudo === "codigoBarras" && (
              <MoneyInput
                id="valorTrx"
                name="valorTrx"
                label={"Valor a pagar"}
                type="tel"
                maxLength={10}
                autoComplete="off"
                min={enumParametrosItau?.MIN_RECAUDO_SERVICIOS_ITAU}
                max={enumParametrosItau?.MAX_RECAUDO_SERVICIOS_ITAU}
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
          {convenio.consultaweb === "N" && tipoRecaudo !== "codigoBarras" && (
            <MoneyInput
              id="valorTrx"
              name="valorTrx"
              label={"Valor a pagar"}
              type="tel"
              maxLength={10}
              autoComplete="off"
              min={enumParametrosItau?.MIN_RECAUDO_SERVICIOS_ITAU}
              max={enumParametrosItau?.MAX_RECAUDO_SERVICIOS_ITAU}
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
            {convenio.consultaweb === "N"
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
              <Form onSubmit={transaccionRecaudoServiciosItau} grid={false}>
                {renderReferences("validate")}
                <MoneyInput
                  id="valorTrxValidacion"
                  name="valorTrxValidacion"
                  label={"Valor a pagar"}
                  type="tel"
                  // minLength={5}
                  maxLength={10}
                  autoComplete="off"
                  min={enumParametrosItau?.MIN_RECAUDO_SERVICIOS_ITAU}
                  max={enumParametrosItau?.MAX_RECAUDO_SERVICIOS_ITAU}
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
                    {convenio.consultaweb === "N"
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
                  [...Array(parseInt(convenio.referencia_2)).keys()].map(
                    (i) => [
                      convenio?.[`referencia${i + 1}`],
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
              title="Respuesta de consulta recaudo"
              subtitle="Resumen de transacción"
              summaryTrx={{
                Convenio: dataRecaudo?.nombreConvenio ?? "",
                ...Object.fromEntries(
                  [...Array(parseInt(convenio.referencia_2)).keys()].map(
                    (i) => [
                      convenio?.[`referencia${i + 1}`],
                      dataRecaudo?.[`ref${i + 1}`],
                    ]
                  )
                ),
                [convenio.modvalor_consweb === "N"
                  ? "Valor a pagar"
                  : "Valor consultado"]: formatMoney.format(resConsulta?.amt),
              }}
            >
              {convenio.modvalor_consweb === "S" && (
                <MoneyInput
                  id="valorTrx"
                  name="valorTrx"
                  label={"Valor a pagar"}
                  type="tel"
                  maxLength={10}
                  autoComplete="off"
                  min={enumParametrosItau?.MIN_RECAUDO_SERVICIOS_ITAU}
                  max={enumParametrosItau?.MAX_RECAUDO_SERVICIOS_ITAU}
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
          ) : estadoPeticion === "ticket" ? (
            <div className="flex flex-col justify-center items-center">
              <TicketsItau
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

export default PagoRecaudoServiciosItau;
