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

const URL_PAGO_CREDITO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/pago-credito-facil/pago-credito-pdp`;
const URL_CONSULTA_PAGO_CREDITO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/pago-credito-facil/consulta-estado-pago-credito-pdp`;

const FormPagoCreditoPdp = ({ dataCreditoUnique, closeModule }) => {
  const uniqueId = v4();
  const validNavigate = useNavigate();
  const [dataInput, setDataInput] = useState({
    valor: 0,
    observaciones: "",
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
          numero_credito: dataCreditoUnique?.Id,
          observaciones: dataInput?.observaciones,
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
    setDataInput((old) => {
      return { ...old, [ev.target.name]: value };
    });
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
            value={dataCreditoUnique?.Id}
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
