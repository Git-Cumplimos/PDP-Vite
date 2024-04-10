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
import {
  algoCheckCreditoLendingCajaSocial,
  algoCheckCuentaCreditoBMCajaSocial,
  algoCheckTCCreditoRotativoCajaSocial,
  algoCheckTarjetaCreditoBinCajaSocial,
} from "../utils/trxUtils";
import TicketsCajaSocial from "../components/TicketsCajaSocial";
import BarcodeReader from "../../../../components/Base/BarcodeReader";
import Select from "../../../../components/Base/Select";

const URL_CONSULTA_PAGO_PRODUCTOS_PROPIOS = `${process.env.REACT_APP_URL_CORRESPONSALIA_CAJA_SOCIAL}/productos-propios-caja-social/consulta-pago-productos-propios`;
const URL_PAGO_PRODUCTOS_PROPIOS_CAJA_SOCIAL = `${process.env.REACT_APP_URL_CORRESPONSALIA_CAJA_SOCIAL}/productos-propios-caja-social/pago-productos-propios`;
const URL_ESTADO_PAGO_PRODUCTOS_PROPIOS = `${process.env.REACT_APP_URL_CORRESPONSALIA_CAJA_SOCIAL}/productos-propios-caja-social/consulta-estado-pago-productos-propios`;

