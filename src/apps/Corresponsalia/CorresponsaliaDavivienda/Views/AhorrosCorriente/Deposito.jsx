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
import { makeMoneyFormatter } from "../../../../../utils/functions";

const Deposito = () => {
  const navigate = useNavigate();

  const [limitesMontos, setLimitesMontos] = useState({
    max: 9999999,
    min: 5000,
  });

  const onChangeMoney = useMoney({
    limits: [limitesMontos.min, limitesMontos.max],
  });

  const { roleInfo, infoTicket } = useAuth();

  const [loadingDepositoCorresponsal, fetchDepositoCorresponsal] =
    useFetch(depositoCorresponsal);
  const [loadingConsultaCostoCB, fetchConsultaCostoCB] =
    useFetch(consultaCostoCB);
  const [, fetchTypes] = useFetch();

  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [datosConsulta, setDatosConsulta] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [numCuenta, setNumCuenta] = useState("")
  const [userDoc, setUserDoc] = useState("")
  const [valor, setValor] = useState("")
  const [nomDepositante, setNomDepositante] = useState("")
  const [summary, setSummary] = useState([])

  const options = [
    { value: "", label: "" },
    { value: "02", label: "Corriente" },
    { value: "01", label: "Ahorros" },
  ];

  const optionsDocumento = [
    { value: "", label: "" },
    { value: "01", label: "Cédula Ciudadanía" },
    { value: "02", label: "Cédula Extranjería" },
    { value: "04", label: "Tarjeta Identidad" },
    { value: "13", label: "Regitro Civil" },
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
    setTipoCuenta("")
    setTipoDocumento("")
    setNomDepositante("")
    setNumCuenta("")
    setValor("")
    setUserDoc("")

  }, []);

  const onSubmitDeposit = useCallback(
    (e) => {
      e.preventDefault();
      setIsUploading(true);

      const { min, max } = limitesMontos;

      if (valor >= min && valor < max) {
        const formData = new FormData(e.target);
        const numCuenta = formData.get("numCuenta");
        const userDoc = formData.get("docCliente");
        const valorFormat = formData.get("valor");
        const nomDepositante = formData.get("nomDepositante");

        const body = {
          idComercio: roleInfo?.id_comercio,
          idUsuario: roleInfo?.id_usuario,
          idDispositivo: roleInfo?.id_dispositivo,
          Tipo: roleInfo?.tipo_comercio,
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
              return;
            } else {
              setDatosConsulta(res?.obj?.Data);
              const summary = {
                "Nombre titular": res?.obj?.Data?.valNombreTitular,
                "Apellido titular": res?.obj?.Data?.valApellidoTitular,
                "Número cuenta": numCuenta,
                "Valor depósito": valorFormat,
                "Valor cobro": formatMoney.format(
                  res?.obj?.Data?.numValorCobro
                ),
              };
              setSummary(summary)
              setShowModal(true);
            }

            //notify("Transaccion satisfactoria");
          })
          .catch((err) => {
            setIsUploading(false);
            console.error(err);
            notifyError("Error interno en la transaccion");
          });
      } else {
        setIsUploading(false);
        notifyError(
          `El valor del deposito debe estar entre ${formatMoney.format(
            min
          )} y ${formatMoney.format(max)}`
        );
      }
    },
    [valor, limitesMontos, tipoCuenta]
  );

  const onMoneyChange = useCallback(
    (e, valor) => {
      setValor(valor)
    },
    [valor]
  );

  const goToRecaudo = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onMakePayment = useCallback(() => {
    setIsUploading(true);
    const body = {
      idComercio: roleInfo?.id_comercio,
      idUsuario: roleInfo?.id_usuario,
      idDispositivo: roleInfo?.id_dispositivo,
      Tipo: roleInfo?.tipo_comercio,
      numTipoCuenta: tipoCuenta,
      numNumeroCuenta: numCuenta,
      numIdDepositante: userDoc,
      //valToken: "valToken",
      numValorConsignacion: valor,
      direccion: roleInfo?.direccion,
      cod_dane: roleInfo?.codigo_dane,
      nomdepositante: nomDepositante,
      tip_id_depositante: tipoDocumento,
    };

    fetchDepositoCorresponsal(body)
      .then((res) => {
        setIsUploading(false);
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        notify("Transaccion satisfactoria");
        const trx_id = res?.obj?.DataHeader?.idTransaccion ?? 0;
        const ter = res?.obj?.DataHeader?.total ?? res?.obj?.Data?.total;

        const tempTicket = {
          title: "Depósito A Cuentas Davivienda",
          timeInfo: {
            "Fecha de venta": Intl.DateTimeFormat("es-CO", {
              year: "2-digit",
              month: "2-digit",
              day: "2-digit",
            }).format(new Date()),
            Hora: Intl.DateTimeFormat("es-CO", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }).format(new Date()),
          },
          commerceInfo: [
            ["Id Comercio", roleInfo?.id_comercio],
            ["No. terminal", ter],
            ["Municipio", roleInfo?.ciudad],
            ["Dirección", roleInfo?.direccion],
            ["Tipo de operación", "Depósito A Cuentas"],
            ["", ""],
            ["No. de aprobación", trx_id],
            ["", ""],
          ],
          commerceName: roleInfo?.["nombre comercio"]
          ? roleInfo?.["nombre comercio"]
          : "No hay datos",
          trxInfo: [
            [
              "Tipo",
              res?.obj?.Data?.numTipoCuenta === "01" ? "Ahorros" : "Corriente",
            ],
            ["",""],
            [
              "Nro. Cuenta",
              "****" + res?.obj?.Data?.numNumeroDeCuenta?.slice(-4),
            ],
            ["",""],
            ["Valor", formatMoney.format(valor)],
            ["", ""],
            ["Costo transacción", formatMoney.format(res?.obj?.Data?.numValorCobro)],
            ["", ""],
            ["Total", formatMoney.format(valor)],
            ["", ""],
            ["Identificación depositante", userDoc],
            ["", ""],
            ["Nombre depositante", nomDepositante],
            ["", ""],
          ],
          disclamer: "Para quejas o reclamos comuniquese al *num PDP*",
        };
        setPaymentStatus(tempTicket);
        infoTicket(trx_id, res?.obj?.id_tipo_operacion, tempTicket) ////////////////////////////////////
          .then((resTicket) => {
            console.log(resTicket);
          })
          .catch((err) => {
            console.error(err);
            notifyError("Error guardando el ticket");
          });
      })
      .catch((err) => {
        setIsUploading(false);
        console.error(err);
        notifyError("Error interno en la transaccion");
      });
  }, [
    numCuenta,
    valor,
    tipoCuenta,
    userDoc,
    fetchDepositoCorresponsal,
    roleInfo,
    infoTicket,
    ,
    datosConsulta,
  ]);
  console.log(tipoCuenta);

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
              if (!isNaN(e.target.value)){
                setNumCuenta(e.target.value)
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
            maxLength={"16"}
            value={userDoc}
            onInput={(e) => {
              if (!isNaN(e.target.value)){
                setUserDoc(e.target.value)
              }
            }}
            required
          />
          <Input
            id='nomDepositante'
            name='nomDepositante'
            label='Nombre depositante'
            type='text'
            minLength={"1"}
            maxLength={"50"}
            autoComplete='off'
            value={nomDepositante}
            onInput={(e) =>{setNomDepositante(e.target.value)}}
            required
          />
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
          <Input
          id="valor"
          name="valor"
          label="Valor a depositar"
          autoComplete="off"
          type="text"
          minLength={"1"}
          maxLength={"15"}
          min={limitesMontos?.min}
          max={limitesMontos?.max}
          value={makeMoneyFormatter(0).format(valor)}
          onInput={(ev) => setValor(onChangeMoney(ev))}
          required
           />
          <ButtonBar className={"lg:col-span-2"}>
            <Button type={"submit"} disabled={loadingConsultaCostoCB}>
              Realizar deposito
            </Button>
          </ButtonBar>
        </Form>
        <Modal
          show={showModal}
          handleClose={
            paymentStatus
              ? () => {}
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
