import { useCallback, useState, useRef } from "react";
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
import { algoCheckCuentaDepositoCajaSocial } from "../utils/trxUtils";
import TicketsCajaSocial from "../components/TicketsCajaSocial";
import { useMFA } from "../../../../components/Base/MFAScreen";
import Select from "../../../../components/Base/Select";
import BarcodeReader from "../../../../components/Base/BarcodeReader";

const URL_CONSULTA_PAGO_PRODUCTOS_PROPIOS = `${process.env.REACT_APP_URL_CORRESPONSALIA_CAJA_SOCIAL}/deposito-caja-social/consulta-titular`;
const URL_PAGO_PRODUCTOS_PROPIOS_CAJA_SOCIAL = `${process.env.REACT_APP_URL_CORRESPONSALIA_CAJA_SOCIAL}/deposito-caja-social/deposito-corresponsal`;
const URL_ESTADO_PAGO_PRODUCTOS_PROPIOS = `${process.env.REACT_APP_URL_CORRESPONSALIA_CAJA_SOCIAL}/deposito-caja-social/consulta-estado-deposito`;

const DATA_PAGO_INIT = {
  estadoLecturaPago: "1",
  codigoBarras: "",
};

const DATA_TIPO_PAGO = {
  "Código de barras": "1",
  Manual: "2",
};

