import { useCallback, useState, useEffect, useRef } from "react";
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
import Tickets from "../../../../components/Base/Tickets";
import { algoCheckCuentaDepositoCajaSocial } from "../utils/trxUtils";

const URL_CONSULTA_TITULAR_DEPOSITO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/pago-credito-facil/consulta-estado-pago-credito-pdp`;
const URL_DEPOSITO_CAJA_SOCIAL = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/pago-credito-facil/pago-credito-pdp`;
const URL_CONSULTA_DEPOSITO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/pago-credito-facil/consulta-estado-pago-credito-pdp`;

const DATA_DEPOSITO_INIT = {
  numeroCuenta: "",
  valorDeposito: 0,
};

const DepositoCajaSocial = () => {
  const uniqueId = v4();
  const validNavigate = useNavigate();
  const [dataDeposito, setDataDeposito] = useState(DATA_DEPOSITO_INIT);
  const [objTicketActual, setObjTicketActual] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [estadoPeticion, setEstadoPeticion] = useState(0);
  const { roleInfo, pdpUser } = useAuth();
  const printDiv = useRef();
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const [loadingPeticionDeposito, peticionPagoDeposito] = useFetchCajaSocial(
    URL_DEPOSITO_CAJA_SOCIAL,
    URL_CONSULTA_DEPOSITO,
    "Pago depósito"
  );
  const [loadingPeticionConsultaTitular, peticionConsultaTitular] = useFetch(
    fetchCustom(URL_CONSULTA_TITULAR_DEPOSITO, "POST", "Consulta titular")
  );
  const consultaTitular = useCallback(
    (ev) => {
      ev.preventDefault();
      const numerosInicio = ["21", "23", "24", "26"];
      const sliceData = dataDeposito.numeroCuenta.slice(0, 2);
      if (!numerosInicio.includes(sliceData))
        return notifyError("Número de cuenta ingresado errado");
      if (!algoCheckCuentaDepositoCajaSocial(dataDeposito.numeroCuenta))
        return notifyError("Número de cuenta ingresado errado");
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: dataDeposito?.valorDeposito,
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
        deposito_caja_social: {
          numero_cuenta: dataDeposito?.numeroCuenta,
        },
      };
      // notifyPending(
      //   peticionConsultaTitular({}, data),
      //   {
      //     render: () => {
      //       return "Procesando creación";
      //     },
      //   },
      //   {
      //     render: ({ data: res }) => {
      //       setShowModal(true);
      //       return res?.msg ?? "Consulta satisfactoria";
      //     },
      //   },
      //   {
      //     render: ({ data: error }) => {
      //       validNavigate(-1);
      //       return error?.message ?? "Consulta fallida";
      //     },
      //   }
      // );
    },
    [dataDeposito, pdpUser, roleInfo]
  );
  const pagoCredito = useCallback(
    (ev) => {
      ev.preventDefault();
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: dataDeposito?.valorDeposito,
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
          numero_cuenta: dataDeposito?.numeroCuenta,
        },
      };
      const dataAditional = {
        id_uuid_trx: uniqueId,
      };
      notifyPending(
        peticionPagoDeposito(data, dataAditional),
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
    [pdpUser, dataDeposito, roleInfo]
  );
  const onChangeFormat = useCallback((ev) => {
    let value = ev.target.value;
    if (ev.target.name === "numeroCuenta") {
      if (!isNaN(value)) {
        value = value.replace(/[\s\.\-+eE]/g, "");
      }
    }
    setDataDeposito((old) => {
      return { ...old, [ev.target.name]: value };
    });
  }, []);
  const onChangeFormatNum = useCallback((ev, val) => {
    if (!isNaN(val)) {
      setDataDeposito((old) => {
        return { ...old, [ev.target.name]: val };
      });
    }
  }, []);
  const closeModule = useCallback(() => {
    setDataDeposito(DATA_DEPOSITO_INIT);
    notifyError("Pago cancelado por el usuario");
    validNavigate(-1);
  }, [validNavigate]);
  return (
    <>
      <h1 className="text-3xl">Depósitos BCSC</h1>
      <Form onSubmit={consultaTitular} grid>
        <Fieldset legend="Datos del depósito" className="lg:col-span-2">
          <Input
            id="numeroCuenta"
            name="numeroCuenta"
            label={"Número de cuenta"}
            type="text"
            autoComplete="off"
            minLength={11}
            maxLength={11}
            value={dataDeposito?.numeroCuenta}
            onChange={onChangeFormat}
            required
          />
          <MoneyInput
            id="valorDeposito"
            name="valorDeposito"
            label={"Valor a depositar"}
            type="tel"
            minLength={5}
            maxLength={10}
            autoComplete="off"
            min={enumParametrosCajaSocial?.MIN_DEPOSITO_CAJA_SOCIAL}
            max={enumParametrosCajaSocial?.MAX_DEPOSITO_CAJA_SOCIAL}
            value={dataDeposito?.valorDeposito ?? 0}
            onInput={onChangeFormatNum}
            disabled={loadingPeticionDeposito}
            required
          />
        </Fieldset>
        <ButtonBar className="lg:col-span-2">
          <Button
            type="button"
            onClick={closeModule}
            disabled={loadingPeticionDeposito}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loadingPeticionDeposito}>
            Realizar consulta
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
                "Número de cuenta": dataDeposito?.numeroCuenta,
                "Valor a depositar": formatMoney.format(
                  dataDeposito?.valorDeposito
                ),
              }}
            >
              <ButtonBar>
                <Button
                  onClick={closeModule}
                  disabled={loadingPeticionDeposito}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={pagoCredito}
                  disabled={loadingPeticionDeposito}
                >
                  Realizar depósito
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

export default DepositoCajaSocial;
