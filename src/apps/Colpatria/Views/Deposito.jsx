import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import Select from "../../../components/Base/Select";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import { useAuth } from "../../../hooks/AuthHooks";
import useMoney from "../../../hooks/useMoney";
import { makeDeposit } from "../utils/fetchFunctions";

import { notifyPending, notifyError } from "../../../utils/notify";
import {
  makeMoneyFormatter,
  onChangeAccountNumber,
  onChangeNumber,
  toAccountNumber,
} from "../../../utils/functions";
import fetchData from "../../../utils/fetchData";
import TicketColpatria from "../components/TicketColpatria";
import { useMFA } from "../../../components/Base/MFAScreen";

const accountTypes = {
  10: "Cuenta ahorros",
  20: "Cuenta corriente",
};

const formatMoney = makeMoneyFormatter(2);

const Deposito = () => {
  const navigate = useNavigate();

  const { roleInfo, pdpUser } = useAuth();

  const { submitEventSetter } = useMFA();

  const [userDocument, setUserDocument] = useState("");
  const [userAddress /* , setUserAddress */] = useState(
    roleInfo?.direccion ?? ""
  );
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState("");
  const [valDeposito, setValDeposito] = useState(0);

  const [limitesMontos, setLimitesMontos] = useState({
    max: 9999999,
    min: 5000,
  });

  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const onChangeMoney = useMoney({
    limits: [limitesMontos.min, limitesMontos.max],
  });

  const [loadingDeposit, setLoadingDeposit] = useState(false);

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const summary = useMemo(
    () => ({
      "Tipo de cuenta": accountTypes?.[accountType] ?? "No type",
      "Número de cuenta": toAccountNumber(accountNumber),
      "No. Documento del depositante": userDocument,
      "Valor de depósito": formatMoney.format(valDeposito),
      // "Valor de la comision": formatMoney.format(valorComision),
      // "Valor total": formatMoney.format(valor + valorComision),
    }),
    [accountNumber, accountType, userDocument, valDeposito]
  );

  const handleClose = useCallback(() => {
    setShowModal(false);
    navigate("/corresponsalia/colpatria");
  }, [navigate]);

  const onMakePayment = useCallback(
    (ev) => {
      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO",
        valor_total_trx: valDeposito,
        nombre_usuario: pdpUser?.uname ?? "",
        nombre_comercio: roleInfo?.["nombre comercio"] ?? "",
        ticket_init: [
          ["Tipo de cuenta", accountTypes?.[accountType] ?? "No type"],
          ["", ""],
          ["Número de cuenta", toAccountNumber(accountNumber)],
          ["", ""],
          ["No. Documento del depositante", userDocument],
          ["", ""],
          ["Valor de depósito", formatMoney.format(valDeposito)],
          ["", ""],
        ],

        // Datos trx colpatria
        colpatria: {
          user_document: userDocument,
          account_number: accountNumber,
          processing_code: accountType,
          location: {
            address: userAddress,
            dane_code: roleInfo?.codigo_dane,
            city: roleInfo?.ciudad.substring(0, 7),
          },
        },
      };
      notifyPending(
        makeDeposit(data),
        {
          render() {
            setLoadingDeposit(true);
            return "Procesando transacción";
          },
        },
        {
          render({ data: res }) {
            setLoadingDeposit(false);
            setPaymentStatus(res?.obj?.ticket ?? {});
            return "Transacción satisfactoria";
          },
        },
        {
          render({ data: err }) {
            setLoadingDeposit(false);
            navigate("/corresponsalia/colpatria");
            if (err?.cause === "custom") {
              return <p style={{ whiteSpace: "pre-wrap" }}>{err?.message}</p>;
            }
            console.error(err?.message);
            return "Transacción fallida";
          },
        }
      );
    },
    [
      accountNumber,
      accountType,
      userDocument,
      userAddress,
      valDeposito,
      roleInfo,
      pdpUser?.uname,
      navigate,
    ]
  );

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_URL_TRXS_TRX}/tipos-operaciones`,
      "GET",
      { tipo_op: 70 }
    )
      .then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        const _parametros = res?.obj?.[0]?.Parametros;
        setLimitesMontos({
          max: parseFloat(_parametros?.monto_maximo),
          min: parseFloat(_parametros?.monto_minimo),
        });

        // setRevalTrxParams({
        //   idcliente: parseFloat(_parametros?.idcliente) ?? 0,
        //   idpersona: parseFloat(_parametros?.idpersona) ?? 0,
        //   NoidentificacionCajero: _parametros?.NoidentificacionCajero ?? "",
        // });
      })
      .catch((err) => {
        console.error(err);
        notifyError("Error consultando parametros de la transacción");
      });
  }, []);

  /**
   * Check if has commerce data
   */

  const hasData = useMemo(() => {
    if (!roleInfo || (roleInfo && Object.keys(roleInfo).length === 0)) {
      return false;
    }
    const keys = [
      "id_comercio",
      "id_usuario",
      "tipo_comercio",
      "id_dispositivo",
      "ciudad",
      "direccion",
      "codigo_dane",
    ];
    for (const key of keys) {
      if (!(key in roleInfo)) {
        return false;
      }
    }
    return true;
  }, [roleInfo]);

  if (!hasData) {
    notifyError(
      "El usuario no cuenta con datos de comercio, no se permite la transacción"
    );
    return <Navigate to={"/"} replace />;
  }

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Depósitos Colpatria</h1>
      <Form
        onSubmit={(ev) => {
          ev.preventDefault();
          setShowModal(true);
        }}
        grid
      >
        <Select
          id="accType"
          name="accType"
          label="Tipo de cuenta"
          options={{
            "": "",
            ...Object.fromEntries(
              Object.entries(accountTypes).map(([key, val]) => [val, key])
            ),
          }}
          value={accountType}
          onChange={(ev) => setAccountType(ev.target.value)}
          required
        />
        <Input
          id="numCuenta"
          name="numCuenta"
          label="Número de cuenta"
          type="tel"
          autoComplete="off"
          minLength={"1"}
          maxLength={"19"}
          onInput={(ev) => setAccountNumber(onChangeAccountNumber(ev))}
          required
        />
        <Input
          id="docCliente"
          name="docCliente"
          label="No. Documento del Depositante"
          type="tel"
          autoComplete="off"
          minLength={"5"}
          maxLength={"12"}
          value={userDocument}
          onInput={(ev) => setUserDocument(onChangeNumber(ev))}
          required
        />
        <Input
          id="valor"
          name="valor"
          label="Valor a depositar"
          autoComplete="off"
          type="tel"
          minLength={"5"}
          maxLength={"13"}
          onInput={(ev) => setValDeposito(onChangeMoney(ev))}
          required
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Realizar depósito</Button>
        </ButtonBar>
      </Form>
      <Modal
        show={showModal}
        handleClose={paymentStatus || loadingDeposit ? () => {} : handleClose}
      >
        {paymentStatus ? (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <TicketColpatria refPrint={printDiv} ticket={paymentStatus} />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={() => navigate("/corresponsalia/colpatria")}>
                Cerrar
              </Button>
            </ButtonBar>
          </div>
        ) : (
          <PaymentSummary summaryTrx={summary}>
            <ButtonBar>
              <Button
                type="submit"
                onClick={submitEventSetter(onMakePayment)}
                disabled={loadingDeposit}
              >
                Aceptar
              </Button>
              <Button onClick={handleClose} disabled={loadingDeposit}>
                Cancelar
              </Button>
            </ButtonBar>
          </PaymentSummary>
        )}
      </Modal>
    </Fragment>
  );
};

export default Deposito;