const PagoProductosPropiosCajaSocial = () => {
  const uniqueId = v4();
  const { submitEventSetter } = useMFA();
  const validNavigate = useNavigate();
  const [dataPago, setDataPago] = useState(DATA_PAGO_INIT);
  const [objTicketActual, setObjTicketActual] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [stateTicketTrx, setStateTicketTrx] = useState(false);
  const [estadoPeticion, setEstadoPeticion] = useState(0);
  const [resConsulta, setResConsulta] = useState({});
  const { roleInfo, pdpUser } = useAuth();
  const printDiv = useRef();
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const buttonDelete = useRef(null);
  const [loadingPeticionDeposito, peticionPagoDeposito] = useFetchCajaSocial(
    URL_PAGO_PRODUCTOS_PROPIOS_CAJA_SOCIAL,
    URL_ESTADO_PAGO_PRODUCTOS_PROPIOS,
    "Pago productos propios",
    true
  );
  const [loadingPeticionConsultaTitular, peticionConsultaTitular] = useFetch(
    fetchCustom(
      URL_CONSULTA_PAGO_PRODUCTOS_PROPIOS,
      "POST",
      "Consulta pago productos propios"
    )
  );
  const consultaPagoProductosPropios = useCallback(
    (ev) => {
      ev.preventDefault();
      const numerosInicio = ["21", "23", "24", "26"];
      const sliceData = dataPago.numeroCuenta.slice(0, 2);
      if (!numerosInicio.includes(sliceData))
        return notifyError("Número de cuenta ingresado errado");
      if (!algoCheckCuentaDepositoCajaSocial(dataPago.numeroCuenta))
        return notifyError("Número de cuenta ingresado errado");
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: dataPago?.valorDeposito,
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
          numero_cuenta: dataPago?.numeroCuenta,
        },
        id_user_pdp: pdpUser.uuid,
      };
      notifyPending(
        peticionConsultaTitular({}, data),
        {
          render: () => {
            return "Procesando consulta";
          },
        },
        {
          render: ({ data: res }) => {
            setShowModal(true);
            setResConsulta(res?.obj);
            setEstadoPeticion(0);
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
    [dataPago, pdpUser, roleInfo]
  );
  const pagoDeposito = useCallback(
    (ev) => {
      ev.preventDefault();
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: dataPago?.valorDeposito,
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
          numero_cuenta: dataPago?.numeroCuenta,
          nom_cliente: resConsulta?.trn?.personName?.fullName,
        },
        id_trx: resConsulta?.id_trx,
        id_user_pdp: pdpUser.uuid,
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
    [pdpUser, dataPago, roleInfo, resConsulta]
  );
  const onChangeFormat = useCallback((ev) => {
    let value = ev.target.value;
    if (ev.target.name === "numeroCuenta") {
      if (!isNaN(value)) {
        value = value.replace(/[\s\.\-+eE]/g, "");
        setDataPago((old) => {
          return { ...old, [ev.target.name]: value };
        });
      }
    } else
      setDataPago((old) => {
        return { ...old, [ev.target.name]: value };
      });
  }, []);
  const onChangeFormatNum = useCallback((ev, val) => {
    if (!isNaN(val)) {
      setDataPago((old) => {
        return { ...old, [ev.target.name]: val };
      });
    }
  }, []);
  const closeModule = useCallback(() => {
    setDataPago(DATA_PAGO_INIT);
    notifyError("Pago cancelado por el usuario");
  }, []);
  const onSubmitBarCode = (info) => {
    console.log(info);
  };
  return (
    <>
      <h1 className="text-3xl mt-10">Pago de Productos Propios</h1>
      <Form
        onSubmit={consultaPagoProductosPropios}
        className=" flex flex-col content-center items-center"
        grid={false}
      >
        {/* <Fieldset
          legend="Datos del pago"
          className="flex flex-col content-center items-center"
        > */}
        <Select
          id="estadoLecturaPago"
          name="estadoLecturaPago"
          label="Tipo de captura"
          options={DATA_TIPO_PAGO}
          value={dataPago?.estadoLecturaPago}
          onChange={onChangeFormat}
          required
          // disabled={
          //   loadingPeticionConsultaTerceros || loadingPeticionCreacionTerceros
          // }
        />
        {dataPago.estadoLecturaPago === "1" ? (
          <>
            <BarcodeReader
              onSearchCodigo={onSubmitBarCode}
              // disabled={loadingPeticion}
            />
            <div ref={buttonDelete}>
              <Button type="reset">
                Volver a ingresar el código de barras
              </Button>
            </div>
          </>
        ) : (
          <>
            <Input
              id="numeroCuenta"
              name="numeroCuenta"
              label={"Número de cuenta"}
              type="text"
              autoComplete="off"
              minLength={11}
              maxLength={11}
              value={dataPago?.numeroCuenta}
              onChange={onChangeFormat}
              disabled={
                loadingPeticionDeposito || loadingPeticionConsultaTitular
              }
              required
            />
            <MoneyInput
              id="valorDeposito"
              name="valorDeposito"
              label={"Valor a depositar"}
              type="tel"
              // minLength={5}
              maxLength={10}
              autoComplete="off"
              min={enumParametrosCajaSocial?.MIN_DEPOSITO_CAJA_SOCIAL}
              max={enumParametrosCajaSocial?.MAX_DEPOSITO_CAJA_SOCIAL}
              value={dataPago?.valorDeposito ?? 0}
              onInput={onChangeFormatNum}
              disabled={
                loadingPeticionDeposito || loadingPeticionConsultaTitular
              }
              required
              equalError={false}
              equalErrorMin={false}
            />
            {/* </Fieldset> */}
            <ButtonBar className="lg:col-span-2">
              <Button
                type="button"
                onClick={(e) => {
                  closeModule(e);
                  validNavigate(-1);
                }}
                disabled={
                  loadingPeticionDeposito || loadingPeticionConsultaTitular
                }
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  loadingPeticionDeposito || loadingPeticionConsultaTitular
                }
              >
                Realizar consulta
              </Button>
            </ButtonBar>
          </>
        )}
      </Form>
      <Modal show={showModal} className="flex align-middle">
        <>
          {estadoPeticion === "1" ? (
            <PaymentSummary
              title="Respuesta de consulta depósito"
              subtitle="Resumen de transacción"
              summaryTrx={{
                "Nombres titular": resConsulta?.trn?.personName?.fullName ?? "",
                "Número de cuenta": dataPago?.numeroCuenta,
                "Valor a depositar": formatMoney.format(
                  dataPago?.valorDeposito
                ),
              }}
            >
              <ButtonBar>
                <Button
                  onClick={closeModule}
                  disabled={
                    loadingPeticionDeposito || loadingPeticionConsultaTitular
                  }
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={submitEventSetter(pagoDeposito)}
                  disabled={
                    loadingPeticionDeposito || loadingPeticionConsultaTitular
                  }
                >
                  Realizar depósito
                </Button>
              </ButtonBar>
            </PaymentSummary>
          ) : estadoPeticion === 1 ? (
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

export default PagoProductosPropiosCajaSocial;
