import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Button from "../../../../../components/Base/Button";
import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import Modal from "../../../../../components/Base/Modal";
import useQuery from "../../../../../hooks/useQuery";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  retiroCorresponsalGrupoAval,
  consultaCostoGrupoAval,
} from "../../utils/fetchCorresponsaliaGrupoAval";
import { notify, notifyError } from "../../../../../utils/notify";
import TicketsAval from "../../components/TicketsAval";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";
import MoneyInput, {
  formatMoney,
} from "../../../../../components/Base/MoneyInput";
import { useFetch } from "../../../../../hooks/useFetch";
import { useAuth } from "../../../../../hooks/AuthHooks";
import Select from "../../../../../components/Base/Select";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import HideInput from "../../../../../components/Base/HideInput";
import { pinBlock } from "../../utils/pinBlock";
import { enumParametrosGrupoAval } from "../../utils/enumParametrosGrupoAval";

const optionsBanco = [
  { value: "", label: "" },
  { value: "0052", label: "Banco AvVillas" },
  { value: "0001", label: "Banco Bogotá" },
  { value: "0023", label: "Banco Occidente" },
  { value: "0002", label: "Banco Popular" },
  // { value: "0054", label: "ATH" },
];

const optionsTipoCuenta = [
  { value: "01", label: "Ahorros" },
  { value: "02", label: "Corriente" },
];

