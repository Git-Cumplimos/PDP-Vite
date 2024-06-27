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
import { enumParametrosItau } from "../../utils/enumParametrosItau";
import TicketsItau from "../../components/TicketsItau";
import Select from "../../../../../components/Base/Select";

const URL_REALIZAR_PAGO = `${import.meta.env.VITE_URL_CORRESPONSALIA_OTROS}/productos-propios-itau/pago-productos-propios`;
const URL_CONSULTAR_TRANSACCION_PAGO = `${import.meta.env.VITE_URL_CORRESPONSALIA_OTROS}/productos-propios-itau/consulta-estado-pago-productos-propios`;

const PagoProductosPropiosItau = () => {
  const navigate = useNavigate();
  const uniqueId = v4();
  const { roleInfo, pdpUser } = useAuth();
  const [dataPago, setDataPago] = useState({
    numeroDocumento: "",
    valorPago: 0,
    primerosDigitos: "",
    ultimosDigitos: "",
    tipoDocumento: "01",
  });
  const [estadoPeticion, setEstadoPeticion] = useState(0);
  const [objTicketActual, setObjTicketActual] = useState({});
  const [showModal, setShowModal] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
    navigate(-1);
  }, []);

  const optionsDocumento = [
    { value: "01", label: "Cédula Ciudadanía" },
    { value: "02", label: "Cédula Extrajería" },
    { value: "03", label: "NIT" },
    { value: "04", label: "Tarjeta Identidad" },
  ];

  const makeCashOut = useCallback(
    (ev) => {
      ev.preventDefault();
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: dataPago?.valorPago,
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
          card_category: dataPago?.primerosDigitos,
          card_num: dataPago?.ultimosDigitos,
          tipo_documento: dataPago?.tipoDocumento,
          num_documento: dataPago?.numeroDocumento,
        },
      };
      const dataAditional = {
        id_uuid_trx: uniqueId,
      };
      notifyPending(
        peticionPago(data, dataAditional),
        {
          render: () => {
            return "Procesando Pago";
          },
        },
        {
          render: ({ data: res }) => {
            setObjTicketActual(res?.obj?.ticket);
            setEstadoPeticion(2);
            setShowModal(true);
            return "Pago satisfactorio";
          },
        },
        {
          render: ({ data: error }) => {
            navigate(-1);
            return error?.message ?? "Pago fallido";
          },
        }
      );
    },
    [dataPago, navigate, roleInfo, pdpUser, uniqueId]
  );
  const [loadingpeticionPago, peticionPago] = useFetchItau(
    URL_REALIZAR_PAGO,
    URL_CONSULTAR_TRANSACCION_PAGO,
    "Realizar Pago Itaú"
  );
  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const onChangeFormatNumber = useCallback((ev) => {
    const valor = ev.target.value;
    const num = valor.replace(/[\s\.\-+eE]/g, "");
    if (!isNaN(num)) {
      setDataPago((old) => {
        return { ...old, [ev.target.name]: num };
      });
    }
  }, []);
  return (
    <>
      <h1 className="text-3xl">Pago Productos Propios Itaú</h1>
      <Form onSubmit={makeCashOut} grid>
        <Select
          id="tipoDocumento"
          label="Tipo de documento"
          options={optionsDocumento}
          value={dataPago?.["tipoDocumento"]}
          onChange={(e) => {
            setDataPago((prevState) => ({
              ...prevState,
              tipoDocumento: e.target.value,
            }));
          }}
          required
          disabled={loadingpeticionPago}
        />
        <Input
          id="numeroDocumento"
          name="numeroDocumento"
          label={"Número de documento"}
          type="text"
          autoComplete="off"
          value={dataPago?.["numeroDocumento"]}
          minLength={5}
          maxLength={12}
          onChange={onChangeFormatNumber}
          required
          disabled={loadingpeticionPago}
        />
        <Input
          id="primerosDigitos"
          name="primerosDigitos"
          label={"Primeros seis dígitos tarjeta de crédito"}
          type="text"
          autoComplete="off"
          value={dataPago?.["primerosDigitos"]}
          minLength={6}
          maxLength={6}
          onChange={onChangeFormatNumber}
          required
          disabled={loadingpeticionPago}
        />
        <Input
          id="ultimosDigitos"
          name="ultimosDigitos"
          label={"Últimos cuatro dígitos tarjeta de crédito"}
          type="text"
          autoComplete="off"
          value={dataPago?.["ultimosDigitos"]}
          minLength={4}
          maxLength={4}
          onChange={onChangeFormatNumber}
          required
          disabled={loadingpeticionPago}
        />
        <MoneyInput
          id="valorPago"
          name="valorPago"
          label="Valor a pagar"
          type="text"
          min={enumParametrosItau.MIN_PAGO_PRODUCTOS_PROPIOS_ITAU}
          max={enumParametrosItau.MAX_PAGO_PRODUCTOS_PROPIO_ITAU}
          autoComplete="off"
          maxLength={"10"}
          value={parseInt(dataPago?.valorPago)}
          onInput={(ev, val) => {
            setDataPago((old) => {
              return { ...old, valorPago: val };
            });
          }}
          required
          disabled={loadingpeticionPago}
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
            disabled={loadingpeticionPago}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loadingpeticionPago}>
            Realizar pago
          </Button>
        </ButtonBar>
      </Form>
      <Modal
        show={showModal}
        handleClose={handleClose}
        className="flex align-middle"
      >
        <>
          {estadoPeticion === 2 ? (
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

export default PagoProductosPropiosItau;
