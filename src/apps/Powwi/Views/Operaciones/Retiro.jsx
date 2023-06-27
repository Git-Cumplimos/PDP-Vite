import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Modal from "../../../../components/Base/Modal";
import useQuery from "../../../../hooks/useQuery";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  retiroCorresponsal,
  consultaCosto,
} from "../../utils/fetchCorresponsaliaPowwi";
import {
  notify,
  notifyError,
  notifyPending,
} from ".../../../../utils/notify";
import Tickets from "../../components/TicketsDavivienda";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import MoneyInput, {
  formatMoney,
} from "../../../../components/Base/MoneyInput";
import { useFetch } from "../../../../hooks/useFetch";
import { useAuth } from "../../../../hooks/AuthHooks";
import Select from "../../../../components/Base/Select";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import HideInput from "../../../../components/Base/HideInput";
import { makeMoneyFormatter } from "../../../../utils/functions";
import useMoney from "../../../../hooks/useMoney";
import { enumParametrosPowwi } from "../../utils/enumParametrosPowwi";
import { encryptPin } from "../../../Colpatria/utils/functions";
import { v4 } from "uuid";

const Retiro = () => {
  const navigate = useNavigate();

  const { roleInfo, infoTicket } = useAuth();

  // const [objTicketActual, setObjTicketActual] = useState({
  //   title: "Retiro De Cuentas Davivienda",
  //   timeInfo: {
  //     "Fecha de venta": "",
  //     Hora: "",
  //   },
  //   commerceInfo: [
  //     /*id transaccion recarga*/
  //     /*id_comercio*/
  //     ["Id comercio", roleInfo?.id_comercio ? roleInfo?.id_comercio : 1],
  //     /*id_dispositivo*/
  //     ["No. terminal", roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 1],
  //     /*ciudad*/
  //     ["Municipio", roleInfo?.ciudad ? roleInfo?.ciudad : "No hay datos"],
  //     /*direccion*/
  //     ["Dirección", roleInfo?.direccion ? roleInfo?.direccion : "No hay datos"],
  //     ["Tipo de operación", "Retiro De Cuentas"],
  //     ["", ""],
  //   ],
  //   commerceName: roleInfo?.["nombre comercio"]
  //     ? roleInfo?.["nombre comercio"]
  //     : "No hay datos",
  //   trxInfo: [],
  //   disclamer: "Línea de atención Bogotá:338 38 38 \nResto del país:01 8000 123 838",
  // });

  const [limitesMontos, setLimitesMontos] = useState({
    max: enumParametrosPowwi.maxRetiroCuentas,
    min: enumParametrosPowwi.minRetiroCuentas,
  });

  const onChangeMoney = useMoney({
    limits: [limitesMontos.min, limitesMontos.max],
    equalError: false,
  });

  const [loadingRetiroCorresponsal, fetchRetiroCorresponsal] =
    useFetch(retiroCorresponsal);
  const [loadingconsultaCosto, fetchconsultaCosto] =
    useFetch(consultaCosto);
  const [, fetchTypes] = useFetch();

  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [datosConsulta, setDatosConsulta] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("01");
  const [isUploading, setIsUploading] = useState(false);
  const [userDoc, setUserDoc] = useState("");
  const [numeroTelefono, setNumeroTelefono] = useState("");
  const [valor, setValor] = useState("");
  const [otp, setOtp] = useState("");
  const [summary, setSummary] = useState([]);
  const [uuid, setUuid] = useState(v4());

  const optionsDocumento = [
    { value: "01", label: "Cédula Ciudadanía" },
    { value: "03", label: "NIT" },
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
    setNumeroTelefono("");
    setOtp("");
    setSummary([]);
    setUuid(v4());
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
            const numeroTelefono = formData.get("numeroTelefono");
            const valorFormat = formData.get("valor");
            const otp = formData.get("OTP");

            const body = {
              comercio: {
                id_comercio: roleInfo?.id_comercio,
                id_usuario: roleInfo?.id_usuario,
                id_terminal: roleInfo?.id_dispositivo,
              },
              address: roleInfo?.direccion,
              dane_code: roleInfo?.codigo_dane,
              city: roleInfo?.ciudad,
              nombre_usuario: roleInfo?.["nombre comercio"],
              nombre_comercio: roleInfo?.["nombre comercio"],
              oficina_propia: roleInfo?.tipo_comercio === "OFICINAS PROPIAS" || roleInfo?.tipo_comercio === "KIOSCO" ? true : false,
              valor_total_trx: valor,
              Datos: {
                numeroProducto: numeroTelefono,
              },
            };
            fetchconsultaCosto(body)
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
                    "Número Powwi": numeroTelefono,
                    "Tipo documento cliente": tipoDocumento,
                    "Número documento": userDoc,
                    "Valor a retirar": valorFormat,
                    "Costo de la transacción": res?.costoTotal,
                    "Valor Total": valorFormat,
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
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
      },
      address: roleInfo?.direccion,
      dane_code: roleInfo?.codigo_dane,
      city: roleInfo?.ciudad,
      nombre_usuario: roleInfo?.["nombre comercio"],
      nombre_comercio: roleInfo?.["nombre comercio"],
      oficina_propia: roleInfo?.tipo_comercio === "OFICINAS PROPIAS" || roleInfo?.tipo_comercio === "KIOSCO" ? true : false,
      valor_total_trx: valor,
      ticket_init: [
        ["Número Powwi", numeroTelefono],
        ["Valor Depósito", formatMoney.format(valor ?? "0")],
        ["Costo transacción",formatMoney.format(datosConsulta?.costoTotal),],
        ["Valor Total",formatMoney.format(valor + datosConsulta?.costoTotal),],
      ].reduce((list, elem, i) => {
        list.push(elem);
        if ((i + 1) % 1 === 0) list.push(["", ""]);
        return list;
      }, []),
      Datos: {
        tipoIdentificacionCliente: tipoDocumento,
        identificacionCliente: userDoc,
        numeroProducto: numeroTelefono,
        otp: encryptPin(otp),
      },
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
        setPaymentStatus(res?.obj?.ticket);
        setPaymentStatus(res?.obj?.ticket);
      })
      .catch((err) => {
        setIsUploading(false);
        console.error(err);
        notifyError("No se ha podido conectar al servidor");
      });
  }, [
    valor,
    userDoc,
    numeroTelefono,
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
        <h1 className='text-3xl mt-6'>Retiro Powwi</h1>
        <Form onSubmit={onSubmitRetiro} grid>
          <Input
            id='numeroTelefono'
            label='Número Powwi'
            type='text'
            name='numeroTelefono'
            minLength='10'
            maxLength='10'
            required
            autoComplete='off'
            value={numeroTelefono}
            onInput={(e) => {
              let valor = e.target.value;
              let num = valor.replace(/[\s\.]/g, "");
              if (!isNaN(num)) {
                if (numeroTelefono.length === 0 && num !== "3") {
                  return notifyError("El número debe comenzar por 3");
                }
                setNumeroTelefono(num);
              }
            }}/>
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
            label='Número Documento Cliente'
            type='text'
            autoComplete='off'
            minLength={"5"}
            maxLength={"15"}
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
            maxLength={"8"}
            min={limitesMontos?.min}
            max={limitesMontos?.max}
            value={makeMoneyFormatter(0).format(valor)}
            onInput={(ev) => setValor(onChangeMoney(ev))}
            required
          />
          <ButtonBar className={"lg:col-span-2"}>
            <Button type={"submit"} disabled={loadingconsultaCosto}>
              Realizar Retiro
            </Button>
            <Button onClick={handleClose}>
              Cancelar
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
              <h1 className='text-2xl font-semibold'>
                ¿Está seguro de realizar el retiro?
              </h1>
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
