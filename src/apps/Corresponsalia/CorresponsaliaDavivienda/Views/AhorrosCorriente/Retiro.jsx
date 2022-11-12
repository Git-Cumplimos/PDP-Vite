import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Button from "../../../../../components/Base/Button";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Modal from "../../../../../components/Base/Modal";
import useQuery from "../../../../../hooks/useQuery";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  retiroCorresponsal,
  consultaCostoCB,
} from "../../utils/fetchCorresponsaliaDavivienda";
import {
  notify,
  notifyError,
  notifyPending,
} from "../../../../../utils/notify";
import Tickets from "../../components/TicketsDavivienda";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";
import MoneyInput, {
  formatMoney,
} from "../../../../../components/Base/MoneyInput";
import { useFetch } from "../../../../../hooks/useFetch";
import { useAuth } from "../../../../../hooks/AuthHooks";
import Select from "../../../../../components/Base/Select";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import HideInput from "../../../../../components/Base/HideInput";
import { makeMoneyFormatter } from "../../../../../utils/functions";
import useMoney from "../../../../../hooks/useMoney";
import { enumParametrosDavivienda } from "../../utils/enumParametrosDavivienda";

const Retiro = () => {
  const navigate = useNavigate();

  const { roleInfo, infoTicket } = useAuth();

  const [limitesMontos, setLimitesMontos] = useState({
    max: enumParametrosDavivienda.maxRetiroCuentas,
    min: enumParametrosDavivienda.minRetiroCuentas,
  });

  const onChangeMoney = useMoney({
    limits: [limitesMontos.min, limitesMontos.max],
    equalError: false,
  });

  const [loadingRetiroCorresponsal, fetchRetiroCorresponsal] =
    useFetch(retiroCorresponsal);
  const [loadingConsultaCostoCB, fetchConsultaCostoCB] =
    useFetch(consultaCostoCB);
  const [, fetchTypes] = useFetch();

  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [datosConsulta, setDatosConsulta] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("01");
  const [isUploading, setIsUploading] = useState(false);
  const [userDoc, setUserDoc] = useState("");
  const [valor, setValor] = useState("");
  const [otp, setOtp] = useState("");
  const [summary, setSummary] = useState([]);

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
    setValor("");
    setUserDoc("");
    setOtp("");
    setSummary([]);
  }, []);

  const onSubmitRetiro = useCallback(
    (e) => {
      e.preventDefault();
      setIsUploading(true);
      if (otp.length < 6) {
        setIsUploading(false);
        notifyError("El número OTP debe ser de 6 dígitos");
      } else {
        if (valor % 10000 === 0) {
          const { min, max } = limitesMontos;

          if (valor >= min && valor <= max) {
            const formData = new FormData(e.target);
            const userDoc = formData.get("docCliente");
            const valorFormat = formData.get("valor");
            const otp = formData.get("OTP");

            const body = {
              idComercio: roleInfo?.id_comercio,
              idUsuario: roleInfo?.id_usuario,
              idDispositivo: roleInfo?.id_dispositivo,
              // Tipo: roleInfo?.tipo_comercio,
              numTipoTransaccion: 2130, /// retiro
              numTipoDocumento: tipoDocumento, /// Cedula
              numNumeroDocumento: userDoc,
              numValorTransaccion: valor,
              //nomDepositante: nomDepositante,
              // valToken: "valToken", /// De donde viene
            };
            fetchConsultaCostoCB(body)
              .then((res) => {
                setIsUploading(false);
                if (!res?.status) {
                  notifyError(res?.msg);
                  setTipoCuenta("");
                  setTipoDocumento("01");
                  setValor("");
                  setUserDoc("");
                  setOtp("");
                  return;
                } else {
                  notifyError(
                    "Recuerde verificar si posee el efectivo suficiente para continuar con el retiro"
                  );
                  setDatosConsulta(res?.obj?.Data);
                  const summary = {
                    "Nombre cliente":
                      res?.obj?.Data?.valNombreTitular +
                      " " +
                      res?.obj?.Data?.valApellidoTitular,
                    // "Numero celular": numCuenta,
                    "Documento del cliente": userDoc,
                    //"Codigo OTP": otp,
                    "Valor de retiro": valorFormat,
                    "Valor cobro": formatMoney.format(
                      res?.obj?.Data?.numValorCobro
                    ),
                  };
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
              `El valor del retiro debe estar entre ${formatMoney
                .format(min)
                .replace(/(\$\s)/g, "$")} y ${formatMoney
                .format(max)
                .replace(/(\$\s)/g, "$")}`
            );
          }
        } else {
          setIsUploading(false);
          notifyError("El valor a retirar debe ser múltiplo de $10.000");
        }
      }
    },
    [valor, limitesMontos, otp]
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
      idComercio: roleInfo?.id_comercio,
      idUsuario: roleInfo?.id_usuario,
      idDispositivo: roleInfo?.id_dispositivo,
      // Tipo: roleInfo?.tipo_comercio,
      oficinaPropia: roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
      roleInfo?.tipo_comercio === "KIOSCO"
        ? true
        : false,
      numTipoDocumento: tipoDocumento,
      numNumeroDocumento: userDoc,
      numValorRetiro: valor,
      numOtp: otp,
      // valToken: "valToken",
      direccion: roleInfo?.direccion,
      cod_dane: roleInfo?.codigo_dane,
    };
    
    fetchRetiroCorresponsal(body)
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

        const tempTicket = {
          title: "Retiro De Cuentas Davivienda",
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
            ["Tipo de operación", "Retiro De Cuentas"],
            ["", ""],
            ["No. de aprobación Banco", trx_id],
            ["", ""],
            ["No. de aprobación Aliado", trx_id2],
            ["", ""],
          ],
          commerceName: roleInfo?.["nombre comercio"]
            ? roleInfo?.["nombre comercio"]
            : "No hay datos",
          trxInfo: [
            [
              "Tipo de cuenta",
              res?.obj?.Data?.numTipoCuenta === 1 ? "Ahorros" : "Corriente",
            ],
            ["", ""],
            [
              "Nro. Cuenta",
              `****${
                String(res?.obj?.Data?.numNumeroDeCuenta)?.slice(-4) ?? ""
              }`,
            ],
            ["", ""],
            ["Valor", formatMoney.format(valor)],
            ["", ""],
            [
              "Costo transacción",
              formatMoney.format(res?.obj?.Data?.numValorCobro),
            ],
            ["", ""],
            ["Total", formatMoney.format(valor)],
            ["", ""],

            //["Usuario de venta", "Nombre propietario del punto"],
          ],
          disclamer:
            "Línea de atención Bogotá:338 38 38 \nResto del país:01 8000 123 838",
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
        notifyError("No se ha podido conectar al servidor");
      });
  }, [
    valor,
    userDoc,
    fetchRetiroCorresponsal,
    roleInfo,
    infoTicket,
    datosConsulta,
    tipoDocumento,
  ]);

  return (
    <>
      <SimpleLoading show={isUploading} />
      <Fragment>
        <h1 className='text-3xl mt-6'>Retiros</h1>
        <Form onSubmit={onSubmitRetiro} grid>
          <Select
            id='tipoDocumento'
            label='Tipo de documento'
            options={optionsDocumento}
            value={tipoDocumento}
            onChange={(e) => {
              setTipoDocumento(e.target.value);
            }}
            required
          />
          <Input
            id='docCliente'
            name='docCliente'
            label='Documento cliente'
            type='text'
            autoComplete='off'
            minLength={"5"}
            maxLength={"11"}
            value={userDoc}
            onInput={(e) => {
              const num = e.target.value.replace(/[\s\.]/g, "");
              if (!isNaN(num)) {
                setUserDoc(num);
              }
            }}
            required
          />
          <HideInput
            id='otp'
            label='Número OTP'
            type='text'
            name='otp'
            minLength={"6"}
            maxLength={"6"}
            autoComplete='off'
            required
            value={otp}
            onInput={(e, valor) => {
              let num = valor.replace(/[\s\.]/g, "");
              if (!isNaN(valor)) {
                setOtp(num);
              }
            }}></HideInput>
          <Input
            id='valor'
            name='valor'
            label='Valor a retirar'
            autoComplete='off'
            type='text'
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
              Realizar retiro
            </Button>
          </ButtonBar>
        </Form>
        <Modal
          show={showModal}
          handleClose={
            paymentStatus
              ? goToRecaudo
              : loadingRetiroCorresponsal
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
                  disabled={loadingRetiroCorresponsal}>
                  Aceptar
                </Button>
                <Button
                  onClick={handleClose}
                  disabled={loadingRetiroCorresponsal}>
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

export default Retiro;
