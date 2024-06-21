import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Button from "../../../../../components/Base/Button";
import Modal from "../../../../../components/Base/Modal";
import useQuery from "../../../../../hooks/useQuery";
import {
  Fragment,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";
import TicketsAval from "../../components/TicketsAval";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import {
  depositoCorresponsalGrupoAval,
  consultaCostoGrupoAval,
} from "../../utils/fetchCorresponsaliaGrupoAval";
import { notify, notifyError } from "../../../../../utils/notify";
import MoneyInput, {
  formatMoney,
} from "../../../../../components/Base/MoneyInput";
import { useFetch } from "../../../../../hooks/useFetch";
import { useAuth } from "../../../../../hooks/AuthHooks";
import Select from "../../../../../components/Base/Select";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import { enumParametrosGrupoAval } from "../../utils/enumParametrosGrupoAval";
import { useMFA } from "../../../../../components/Base/MFAScreen";

const Deposito = () => {
  const navigate = useNavigate();

  const { submitEventSetter } = useMFA();

  const [limitesMontos, setLimitesMontos] = useState({
    max: enumParametrosGrupoAval.maxDepositoCuentas,
    min: enumParametrosGrupoAval.minDepositoCuentas,
  });

  const { roleInfo, pdpUser } = useAuth();

  const [
    loadingDepositoCorresponsalGrupoAval,
    fetchDepositoCorresponsalGrupoAval,
  ] = useFetch(depositoCorresponsalGrupoAval);
  const [loadingConsultaCostoGrupoAval, fetchConsultaCostoGrupoAval] = useFetch(
    consultaCostoGrupoAval
  );
  const [, fetchTypes] = useFetch();

  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [datosConsulta, setDatosConsulta] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("01");
  const [isUploading, setIsUploading] = useState(false);
  const [numCuenta, setNumCuenta] = useState("");
  const [userDoc, setUserDoc] = useState("");
  const [valor, setValor] = useState("");
  const [summary, setSummary] = useState([]);
  const [banco, setBanco] = useState("");
  const [phone, setPhone] = useState("");
  const [showBTNConsulta, setShowBTNConsulta] = useState(true);
  const optionsBanco = [
    { value: "", label: "" },
    { value: "0052", label: "Banco AvVillas" },
    { value: "0001", label: "Banco Bogotá" },
    { value: "0023", label: "Banco Occidente" },
    { value: "0002", label: "Banco Popular" },
    // { value: "0054", label: "ATH" },
  ];

  const DataBanco = useMemo(() => {
    const resp = optionsBanco?.filter((id) => id.value === banco);
    const DataBanco = { nombre: resp[0]?.label, idBanco: resp[0]?.value };
    return DataBanco;
  }, [optionsBanco, banco]);

  const options = [
    { value: "01", label: "Ahorros" },
    { value: "02", label: "Corriente" },
  ];

  // const optionsDocumento = [
  //   { value: "", label: "" },
  //   { value: "01", label: "Cédula Ciudadanía" },
  //   { value: "02", label: "Cédula Extranjería" },
  //   { value: "04", label: "Tarjeta Identidad" },
  //   { value: "13", label: "Registro Civil" },
  // ];

  const onSubmitModal = useCallback(
    (e) => {
      e.preventDefault();
      const { min, max } = limitesMontos;
      if (valor >= min && valor <= max) {
        const summary = {
          Banco: DataBanco?.nombre,
          "Tipo de cuenta": tipoCuenta === "01" ? "Ahorros" : "Corriente",
          "Número de cuenta": numCuenta,
          Documento: userDoc,
          "Número celular": phone,
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
    [userDoc, phone, valor, DataBanco, numCuenta, tipoCuenta, limitesMontos]
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
          "El usuario no cuenta con datos de comercio, no se permite la transacción"
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
    setUserDoc("");
    setPhone("");
    setBanco("");
    setShowBTNConsulta(true);
    setSummary([]);
  }, []);

  const consultarCosto = useCallback(
    (e) => {
      e.preventDefault();
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

        consultaCosto: {
          idBancoAdquiriente: DataBanco?.idBanco,
          numNumeroDocumento: userDoc,
          numValorTransaccion: valor,

          location: {
            codDane: roleInfo?.codigo_dane,
            ciudad: roleInfo?.ciudad,
            direccion: roleInfo?.direccion,
          },
        },
      };
      fetchConsultaCostoGrupoAval(body)
        .then((res) => {
          setIsUploading(false);
          if (!res?.status) {
            notifyError(res?.msg);
            handleClose();
            // return;
          } else {
            setDatosConsulta(res?.obj?.Data);
            const summary = {
              Banco: DataBanco?.nombre,
              "Tipo de cuenta": tipoCuenta === "01" ? "Ahorros" : "Corriente",
              "Número de cuenta": numCuenta,
              Documento: userDoc,
              "Número celular": phone,
              "Valor depósito": formatMoney.format(valor),
              "Costo transacción": formatMoney.format(res?.obj?.costoTrx),
            };
            setSummary(summary);
            setShowModal(true);
            notify("Transacción satisfactoria");
            setShowBTNConsulta(false);
          }
        })
        .catch((err) => {
          setIsUploading(false);
          console.error(err);
          notifyError("No se ha podido conectar al servidor");
        });
    },
    [
      valor,
      limitesMontos,
      DataBanco,
      roleInfo,
      userDoc,
      numCuenta,
      phone,
      tipoCuenta,
    ]
  );

  const onMoneyChange = useCallback(
    (e, valor) => {
      setValor(valor);
    },
    [valor]
  );

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

      depositoCuentas: {
        idBancoAdquiriente: DataBanco?.idBanco,
        numNumeroDocumento: userDoc,
        numValorTransaccion: valor,
        numTipoCuenta: tipoCuenta,
        numCelular: phone,
        numCuenta: numCuenta,

        location: {
          codDane: roleInfo?.codigo_dane,
          ciudad: roleInfo?.ciudad,
          direccion: roleInfo?.direccion,
        },
      },
      nombre_usuario: pdpUser?.uname ?? "",
    };

    fetchDepositoCorresponsalGrupoAval(body)
      .then((res) => {
        setIsUploading(false);
        if (!res?.status) {
          notifyError(res?.msg);
          handleClose();
          return;
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
    roleInfo,
    valor,
    DataBanco?.idBanco,
    userDoc,
    tipoCuenta,
    phone,
    numCuenta,
    pdpUser?.uname,
    fetchDepositoCorresponsalGrupoAval,
    handleClose,
  ]);

  return (
    <>
      <SimpleLoading show={isUploading} />
      <Fragment>
        <h1 className="text-3xl mt-6">Depósitos</h1>
        <br></br>
        <Form onSubmit={onSubmitModal} grid>
          <Select
            id="banco"
            label="Banco a depositar"
            options={optionsBanco}
            value={banco}
            onChange={(e) => {
              setBanco(e.target.value);
            }}
            required
          />
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
            minLength={"9"}
            maxLength={"14"}
            value={numCuenta}
            onInput={(e) => {
              const num = e.target.value.replace(/[\s\.\-+eE]/g, "");
              if (!isNaN(num)) {
                setNumCuenta(num);
              }
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
          <MoneyInput
            id="valor"
            name="valor"
            label="Valor a depositar"
            autoComplete="off"
            type="text"
            maxLength={"10"}
            // value={makeMoneyFormatter(0).format(valor)}
            // onInput={(ev) => setValor(onChangeMoney(ev))}
            required
            min={enumParametrosGrupoAval.minDepositoCuentas}
            max={enumParametrosGrupoAval.maxDepositoCuentas}
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
            <Button type={"submit"} disabled={loadingConsultaCostoGrupoAval}>
              Continuar
            </Button>
          </ButtonBar>
        </Form>
        <Modal
          show={showModal}
          handleClose={
            paymentStatus
              ? goToRecaudo
              : loadingDepositoCorresponsalGrupoAval
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
                  type="submit"
                  onClick={submitEventSetter(onMakePayment)}
                  disabled={loadingDepositoCorresponsalGrupoAval}
                >
                  Realizar depósito
                </Button>
                {/* {showBTNConsulta ? 
                <Button
                type='submit'
                onClick={consultarCosto}
                disabled={loadingDepositoCorresponsalGrupoAval}>
                Consultar costo
                </Button>                
                :
                ""
                } */}

                <Button
                  onClick={(e) => {
                    handleClose();
                    notifyError("Transacción cancelada por el usuario");
                  }}
                  disabled={loadingDepositoCorresponsalGrupoAval}
                >
                  Cancelar
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
