import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { useAuth } from "../../../../../hooks/AuthHooks";
import { useFetchItau } from "../../hooks/fetchItau";
import { useReactToPrint } from "react-to-print";
import Form from "../../../../../components/Base/Form/Form";
import Input from "../../../../../components/Base/Input/Input";
import MoneyInput from "../../../../../components/Base/MoneyInput/MoneyInput";
import ButtonBar from "../../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../../components/Base/Button/Button";
import Modal from "../../../../../components/Base/Modal/Modal";
import { notifyError, notifyPending } from "../../../../../utils/notify";
import { formatMoney } from "../../../../../components/Base/MoneyInputDec";
import HideInput from "../../../../../components/Base/HideInput/HideInput";
import { enumParametrosItau } from "../../utils/enumParametrosItau";
import TicketsItau from "../../components/TicketsItau";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";

const URL_REALIZAR_RETIRO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/retiro-servicios-itau/retiro-servicios`;
const URL_CONSULTAR_TRANSACCION_RETIRO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/retiro-servicios-itau/consulta-estado-retiro-servicios`;

const Retiro = () => {
  const navigate = useNavigate();
  const uniqueId = v4();
  const { roleInfo, pdpUser } = useAuth();
  const [dataRetiro, setDataRetiro] = useState({
    numeroDocumento: "",
    valorRetiro: 0,
    otpItau: "",
  });
  const [estadoPeticion, setEstadoPeticion] = useState(0);
  const [objTicketActual, setObjTicketActual] = useState({});
  const [showModal, setShowModal] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
    navigate(-1);
  }, []);
  const makeCashOut = useCallback(
    (ev) => {
      ev.preventDefault();
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: dataRetiro?.valorRetiro,
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
          num_documento: dataRetiro?.numeroDocumento,
          num_otp: dataRetiro?.otpItau,
        },
      };
      const dataAditional = {
        id_uuid_trx: uniqueId,
      };
      notifyPending(
        peticionRetiro(data, dataAditional),
        {
          render: () => {
            return "Procesando retiro";
          },
        },
        {
          render: ({ data: res }) => {
            setObjTicketActual(res?.obj?.ticket);
            setEstadoPeticion(2);
            return "Retiro satisfactorio";
          },
        },
        {
          render: ({ data: error }) => {
            navigate(-1);
            return error?.message ?? "Retiro fallido";
          },
        }
      );
    },
    [dataRetiro, navigate, roleInfo, pdpUser, uniqueId]
  );
  const [loadingPeticionRetiro, peticionRetiro] = useFetchItau(
    URL_REALIZAR_RETIRO,
    URL_CONSULTAR_TRANSACCION_RETIRO,
    "Realizar Retiro Itaú"
  );
  // const handleShow = useCallback((ev) => {
  //   ev.preventDefault();
  //   setEstadoPeticion(0);
  //   setShowModal(true);
  // }, []);
  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const onChangeFormatNumber = useCallback((ev) => {
    const valor = ev.target.value;
    const num = valor.replace(/[\s\.\-+eE]/g, "");
    if (!isNaN(num)) {
      setDataRetiro((old) => {
        return { ...old, [ev.target.name]: num };
      });
    }
  }, []);
  const handleSubmit = () => {
    if (dataRetiro.otpItau.length < 8) {
      setDataRetiro({
        otpItau: "",
        numeroDocumento: "",
        valorRetiro: 0,
      });
      return notifyError("Ingrese un código OTP válido de 8 dígitos");
    }
    if (dataRetiro?.valorRetiro % 10000 !== 0) {
      setDataRetiro((old) => {
        return { ...old, valorRetiro: 0 };
      });
      return notifyError("El valor a retirar debe ser múltiplo de $10.000");
    } else {
      setEstadoPeticion(1);
      setShowModal(true);
    }
  };
  return (
    <>
      <h1 className="text-3xl">Retiro Itaú</h1>
      <Form onSubmit={handleSubmit} grid>
        <Input
          id="numeroDocumento"
          name="numeroDocumento"
          label={"Número de documento"}
          type="text"
          autoComplete="off"
          value={dataRetiro?.["numeroDocumento"]}
          minLength={5}
          maxLength={12}
          onChange={onChangeFormatNumber}
          required
          disabled={loadingPeticionRetiro}
        />
        <HideInput
          id="otpItau"
          label="Número OTP"
          type="text"
          name="otpItau"
          minLength="8"
          maxLength="8"
          autoComplete="off"
          required
          value={dataRetiro.otpItau ?? ""}
          onInput={(e, valor) => {
            let num = valor.replace(/[\s\.\-+eE]/g, "");
            if (!isNaN(valor)) {
              setDataRetiro((old) => {
                return { ...old, otpItau: num };
              });
            }
          }}
        />
        <MoneyInput
          id="valorRetiro"
          name="valorRetiro"
          label="Valor a retirar"
          type="text"
          min={enumParametrosItau.MIN_RETIRO_SERVICIOS_ITAU}
          max={enumParametrosItau.MAX_RETIRO_SERVICIOS_ITAU}
          autoComplete="off"
          maxLength={"10"}
          value={parseInt(dataRetiro?.valorRetiro)}
          onInput={(ev, val) => {
            setDataRetiro((old) => {
              return { ...old, valorRetiro: val };
            });
          }}
          required
          disabled={loadingPeticionRetiro}
          equalError={false}
          equalErrorMin={false}
        />
        <ButtonBar className="lg:col-span-2">
          <Button
            type="button"
            onClick={() => {
              navigate(-1);
              notifyError("Transacción cancelada por el usuario");
            }}
            disabled={loadingPeticionRetiro}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loadingPeticionRetiro}>
            Realizar retiro
          </Button>
        </ButtonBar>
      </Form>
      <Modal
        show={showModal}
        handleClose={handleClose}
        className="flex align-middle"
      >
        <>
          {estadoPeticion === 1 ? (
            <PaymentSummary
              title="¿Está seguro de realizar la transacción?"
              subtitle="Resumen de transacción"
              summaryTrx={{
                "Número de documento": `${dataRetiro?.numeroDocumento}`,
                OTP: "*".repeat(dataRetiro?.otpItau.length),
                Valor: `${formatMoney.format(dataRetiro?.valorRetiro)}`,
              }}
            >
              <ButtonBar>
                <Button
                  onClick={() => {
                    handleClose();
                    notifyError("Transacción cancelada por el usuario");
                  }}
                  disabled={loadingPeticionRetiro}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={makeCashOut}
                  disabled={loadingPeticionRetiro}
                >
                  Realizar retiro
                </Button>
              </ButtonBar>
            </PaymentSummary>
          ) : estadoPeticion === 2 ? (
            <div className="flex flex-col justify-center items-center">
              <TicketsItau ticket={objTicketActual} refPrint={printDiv} />
              <h2>
                <ButtonBar>
                  <Button onClick={handlePrint}>Imprimir</Button>
                  <Button
                    type="submit"
                    onClick={() => {
                      handleClose();
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

export default Retiro;
