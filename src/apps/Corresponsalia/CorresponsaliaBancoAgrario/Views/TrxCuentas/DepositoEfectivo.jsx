import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Button from "../../../../../components/Base/Button";
import Modal from "../../../../../components/Base/Modal";
import { Fragment, useState, useCallback, useRef, useEffect } from "react";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";
import TicketsAgrario from "../../components/TicketsBancoAgrario/TicketsAgrario";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import { depositoBancoAgrario } from "../../utils/fetchDeposito";
import { notify, notifyError } from "../../../../../utils/notify";
import MoneyInput, {
  formatMoney,
} from "../../../../../components/Base/MoneyInput";
import { useFetch } from "../../../../../hooks/useFetch";
import { useAuth } from "../../../../../hooks/AuthHooks";
import Select from "../../../../../components/Base/Select";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import { enumParametrosBancoAgrario } from "../../utils/enumParametrosBancoAgrario";
import { useMFA } from "../../../../../components/Base/MFAScreen";

const Deposito = () => {
  const navigate = useNavigate();

  const { submitEventSetter } = useMFA();

  const { roleInfo, pdpUser } = useAuth();

  const [
    loadingDepositoCorresponsalBancoAgrario,
    fetchDepositoCorresponsalBancoAgrario,
  ] = useFetch(depositoBancoAgrario);
  const validNavigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [tipoCuenta, setTipoCuenta] = useState("01");
  const [isUploading, setIsUploading] = useState(false);
  const [numCuenta, setNumCuenta] = useState("");
  const [valor, setValor] = useState("");
  const [summary, setSummary] = useState([]);
  const [objTicketActual, setObjTicketActual] = useState({});

  const options = [
    { value: "01", label: "Ahorros" },
    { value: "02", label: "Corriente" },
  ];

  const onSubmitModal = useCallback(
    (e) => {
      e.preventDefault();
      const min = enumParametrosBancoAgrario.MIN_DEPOSITO_CUENTAS_AGRARIO;
      const max = enumParametrosBancoAgrario.MAX_DEPOSITO_CUENTAS_AGRARIO;
      if (valor >= min && valor <= max) {
        const summary = {
          "Tipo de cuenta": tipoCuenta === "01" ? "Ahorros" : "Corriente",
          "Número de cuenta": numCuenta,
          "Valor depósito": formatMoney.format(valor),
        };
        setSummary(summary);
        setShowModal(true);
      } else {
        setIsUploading(false);
        notifyError(
          `El valor del depósito debe estar entre ${formatMoney
            .format(min)
            .replace(/(\$\s)/g, "$")} y ${formatMoney
            .format(max)
            .replace(/(\$\s)/g, "$")}`
        );
      }
    },
    [valor, numCuenta, tipoCuenta]
  );

  const printDiv = useRef();

  useEffect(() => {
    if (!roleInfo || (roleInfo && Object.keys(roleInfo).length === 0)) {
      navigate("/");
    } else {
      let hasKeys = true;
      const keys = [
        "id_comercio",
        "id_usuario",
        "tipo_comercio",
        "id_dispositivo",
        "ciudad",
        "direccion",
      ];
      for (const key of keys) {
        if (!(key in roleInfo)) {
          hasKeys = false;
          break;
        }
      }
      if (!hasKeys) {
        notifyError(
          "El usuario no cuenta con datos de comercio, no se permite la transaccion"
        );
        navigate("/");
      }
    }
  }, [roleInfo, navigate]);

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const handleClose = useCallback(() => {
    setShowModal(false);
    setTipoCuenta("01");
    setNumCuenta("");
    setValor("");
    setSummary([]);
    validNavigate(-1);
  }, [validNavigate]);

  const goToRecaudo = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onMakePayment = useCallback(() => {
    setIsUploading(true);
    const body = {
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
      },

      oficina_propia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
        roleInfo?.tipo_comercio === "KIOSCO"
          ? true
          : false,
      nombre_comercio: roleInfo?.["nombre comercio"],
      valor_total_trx: valor,
      nombre_usuario: pdpUser?.uname ?? "",

      depositoCuentas: {
        numValorTransaccion: valor,
        numTipoCuenta: tipoCuenta,
        numCuenta: numCuenta,

        location: {
          codDane: roleInfo?.codigo_dane,
          ciudad: roleInfo?.ciudad,
          direccion: roleInfo?.direccion,
        },
      },
    };

    fetchDepositoCorresponsalBancoAgrario(body)
      .then((res) => {
        setIsUploading(false);
        if (!res?.status) {
          notifyError(res?.msg);
          handleClose();
          return;
        } else {
          notify("Transacción satisfactoria");
          setObjTicketActual(res?.obj?.ticket);
          setPaymentStatus(res?.obj?.ticket);
        }
      })
      .catch((err) => {
        setIsUploading(false);
        console.error(err);
        notifyError("No se ha podido conectar al servidor");
      });
  }, [numCuenta, valor, tipoCuenta, roleInfo, pdpUser?.uname]);

  const HandleCloseModal = useCallback(() => {
    setShowModal(false);
    setTipoCuenta("01");
    setNumCuenta("");
    setValor("");
    setSummary([]);
    notifyError("Transacción cancelada por el usuario");
    validNavigate(-1);
  }, [validNavigate]);

  return (
    <>
      <SimpleLoading show={isUploading} />
      <Fragment>
        <h1 className="text-3xl mt-6">Depósitos</h1>
        <br></br>
        <Form onSubmit={onSubmitModal} grid>
          <Select
            id="tipoCuenta"
            label="Tipo de cuenta"
            options={options}
            value={tipoCuenta}
            required
            onChange={(e) => {
              setTipoCuenta(e.target.value);
            }}
          />
          <Input
            id="numCuenta"
            name="numCuenta"
            label="Número de cuenta"
            type="text"
            autoComplete="off"
            minLength={"10"}
            maxLength={"12"}
            value={numCuenta}
            onInput={(e) => {
              const num = e.target.value.replace(/[\s\.\-+eE]/g, "");
              if (!isNaN(num)) {
                setNumCuenta(num);
              }
            }}
            required
          />
          <MoneyInput
            id="valor"
            name="valor"
            label="Valor a depositar"
            autoComplete="off"
            type="text"
            maxLength={"9"}
            equalError={false}
            equalErrorMin={false}
            min={enumParametrosBancoAgrario.MIN_DEPOSITO_CUENTAS_AGRARIO}
            max={enumParametrosBancoAgrario.MAX_DEPOSITO_CUENTAS_AGRARIO}
            value={valor}
            onInput={(ev, val) => setValor(val)}
            required
          />
          <ButtonBar className={"lg:col-span-2"}>
            <Button type={"submit"}>Continuar</Button>
          </ButtonBar>
        </Form>
        <Modal show={showModal}>
          {paymentStatus ? (
            <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
              <TicketsAgrario ticket={objTicketActual} refPrint={printDiv} />
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button type={"submit"} onClick={goToRecaudo}>
                  Cerrar
                </Button>
              </ButtonBar>
            </div>
          ) : (
            <PaymentSummary summaryTrx={summary}>
              <ButtonBar>
                <Button
                  onClick={HandleCloseModal}
                  disabled={loadingDepositoCorresponsalBancoAgrario}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={submitEventSetter(onMakePayment)}
                  disabled={loadingDepositoCorresponsalBancoAgrario}
                >
                  Realizar Depósito
                </Button>
              </ButtonBar>
            </PaymentSummary>
          )}
        </Modal>
      </Fragment>
    </>
  );
};

export default Deposito;
