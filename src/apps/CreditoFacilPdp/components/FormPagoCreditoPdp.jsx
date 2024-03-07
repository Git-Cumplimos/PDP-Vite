import { useCallback, useRef, useState } from "react";
import Input from "../../../components/Base/Input";
import MoneyInput, { formatMoney } from "../../../components/Base/MoneyInput";
import { v4 } from "uuid";
import Form from "../../../components/Base/Form";
import Fieldset from "../../../components/Base/Fieldset";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import { enumParametrosCreditosPDP } from "../utils/enumParametrosCreditosPdp";
import { notifyPending } from "../../../utils/notify";
import { useAuth } from "../../../hooks/AuthHooks";
import { useReactToPrint } from "react-to-print";
import Modal from "../../../components/Base/Modal";
import Tickets from "../../../components/Base/Tickets";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import { useNavigate } from "react-router-dom";
import { useFetchCreditoFacil } from "../hooks/fetchCreditoFacil";
import Select from "../../../components/Base/Select";

const URL_PAGO_CREDITO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/pago-credito-facil/pago-credito-pdp`;
const URL_CONSULTA_PAGO_CREDITO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/pago-credito-facil/consulta-estado-pago-credito-pdp`;
const DATA_TIPO_DOCUMENTO = {
  "": "",
  NIT: 2,
  "CEDULA CIUDADANIA": 1,
  "TARJETA DE IDENTIDAD": 4,
  "REGISTRO CIVIL": 6,
  "TARJETA DE EXTRANJERIA": 7,
  "CEDULA EXTRANJERIA": 3,
  PASAPORTE: 8,
  "DEFINIDO POR LA DIAN": 10,
  "TIPO DOCUMENTO EXTRANJERO PJURIDICA": 5,
  "NIT PERSONA NATURAL": 11,
};
const DATA_FORMA_PAGO = {
  "": "",
  "CUENTA CTE BANCO DE COLPATRIA": 19,
  "CUENTA AHORROS BANCO AGRARIO": 20,
  // "CUENTA CTA BANCOLOMBIA": 22,
  // "CUENTA CTE DAVIVIENDA": 23,
  // "CUENTA CTE ITAU": 24,
  // "DESEMBOLSO CREDITO COMERCIOS": 28,
};
const DATA_TIPO_ABONO = {
  "": "",
  "ABONO NORMAL": 9,
  "REDUCCIÓN TIEMPO": 10,
  "REDUCCIÓN CUOTA": 11,
  ADELANTADO: 12,
  "PARA ESTAR AL DÍA": 13,
  "PAGO TOTAL": 14,
  "OTRO VALOR": 15,
};
const FormPagoCreditoPdp = ({ dataCreditoUnique, closeModule }) => {
  const uniqueId = v4();
  const validNavigate = useNavigate();
  const [dataInput, setDataInput] = useState({
    valor: 0,
    observaciones: "",
    tipoDocumento: "",
    formaPago: "",
    tipoAbono: "",
    nombreTipoDocumento: "",
    nombreFormaPago: "",
    nombreTipoAbono: "",
  });
  const [objTicketActual, setObjTicketActual] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [estadoPeticion, setEstadoPeticion] = useState(0);
  const { roleInfo, pdpUser } = useAuth();
  const printDiv = useRef();
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const [loadingPeticionPagoCredito, peticionPagoCredito] =
    useFetchCreditoFacil(
      URL_PAGO_CREDITO,
      URL_CONSULTA_PAGO_CREDITO,
      "Pago crédito"
    );
  const showModalFunc = useCallback((ev) => {
    ev.preventDefault();
    setShowModal(true);
  }, []);
  const pagoCredito = useCallback(
    (ev) => {
      ev.preventDefault();
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: dataInput?.valor,
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
        pago_credito: {
          numero_credito: dataCreditoUnique?.Numeroprestamo,
          observaciones: dataInput?.observaciones,
          tipo_documento: dataInput?.tipoDocumento,
          forma_pago: dataInput?.formaPago,
          tipo_abono: dataInput?.tipoAbono,
        },
      };
      const dataAditional = {
        id_uuid_trx: uniqueId,
      };
      notifyPending(
        peticionPagoCredito(data, dataAditional),
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
            return "Pago satisfactorio";
          },
        },
        {
          render: ({ data: error }) => {
            validNavigate(-1);
            return error?.message ?? "Pago fallido";
          },
        }
      );
    },
    [dataCreditoUnique, pdpUser, dataInput, roleInfo]
  );
  const onChangeFormat = useCallback((ev) => {
    let value = ev.target.value;
    if (ev.target.name === "tipoDocumento") {
      let nombreDocumento =
        Object.keys(DATA_TIPO_DOCUMENTO).filter(
          (key) => DATA_TIPO_DOCUMENTO[key] === parseInt(value)
        )[0] ?? "";
      setDataInput((old) => ({
        ...old,
        nombreTipoDocumento: nombreDocumento,
        [ev.target.name]: value,
      }));
    }
    if (ev.target.name === "formaPago") {
      let nombreformaPagoTemp =
        Object.keys(DATA_FORMA_PAGO).filter(
          (key) => DATA_FORMA_PAGO[key] === parseInt(value)
        )[0] ?? "";
      setDataInput((old) => ({
        ...old,
        nombreFormaPago: nombreformaPagoTemp,
        [ev.target.name]: value,
      }));
    }
    if (ev.target.name === "tipoAbono") {
      let nombreTipoAbonoTemp =
        Object.keys(DATA_TIPO_ABONO).filter(
          (key) => DATA_TIPO_ABONO[key] === parseInt(value)
        )[0] ?? "";
      setDataInput((old) => ({
        ...old,
        nombreTipoAbono: nombreTipoAbonoTemp,
        [ev.target.name]: value,
      }));
    } else {
      setDataInput((old) => {
        return { ...old, [ev.target.name]: value };
      });
    }
  }, []);
  const onChangeFormatNum = useCallback((ev, val) => {
    if (!isNaN(val)) {
      setDataInput((old) => {
        return { ...old, [ev.target.name]: val };
      });
    }
  }, []);

  return (
    <>
      <Form onSubmit={showModalFunc} grid>
        <Fieldset legend="Datos del crédito" className="lg:col-span-2">
          <Input
            id="Id"
            name="Id"
            label={"No. de crédito"}
            type="text"
            autoComplete="off"
            minLength={0}
            maxLength={20}
            value={dataCreditoUnique?.Numeroprestamo}
            onChange={() => {}}
            disabled
            required
          />
          <Input
            id="Fechadesembolso"
            name="Fechadesembolso"
            label={"Fecha de desembolso"}
            type="text"
            autoComplete="off"
            minLength={0}
            maxLength={20}
            value={new Date(
              dataCreditoUnique?.Fechadesembolso
            ).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
            onChange={() => {}}
            disabled
            required
          />
          <MoneyInput
            id="Valordesembolso"
            name="Valordesembolso"
            label={"Valor del crédito"}
            type="tel"
            autoComplete="off"
            minLength={0}
            maxLength={20}
            value={dataCreditoUnique?.Valordesembolso ?? ""}
            onChange={() => {}}
            disabled
            required
          />
          <Input
            id="Estado"
            name="Estado"
            label={"Estado"}
            type="text"
            autoComplete="off"
            minLength={0}
            maxLength={20}
            value={dataCreditoUnique?.Estado ?? ""}
            onChange={() => {}}
            disabled
            required
          />
          <Select
            id="tipoDocumento"
            name="tipoDocumento"
            label="Tipo de documento"
            options={DATA_TIPO_DOCUMENTO}
            value={dataInput?.tipoDocumento}
            onChange={onChangeFormat}
            required
            disabled={loadingPeticionPagoCredito}
          />
          <Select
            id="formaPago"
            name="formaPago"
            label="Forma de pago"
            options={DATA_FORMA_PAGO}
            value={dataInput?.formaPago}
            onChange={onChangeFormat}
            required
            disabled={loadingPeticionPagoCredito}
          />
          <Select
            id="tipoAbono"
            name="tipoAbono"
            label="Tipo de abono"
            options={DATA_TIPO_ABONO}
            value={dataInput?.tipoAbono}
            onChange={onChangeFormat}
            required
            disabled={loadingPeticionPagoCredito}
          />
          <MoneyInput
            id="valor"
            name="valor"
            label={"Valor a pagar"}
            type="tel"
            minLength={5}
            maxLength={10}
            autoComplete="off"
            min={enumParametrosCreditosPDP?.MINPAGOCREDITOPDP}
            max={
              parseInt(dataCreditoUnique?.Valordesembolso) ??
              enumParametrosCreditosPDP?.MAXPAGOCREDITOPDP
            }
            value={dataInput?.valor ?? ""}
            onInput={onChangeFormatNum}
            disabled={loadingPeticionPagoCredito}
            required
          />
          <Input
            id="observaciones"
            name="observaciones"
            label={"Observaciones"}
            type="text"
            autoComplete="off"
            minLength={0}
            maxLength={20}
            value={dataInput?.observaciones ?? ""}
            onChange={onChangeFormat}
            disabled={loadingPeticionPagoCredito}
            required
          />
        </Fieldset>
        <ButtonBar className="lg:col-span-2">
          <Button
            type="button"
            onClick={() => closeModule()}
            disabled={loadingPeticionPagoCredito}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loadingPeticionPagoCredito}>
            Realizar pago
          </Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} className="flex align-middle">
        <>
          {estadoPeticion === 0 ? (
            <PaymentSummary
              title="¿Está seguro de realizar el pago?"
              subtitle="Resumen de transacción"
              summaryTrx={{
                "Número crédito": dataCreditoUnique?.Id,
                "Tipo de documento": dataInput?.nombreTipoDocumento,
                "Forma de pago": dataInput?.nombreFormaPago,
                "Tipo de abono": dataInput?.nombreTipoAbono,
                "Valor a pagar": formatMoney.format(dataInput?.valor),
              }}
            >
              <ButtonBar>
                <Button
                  onClick={() => {
                    closeModule();
                  }}
                  disabled={loadingPeticionPagoCredito}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={pagoCredito}
                  disabled={loadingPeticionPagoCredito}
                >
                  Realizar pago
                </Button>
              </ButtonBar>
            </PaymentSummary>
          ) : estadoPeticion === 1 ? (
            <div className="flex flex-col justify-center items-center">
              <Tickets ticket={objTicketActual} refPrint={printDiv} />
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

export default FormPagoCreditoPdp;
