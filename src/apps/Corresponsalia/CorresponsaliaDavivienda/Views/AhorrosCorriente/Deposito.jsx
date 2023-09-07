import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Button from "../../../../../components/Base/Button";
import Modal from "../../../../../components/Base/Modal";
import useQuery from "../../../../../hooks/useQuery";
import { Fragment, useState, useCallback, useRef, useEffect } from "react";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";
import Tickets from "../../components/TicketsDavivienda";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import {
  depositoCorresponsal,
  consultaCostoCB,
} from "../../utils/fetchCorresponsaliaDavivienda";
import { notify, notifyError } from "../../../../../utils/notify";
import MoneyInput, {
  formatMoney,
} from "../../../../../components/Base/MoneyInput";
import { useFetch } from "../../../../../hooks/useFetch";
import { useAuth } from "../../../../../hooks/AuthHooks";
import Select from "../../../../../components/Base/Select";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import useMoney from "../../../../../hooks/useMoney";
import { enumParametrosDavivienda } from "../../utils/enumParametrosDavivienda";

const Deposito = () => {
  const navigate = useNavigate();

  const [limitesMontos, setLimitesMontos] = useState({
    max: enumParametrosDavivienda.maxDepositoCuentas,
    min: enumParametrosDavivienda.minDepositoCuentas,
  });

  const onChangeMoney = useMoney({
    limits: [limitesMontos.min, limitesMontos.max],
    equalError: false,
  });

  const { roleInfo, infoTicket, pdpUser } = useAuth();

  const [loadingDepositoCorresponsal, fetchDepositoCorresponsal] =
    useFetch(depositoCorresponsal);
  const [loadingConsultaCostoCB, fetchConsultaCostoCB] =
    useFetch(consultaCostoCB);
  const [, fetchTypes] = useFetch();

  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [datosConsulta, setDatosConsulta] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("01");
  const [isUploading, setIsUploading] = useState(false);
  const [numCuenta, setNumCuenta] = useState("");
  const [userDoc, setUserDoc] = useState("");
  const [valor, setValor] = useState("");
  const [nomDepositante, setNomDepositante] = useState("");
  const [summary, setSummary] = useState([]);

  const [objTicketActual, setObjTicketActual] = useState({
    title: "Depósito A Cuentas Davivienda",
    timeInfo: {
      "Fecha de venta": "",
      Hora: "",
    },
    commerceInfo: [
      /*id transaccion recarga*/
      /*id_comercio*/
      ["Id comercio", roleInfo?.id_comercio ? roleInfo?.id_comercio : 1],
      /*id_dispositivo*/
      ["No. terminal", roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 1],
      /*ciudad*/
      ["Municipio", roleInfo?.ciudad ? roleInfo?.ciudad : "No hay datos"],
      /*direccion*/
      ["Dirección", roleInfo?.direccion ? roleInfo?.direccion : "No hay datos"],
      ["Tipo de operación", "Depósito A Cuentas"],
      ["", ""],
    ],
    commerceName: roleInfo?.["nombre comercio"]
      ? roleInfo?.["nombre comercio"]
      : "No hay datos",
    trxInfo: [],
    disclamer:
      "Línea de atención Bogotá:338 38 38 \nResto del país:01 8000 123 838",
  });

  const options = [
    { value: "", label: "" },
    { value: "01", label: "Ahorros" },
    { value: "02", label: "Corriente" },
  ];

  const optionsDocumento = [
    { value: "01", label: "Cédula Ciudadanía" },
    { value: "02", label: "Cédula Extranjería" },
    { value: "04", label: "Tarjeta Identidad" },
    { value: "13", label: "Registro Civil" },
  ];

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
    setTipoCuenta("");
    setTipoDocumento("01");
    setNomDepositante("");
    setNumCuenta("");
    setValor("");
    setUserDoc("");
    setSummary([]);
  }, []);

  const onSubmitDeposit = useCallback(
    (e) => {
      e.preventDefault();
      setIsUploading(true);

      const { min, max } = limitesMontos;

      if (valor >= min && valor <= max) {
        const formData = new FormData(e.target);
        const numCuenta = formData.get("numCuenta");
        const userDoc = formData.get("docCliente");
        const valorFormat = formData.get("valor");
        const nomDepositante = formData.get("nomDepositante");

        const body = {
          idComercio: roleInfo?.id_comercio,
          idUsuario: roleInfo?.id_usuario,
          idDispositivo: roleInfo?.id_dispositivo,
          nombre_usuario: pdpUser?.uname ?? "",
          // Tipo: roleInfo?.tipo_comercio,
          numTipoTransaccion: 5706, /// Deposito
          numTipoDocumento: tipoDocumento, /// Cedula
          numNumeroDocumento: userDoc,
          numValorTransaccion: valor,
          numTipoCuenta: tipoCuenta,
          //nomDepositante: nomDepositante,
          //valToken: "valToken", /// De donde viene
          numNumeroDeCuenta: numCuenta,
        };
        fetchConsultaCostoCB(body)
          .then((res) => {
            setIsUploading(false);
            if (!res?.status) {
              notifyError(res?.msg);
              setTipoCuenta("");
              setTipoDocumento("01");
              setNomDepositante("");
              setNumCuenta("");
              setValor("");
              setUserDoc("");
              return;
            } else {
              setDatosConsulta(res?.obj?.Data);
              let summary = {
                "Nombre titular":
                  res?.obj?.Data?.valNombreTitular +
                  " " +
                  res?.obj?.Data?.valApellidoTitular,
                "Número cuenta": numCuenta,
                "Valor depósito": valorFormat,
              };
              if (
                process.env.REACT_APP_SHOW_COSTO_DEPOSITO_DAVIVIENDA === "true"
              ) {
                summary["Valor cobro"] = formatMoney.format(
                  res?.obj?.Data?.numValorCobro
                );
              }

              setSummary(summary);
              setShowModal(true);
            }

            //notify("Transaccion satisfactoria");
          })
          .catch((err) => {
            setIsUploading(false);
            console.error(err);
            notifyError("No se ha podido conectar al servidor");
          });
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
    [valor, limitesMontos, tipoCuenta, pdpUser]
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
    const fecha = Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    /*hora actual */
    const hora = Intl.DateTimeFormat("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date());
    const objTicket = { ...objTicketActual };
    objTicket["trxInfo"] = [];
    objTicket["timeInfo"]["Fecha de venta"] = fecha;
    objTicket["timeInfo"]["Hora"] = hora;
    objTicket["trxInfo"].push(["Nombre titular", summary["Nombre titular"]]);
    objTicket["trxInfo"].push(["", ""]);
    setIsUploading(true);
    const body = {
      idComercio: roleInfo?.id_comercio,
      idUsuario: roleInfo?.id_usuario,
      idDispositivo: roleInfo?.id_dispositivo,
      nombre_usuario: pdpUser?.uname ?? "",
      // Tipo: roleInfo?.tipo_comercio,
      oficinaPropia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
        roleInfo?.tipo_comercio === "KIOSCO"
          ? true
          : false,
      numTipoCuenta: tipoCuenta,
      numNumeroCuenta: numCuenta,
      numIdDepositante: userDoc,
      //valToken: "valToken",
      numValorConsignacion: valor,
      direccion: roleInfo?.direccion,
      cod_dane: roleInfo?.codigo_dane,
      nomdepositante: nomDepositante,
      tip_id_depositante: tipoDocumento,
      ticket: objTicket,
      mostrar_costo:
        process.env.REACT_APP_SHOW_COSTO_DEPOSITO_DAVIVIENDA === "true"
          ? true
          : false,
    };

    fetchDepositoCorresponsal(body)
      .then((res) => {
        setIsUploading(false);
        if (!res?.status) {
          notifyError(res?.msg);
          handleClose();
          return;
        }
        notify("Transaccion satisfactoria");
        const trx_id = res?.obj?.DataHeader?.idTransaccion ?? 0;
        const trx_id2 = res?.obj?.DataHeader?.idTransaccion ?? 0;
        const ter = res?.obj?.DataHeader?.total ?? res?.obj?.Data?.total;
        objTicket["commerceInfo"][1] = ["No. terminal", ter];
        objTicket["commerceInfo"].push(["No. de aprobación Banco", trx_id]);
        objTicket["commerceInfo"].push(["", ""]);
        objTicket["commerceInfo"].push(["No. de aprobación Aliado", trx_id2]);
        objTicket["commerceInfo"].push(["", ""]);
        objTicket["trxInfo"].push([
          "Tipo de cuenta",
          res?.obj?.Data?.numTipoCuenta === 1 ? "Ahorros" : "Corriente",
        ]);
        objTicket["trxInfo"].push(["", ""]);
        objTicket["trxInfo"].push([
          "Nro. Cuenta",
          `****${String(res?.obj?.Data?.numNumeroDeCuenta)?.slice(-4) ?? ""}`,
        ]);
        objTicket["trxInfo"].push(["", ""]);
        objTicket["trxInfo"].push(["Valor", formatMoney.format(valor)]);
        objTicket["trxInfo"].push(["", ""]);
        if (process.env.REACT_APP_SHOW_COSTO_DEPOSITO_DAVIVIENDA === "true") {
          objTicket["trxInfo"].push([
            "Costo transacción",
            formatMoney.format(res?.obj?.Data?.numValorCobro),
          ]);
          objTicket["trxInfo"].push(["", ""]);
        }

        objTicket["trxInfo"].push(["Total", formatMoney.format(valor)]);
        objTicket["trxInfo"].push(["", ""]);
        setPaymentStatus(objTicket);
      })
      .catch((err) => {
        setIsUploading(false);
        console.error(err);
        notifyError("No se ha podido conectar al servidor");
      });
  }, [
    numCuenta,
    valor,
    tipoCuenta,
    userDoc,
    fetchDepositoCorresponsal,
    roleInfo,
    infoTicket,
    summary,
    datosConsulta,
    pdpUser,
  ]);

  return (
    <>
      <SimpleLoading show={isUploading} />
      <Fragment>
        <h1 className='text-3xl mt-6'>Depósitos</h1>
        <br></br>
        <Form onSubmit={onSubmitDeposit} grid>
          <Select
            id='tipoCuenta'
            label='Tipo de cuenta'
            options={options}
            value={tipoCuenta}
            required
            onChange={(e) => {
              setTipoCuenta(e.target.value);
            }}
          />
          <Input
            id='numCuenta'
            name='numCuenta'
            label='Número de cuenta'
            type='text'
            autoComplete='off'
            minLength={"10"}
            maxLength={"16"}
            value={numCuenta}
            onInput={(e) => {
              const num = e.target.value.replace(/[\s\.\-+eE]/g, "");
              if (!isNaN(num)) {
                setNumCuenta(num);
              }
            }}
            required
          />
          <Select
            id='tipoDocumento'
            label='Tipo de documento'
            options={optionsDocumento}
            value={tipoDocumento}
            required
            onChange={(e) => {
              setTipoDocumento(e.target.value);
            }}
          />
          <Input
            id='docCliente'
            name='docCliente'
            label='Documento depositante'
            type='text'
            autoComplete='off'
            minLength={"5"}
            maxLength={"11"}
            value={userDoc}
            onInput={(e) => {
              const num = e.target.value.replace(/[\s\.\-+eE]/g, "");
              if (!isNaN(num)) {
                setUserDoc(num);
              }
            }}
            required
          />
          {/* <Input
            id='nomDepositante'
            name='nomDepositante'
            label='Nombre depositante'
            type='text'
            minLength={"1"}
            maxLength={"50"}
            autoComplete='off'
            value={nomDepositante}
            onInput={(e) =>{
              if (isNaN(e.target.value) || e.target.value ===""){
              setNomDepositante(e.target.value)}
            }
            }
            required
          /> */}
          {/* <MoneyInput
            id='valor'
            name='valor'
            label='Valor a depositar'
            autoComplete='off'
            min={limitesMontos?.min}
            max={limitesMontos?.max}
            minLength={"1"}
            maxLength={"15"}
            onInput={onMoneyChange}
            required
          /> */}
          <MoneyInput
            id='valor'
            name='valor'
            label='Valor a depositar'
            autoComplete='off'
            type='text'
            minLength={"1"}
            maxLength={"15"}
            min={limitesMontos?.min}
            max={limitesMontos?.max}
            equalError={false}
            equalErrorMin={false}
            value={parseInt(valor)}
            onInput={(e, valor) => {
              if (!isNaN(valor)){
                const num = valor;
                setValor(num)
              }
            }}
            required
          />
          <ButtonBar className={"lg:col-span-2"}>
            <Button type={"submit"} disabled={loadingConsultaCostoCB}>
              Realizar depósito
            </Button>
          </ButtonBar>
        </Form>
        <Modal
          show={showModal}
          handleClose={
            paymentStatus
              ? goToRecaudo
              : loadingDepositoCorresponsal
              ? () => {}
              : handleClose
          }>
          {paymentStatus ? (
            <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center'>
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button onClick={goToRecaudo}>Cerrar</Button>
              </ButtonBar>
              <Tickets refPrint={printDiv} ticket={paymentStatus} />
            </div>
          ) : (
            <PaymentSummary summaryTrx={summary}>
              <ButtonBar>
                <Button
                  type='submit'
                  onClick={onMakePayment}
                  disabled={loadingDepositoCorresponsal}>
                  Aceptar
                </Button>
                <Button
                  onClick={handleClose}
                  disabled={loadingDepositoCorresponsal}>
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