const DATA_PAGO_INIT = {
  estadoLecturaPago: "codigoBarras",
  valorPagoProductosPropios: 0,
  tipoPago: 1,
  valorDiferentePagoProductosPropios: 0,
  numeroProducto: "",
};
const TIPO_PAGO_PRODUCTOS_PROPIOS = {
  "": "",
  "Pago mínimo": "1",
  "Pago total": "2",
  "Pago valor diferente": "3",
};
const PagoProductosPropiosCajaSocial = () => {
  const uniqueId = v4();
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
  const [loadingPeticionPagoProductosPropios, peticionPagoDeposito] =
    useFetchCajaSocial(
      URL_PAGO_PRODUCTOS_PROPIOS_CAJA_SOCIAL,
      URL_ESTADO_PAGO_PRODUCTOS_PROPIOS,
      "Pago productos propios"
    );
  const [loadingPeticionConsulta, peticionConsultaPagoProductosPropios] =
    useFetch(
      fetchCustom(
        URL_CONSULTA_PAGO_PRODUCTOS_PROPIOS,
        "POST",
        "Consulta pago productos propios"
      )
    );
  const consultaPagoProductosPropios = useCallback(
    (ev) => {
      let numeroProducto = dataPago.numeroProducto;
      if (typeof ev?.preventDefault === "function") {
        ev.preventDefault();
        if (
          !algoCheckCuentaCreditoBMCajaSocial(numeroProducto) &&
          !algoCheckCreditoLendingCajaSocial(numeroProducto) &&
          !algoCheckTCCreditoRotativoCajaSocial(numeroProducto)
        )
          return notifyError("Número de producto ingresado errado");
        if (
          algoCheckTCCreditoRotativoCajaSocial(numeroProducto) &&
          algoCheckTarjetaCreditoBinCajaSocial(numeroProducto)
        )
          return notifyError(
            "Error respuesta PDP: (No se permite el pago de tarjetas manualmente)"
          );
      } else {
        let codigoBarras = ev;
        codigoBarras = codigoBarras.replace("]C1", "");
        numeroProducto = codigoBarras;
        setDataPago((old) => ({ ...old, numeroProducto: codigoBarras }));
      }
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: dataPago?.valorPagoProductosPropios,
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
        pago_productos_propios_caja_social: {
          numero_producto: numeroProducto,
          codigo_barras: dataPago.estadoLecturaPago === "codigoBarras",
        },
        id_user_pdp: pdpUser.uuid,
      };
      notifyPending(
        peticionConsultaPagoProductosPropios({}, data),
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
  const pagoProductosPropios = useCallback(
    (ev) => {
      ev.preventDefault();
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: dataPago?.valorPagoProductosPropios,
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
        pago_productos_propios_caja_social: {
          numero_producto: dataPago?.numeroProducto,
          nom_cliente: resConsulta?.trn?.personName?.fullName,
          codigo_barras: dataPago.estadoLecturaPago === "codigoBarras",
          valor_minimo: resConsulta?.trn?.minCurAmt?.amt,
          valor_maximo: resConsulta?.trn?.totalCurAmt?.amt,
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
            setEstadoPeticion(2);
            setStateTicketTrx(true);
            return "Pago satisfactorio";
          },
        },
        {
          render: ({ data: error }) => {
            if (error.hasOwnProperty("optionalObject")) {
              if (error.optionalObject.hasOwnProperty("ticket")) {
                setObjTicketActual(error.optionalObject.ticket ?? {});
                setEstadoPeticion(2);
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
  const checkPagoProductosPropios = useCallback(
    (ev) => {
      ev.preventDefault();
      let valorAPagar = 0;
      if (dataPago.tipoPago === "1") {
        valorAPagar = resConsulta?.trn?.minCurAmt?.amt;
      } else if (dataPago.tipoPago === "2") {
        valorAPagar = resConsulta?.trn?.totalCurAmt?.amt;
      } else if (dataPago.tipoPago === "3") {
        valorAPagar = dataPago.valorDiferentePagoProductosPropios;
      }
      if (
        valorAPagar <
          enumParametrosCajaSocial?.MIN_PAGO_PRODUCTOS_PROPIOS_CAJA_SOCIAL ||
        valorAPagar >
          enumParametrosCajaSocial?.MAX_PAGO_PRODUCTOS_PROPIOS_CAJA_SOCIAL
      ) {
        // setEstadoPeticion(0)
        // setShowModal(0)
        return notifyError(
          `El valor de la transacción debe estar entre ${formatMoney.format(
            enumParametrosCajaSocial?.MIN_PAGO_PRODUCTOS_PROPIOS_CAJA_SOCIAL
          )} y ${formatMoney.format(
            enumParametrosCajaSocial?.MAX_PAGO_PRODUCTOS_PROPIOS_CAJA_SOCIAL
          )}`
        );
      }
      setDataPago((old) => ({
        ...old,
        valorPagoProductosPropios: valorAPagar,
      }));
      setEstadoPeticion(1);
    },
    [dataPago, resConsulta]
  );
  const onChangeFormat = useCallback((ev) => {
    let value = ev.target.value;
    if (ev.target.name === "numeroProducto") {
      if (!isNaN(value)) {
        value = value.replace(/[\s\.\-+eE]/g, "");
        setDataPago((old) => {
          return { ...old, [ev.target.name]: value };
        });
      }
    } else {
      setDataPago((old) => {
        return { ...old, [ev.target.name]: value };
      });
    }
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
  const isChecked = (value) => dataPago.estadoLecturaPago === value;
  return (
    <>
      <h1 className="text-3xl mt-10">Pago de Productos Propios</h1>
      <Form
        onSubmit={consultaPagoProductosPropios}
        className=" flex flex-col content-center items-center"
        grid={false}
      >
        <Fieldset
          legend="Tipo de captura"
          className="flex flex-col content-center items-center mb-10"
        >
          <Input
            id="estadoLecturaPagoCodigoBarras"
            name="estadoLecturaPago"
            label={"Código de barras"}
            type="radio"
            autoComplete="off"
            value={"codigoBarras"}
            onChange={onChangeFormat}
            disabled={
              loadingPeticionPagoProductosPropios || loadingPeticionConsulta
            }
            required
            checked={isChecked("codigoBarras")}
          />
          <Input
            id="estadoLecturaPagoManual"
            name="estadoLecturaPago"
            label={"Manual"}
            type="radio"
            autoComplete="off"
            value={"manual"}
            onChange={onChangeFormat}
            disabled={
              loadingPeticionPagoProductosPropios || loadingPeticionConsulta
            }
            required
            checked={isChecked("manual")}
          />
        </Fieldset>
        {dataPago.estadoLecturaPago === "codigoBarras" ? (
          <>
            <BarcodeReader
              onSearchCodigo={consultaPagoProductosPropios}
              disabled={
                loadingPeticionPagoProductosPropios || loadingPeticionConsulta
              }
            />
            <div ref={buttonDelete}>
              <Button
                type="reset"
                disabled={
                  loadingPeticionPagoProductosPropios || loadingPeticionConsulta
                }
              >
                Volver a ingresar el código de barras
              </Button>
            </div>
          </>
        ) : (
          <>
            <Input
              id="numeroProducto"
              name="numeroProducto"
              label={"Número de producto"}
              type="text"
              autoComplete="off"
              minLength={11}
              maxLength={16}
              value={dataPago?.numeroProducto}
              onChange={onChangeFormat}
              disabled={
                loadingPeticionPagoProductosPropios || loadingPeticionConsulta
              }
              required
            />
            <ButtonBar className="lg:col-span-2">
              <Button
                type="button"
                onClick={(e) => {
                  closeModule(e);
                  validNavigate(-1);
                }}
                disabled={
                  loadingPeticionPagoProductosPropios || loadingPeticionConsulta
                }
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  loadingPeticionPagoProductosPropios || loadingPeticionConsulta
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
          {estadoPeticion === 0 ? (
            <PaymentSummary
              title="Respuesta de consulta de producto propio"
              subtitle="Resumen de transacción"
              summaryTrx={{
                "Nombre del titular":
                  resConsulta?.trn?.personName?.fullName ?? "",
                "Número de producto": dataPago?.numeroProducto,
                "Valor pago mínimo": formatMoney.format(
                  resConsulta?.trn?.minCurAmt?.amt
                ),
                "Valor pago total": formatMoney.format(
                  resConsulta?.trn?.totalCurAmt?.amt
                ),
              }}
            >
              <Form onSubmit={checkPagoProductosPropios}>
                <Select
                  id="tipoPago"
                  name="tipoPago"
                  label="Indique el tipo de abono"
                  options={TIPO_PAGO_PRODUCTOS_PROPIOS}
                  value={dataPago?.tipoPago}
                  onChange={onChangeFormat}
                  required
                  disabled={
                    loadingPeticionPagoProductosPropios ||
                    loadingPeticionConsulta
                  }
                />
                {dataPago.tipoPago === "3" && (
                  <MoneyInput
                    id="valorDiferentePagoProductosPropios"
                    name="valorDiferentePagoProductosPropios"
                    label={"Valor a pagar"}
                    type="tel"
                    // minLength={5}
                    maxLength={12}
                    autoComplete="off"
                    min={
                      enumParametrosCajaSocial?.MIN_PAGO_PRODUCTOS_PROPIOS_CAJA_SOCIAL
                    }
                    max={
                      enumParametrosCajaSocial?.MAX_PAGO_PRODUCTOS_PROPIOS_CAJA_SOCIAL
                    }
                    defaultValue={
                      dataPago?.valorDiferentePagoProductosPropios ?? 0
                    }
                    decimalDigits={2}
                    onInput={onChangeFormatNum}
                    disabled={
                      loadingPeticionPagoProductosPropios ||
                      loadingPeticionConsulta
                    }
                    required
                    equalError={false}
                    equalErrorMin={false}
                  />
                )}
                <ButtonBar>
                  <Button
                    type="button"
                    onClick={(e) => {
                      closeModule(e);
                      validNavigate(-1);
                    }}
                    disabled={
                      loadingPeticionPagoProductosPropios ||
                      loadingPeticionConsulta
                    }
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      loadingPeticionPagoProductosPropios ||
                      loadingPeticionConsulta
                    }
                  >
                    Realizar pago
                  </Button>
                </ButtonBar>
              </Form>
            </PaymentSummary>
          ) : estadoPeticion === 1 ? (
            <PaymentSummary
              title="¿Está seguro de realizar el pago del producto de crédito?"
              subtitle="Resumen de transacción"
              summaryTrx={{
                "Nombre del titular":
                  resConsulta?.trn?.personName?.fullName ?? "",
                "Número de producto": dataPago?.numeroProducto,
                "Tipo de abono":
                  Object.keys(TIPO_PAGO_PRODUCTOS_PROPIOS).filter(
                    (key) =>
                      TIPO_PAGO_PRODUCTOS_PROPIOS[key] === dataPago?.tipoPago
                  )[0] ?? "",
                "Valor a pagar": formatMoney.format(
                  dataPago.valorPagoProductosPropios
                ),
              }}
            >
              <ButtonBar>
                <Button
                  type="button"
                  onClick={(e) => {
                    closeModule(e);
                    validNavigate(-1);
                  }}
                  disabled={
                    loadingPeticionPagoProductosPropios ||
                    loadingPeticionConsulta
                  }
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={pagoProductosPropios}
                  disabled={
                    loadingPeticionPagoProductosPropios ||
                    loadingPeticionConsulta
                  }
                >
                  Realizar pago
                </Button>
              </ButtonBar>
            </PaymentSummary>
          ) : estadoPeticion === 2 ? (
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