const Retiro = () => {
  const navigate = useNavigate();

  const { roleInfo, pdpUser } = useAuth();

  const [limitesMontos, setLimitesMontos] = useState({
    max: enumParametrosGrupoAval.maxRetiroCuentas,
    min: enumParametrosGrupoAval.minRetiroCuentas,
  });

  const [loadingRetiroCorresponsalGrupoAval, fetchRetiroCorresponsalGrupoAval] =
    useFetch(retiroCorresponsalGrupoAval);
  const [loadingConsultaCostoGrupoAval, fetchConsultaCostoGrupoAval] = useFetch(
    consultaCostoGrupoAval
  );
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [datosConsulta, setDatosConsulta] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("01");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [userDoc, setUserDoc] = useState("");
  const [phone, setPhone] = useState("");
  const [valor, setValor] = useState("");
  const [otp, setOtp] = useState("");
  const [summary, setSummary] = useState([]);
  const [banco, setBanco] = useState("");
  const [showBTNConsulta, setShowBTNConsulta] = useState(true);

  const otpEncrip = useMemo(() => {
    let x = pinBlock(otp, process.env.REACT_APP_PAN_AVAL);
    return x;
  }, [otp]);

  const DataBanco = useMemo(() => {
    const resp = optionsBanco?.filter((id) => id.value === banco);
    const DataBanco = { nombre: resp[0]?.label, idBanco: resp[0]?.value };
    return DataBanco;
  }, [banco]);

  // const optionsDocumento = [
  //   { value: "", label: "" },
  //   { value: "01", label: "Cédula Ciudadanía" },
  //   { value: "02", label: "Cédula Extranjería" },
  //   { value: "04", label: "Tarjeta Identidad" },
  //   { value: "13", label: "Registro Civil" },
  // ];

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
    setTipoDocumento("");
    setValor("");
    setUserDoc("");
    setOtp("");
    setPhone("");
    setBanco("");
    setShowBTNConsulta(true);
    setSummary([]);
  }, []);

  const goToRecaudo = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onSubmitModal = useCallback(
    (e) => {
      e.preventDefault();
      if (otp.length <= 10 && otp.length >= 4) {
        const { min, max } = limitesMontos;
        if (valor >= min && valor <= max) {
          const summary = {
            Banco: DataBanco?.nombre,
            "Tipo de cuenta": tipoCuenta === "01" ? "Ahorros" : "Corriente",
            Documento: userDoc,
            "Número celular": phone,
            "Valor retiro": formatMoney.format(valor),
          };
          setSummary(summary);
          setShowModal(true);
        } else {
          setIsUploading(false);
          notifyError(
            `El valor del retiro debe estar entre ${formatMoney
              .format(min)
              .replace(/(\$\s)/g, "$")} y ${formatMoney
              .format(max)
              .replace(/(\$\s)/g, "$")}`
          );
        }
      } else {
        setIsUploading(false);
        notifyError(
          "La longitud del OTP es incorrecta. Por favor, ingrese un còdigo OTP vàlido entre 4 y 10 dìgitos"
        );
      }
    },
    [userDoc, phone, valor, DataBanco, tipoCuenta, limitesMontos, otp]
  );

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

      retiroCuentas: {
        idBancoAdquiriente: DataBanco?.idBanco,
        numNumeroDocumento: userDoc,
        numValorTransaccion: valor,
        numTipoCuenta: tipoCuenta,
        numCelular: phone,
        otp: otpEncrip,

        location: {
          codDane: roleInfo?.codigo_dane,
          ciudad: roleInfo?.ciudad,
          direccion: roleInfo?.direccion,
        },
      },
      nombre_usuario: pdpUser?.uname ?? "",
    };

    fetchRetiroCorresponsalGrupoAval(body)
      .then((res) => {
        setIsUploading(false);
        if (!res?.status) {
          notifyError(res?.msg);
          handleClose();
          // return;
        } else {
          notify("Transacción satisfactoria");
          setPaymentStatus(res?.obj?.ticket);
        }
      })
      .catch((err) => {
        setIsUploading(false);
        console.error(err);
        notifyError("No se ha podido conectar al servidor");
      });
  }, [
    valor,
    userDoc,
    fetchRetiroCorresponsalGrupoAval,
    roleInfo,
    datosConsulta,
    tipoDocumento,
    otpEncrip,
    DataBanco,
    phone,
    pdpUser?.uname,
    tipoCuenta,
  ]);

  return (
    <>
      <SimpleLoading show={isUploading} />
      <Fragment>
        <h1 className="text-3xl mt-6">Retiros</h1>
        <Form onSubmit={onSubmitModal} grid>
          <Select
            id="banco"
            label="Banco a Retirar"
            options={optionsBanco}
            value={banco}
            onChange={(e) => {
              setBanco(e.target.value);
              setOtp("");
            }}
            required
          />
          <Select
            id="tipCuenta"
            label="Tipo de cuenta"
            options={optionsTipoCuenta}
            value={tipoCuenta}
            onChange={(e) => {
              setTipoCuenta(e.target.value);
            }}
            required
          />
          <Input
            id="docCliente"
            name="docCliente"
            label="Documento cliente"
            type="text"
            autoComplete="off"
            minLength={"5"}
            maxLength={"12"}
            value={userDoc}
            onInput={(e) => {
              const num = e.target.value.replace(/[\s\.\-+eE]/g, "");
              if (!isNaN(num)) {
                setUserDoc(num);
              }
            }}
            required
          />
          <Input
            id="numCliente"
            name="numCliente"
            label="Número celular"
            type="text"
            autoComplete="off"
            minLength={"10"}
            maxLength={"10"}
            value={phone}
            onInput={(e) => {
              if (
                (String(e.target.value).length > 0) &
                (String(e.target.value).slice(0, 1) !== "3")
              ) {
                notifyError("El número de celular debe iniciar por 3");
                setPhone("");
              } else {
                const num = parseInt(e.target.value) || "";
                setPhone(num);
              }
            }}
            required
          />
          <HideInput
            id="otp"
            label="Número OTP"
            type="text"
            name="otp"
            minLength={4}
            maxLength={10}
            autoComplete="off"
            value={otp}
            onInput={(e, valor) => {
              let num = valor.replace(/[\s\.\-+eE]/g, "");
              if (!isNaN(valor)) {
                setOtp(num);
              }
            }}
            required
          ></HideInput>
          <MoneyInput
            id="valor"
            name="valor"
            label="Valor a retirar"
            autoComplete="off"
            type="text"
            maxLength={"9"}
            // min={limitesMontos?.min}
            // max={limitesMontos?.max}
            required
            min={enumParametrosGrupoAval.minRetiroCuentas}
            max={enumParametrosGrupoAval.maxRetiroCuentas}
            value={parseInt(valor)}
            onInput={(e, monto) => {
              if (!isNaN(monto)) {
                setValor(monto);
              }
            }}
            equalError={false}
            equalErrorMin={false}
          />
          <ButtonBar className={"lg:col-span-2"}>
            <Button type={"submit"}>Continuar</Button>
          </ButtonBar>
        </Form>
        <Modal
          show={showModal}
          handleClose={
            paymentStatus
              ? goToRecaudo
              : loadingRetiroCorresponsalGrupoAval
              ? () => {}
              : handleClose
          }
        >
          {paymentStatus ? (
            <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
              <TicketsAval refPrint={printDiv} ticket={paymentStatus} />
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button onClick={goToRecaudo}>Cerrar</Button>
              </ButtonBar>
            </div>
          ) : (
            <PaymentSummary summaryTrx={summary}>
              <ButtonBar>
                <Button
                  onClick={(e) => {
                    handleClose();
                    notifyError("Transacción cancelada por el usuario");
                  }}
                  disabled={loadingRetiroCorresponsalGrupoAval}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={onMakePayment}
                  disabled={loadingRetiroCorresponsalGrupoAval}
                >
                  Realizar retiro
                </Button>
              </ButtonBar>
            </PaymentSummary>
          )}
        </Modal>
      </Fragment>
    </>
  );
};

export default Retiro;
