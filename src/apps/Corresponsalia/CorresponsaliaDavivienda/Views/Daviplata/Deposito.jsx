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
  pagoGiroDaviplata,
  consultaGiroDaviplata,
} from "../../utils/fetchCorresponsaliaDavivienda";
import { notify, notifyError } from "../../../../../utils/notify";
import MoneyInput, {
  formatMoney,
} from "../../../../../components/Base/MoneyInput";
import { useFetch } from "../../../../../hooks/useFetch";
import { useAuth } from "../../../../../hooks/AuthHooks";
import Select from "../../../../../components/Base/Select";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";

const Deposito = () => {
  const navigate = useNavigate();
  // const [{ phone, userDoc, valor, nomDepositante, summary }, setQuery] =
  //   useQuery();
  const [verificacionTel, setVerificacionTel] = useState("");

  const [phone, setPhone] = useState("")
  const [userDoc, setUserDoc] = useState("")
  const [valor, setValor] = useState("")
  const [nomDepositante, setNomDepositante] = useState("")
  const [summary, setSummary] = useState([])
  const { roleInfo, infoTicket } = useAuth();
  const [loadingCashIn, fetchCashIn] = useFetch(pagoGiroDaviplata);
  const [loadingConsultaCashIn, fetchConsultaCashIn] = useFetch(
    consultaGiroDaviplata
  );
  const [, fetchTypes] = useFetch();

  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [datosConsulta, setDatosConsulta] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [limitesMontos, setLimitesMontos] = useState({
    max: 9999999,
    min: 10000,
  });

  const options = [
    { value: "", label: "" },
    { value: "01", label: "Cédula Ciudadanía" },
    { value: "02", label: "Cédula Extranjeria" },
    { value: "04", label: "Tarjeta Identidad" },
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
    setPhone("")
    setVerificacionTel("")
    setNomDepositante("")
    setSummary([])
    setValor("")
    setTipoDocumento("")
    setUserDoc("")
  }, []);

  const onSubmitDeposit = useCallback(
    (e) => {
      e.preventDefault();
      setIsUploading(true);
      const { min, max } = limitesMontos;

      if (valor >= min && valor < max) {
        const formData = new FormData(e.target);
        const phone = formData.get("numCliente");
        const userDoc = formData.get("docCliente");
        const nomDepositante = formData.get("nomDepositante");
        const valorFormat = formData.get("valor");

        if (verificacionTel === phone) {
          const body = {
            idComercio: roleInfo?.id_comercio,
            idUsuario: roleInfo?.id_usuario,
            idDispositivo: roleInfo?.id_dispositivo,
            Tipo: roleInfo?.tipo_comercio,
            numIdentificacionDepositante: userDoc,
            numDaviplata: phone,
            valGiro: valor,
            valTipoIdentificacionDepositante: tipoDocumento, /// Tipo de documento
          };
          fetchConsultaCashIn(body)
            .then((res) => {
              setIsUploading(false);
              if (!res?.status) {
                notifyError(res?.msg);
                return;
              } else {
                setDatosConsulta(res?.obj);
                const total =
                  parseInt(res?.obj?.Data?.valComisionGiroDaviplata) + valor;
                const summary = {
                  "Nombre cliente": res?.obj?.Data?.valNumbreDaviplata,
                  "Numero celular": phone,
                  "C.C. del depositante": userDoc,
                  "Nombre del depositante": nomDepositante,
                  "Valor de deposito": valorFormat,
                  "Valor de comisión": formatMoney.format(
                    res?.obj?.Data?.valComisionGiroDaviplata
                  ),
                  "Valor total": formatMoney.format(total),
                };
                setSummary(summary);
                setShowModal(true);
              }

              //notify("Transaccion satisfactoria");
            })
            .catch((err) => {
              console.error(err);
              notifyError("Error interno en la transaccion");
            });
        } else {
          setIsUploading(false);
          notifyError("Verifique que el celular del cliente es correcto");
        }
      } else {
        setIsUploading(false);
        notifyError(
          `El valor del deposito debe estar entre ${formatMoney.format(
            min
          )} y ${formatMoney.format(max)}`
        );
      }
    },
    [valor, limitesMontos, verificacionTel]
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
      Tipo: roleInfo?.tipo_comercio,
      numIdentificacionDepositante: userDoc,
      nomDepositante: nomDepositante,
      numDaviplata: phone,
      valGiro: valor,
      valCodigoConvenioDaviplata:
        datosConsulta?.Data?.valCodigoConvenioDaviplata,
      valTipoIdentificacionDepositante: tipoDocumento, /// Tipo de documento
      valComisionGiroDaviplata: datosConsulta?.Data?.valComisionGiroDaviplata,
      id_transaccion: datosConsulta?.DataHeader?.idTransaccion,
      direccion: roleInfo?.direccion,
      cod_dane: roleInfo?.codigo_dane,
    };

    fetchCashIn(body)
      .then((res) => {
        setIsUploading(false);
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }else{
        notify("Transaccion satisfactoria");
        const trx_id = res?.obj?.Data?.valTalon ?? 0;
        const comision = res?.obj?.Data?.valComisionGiroDaviplata ?? 0;
        const total = parseInt(comision) + valor;
        const ter = res?.obj?.DataHeader?.total ?? res?.obj?.Data?.total;

        const tempTicket = {
          title: "Recibo de Depósito a Daviplata",
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
            ["Tipo de operación", "Depósito a DaviPlata"],
            ["", ""],
            ["No. de aprobación", trx_id],
            ["", ""],
          ],
          commerceName: roleInfo?.["nombre comercio"]
          ? roleInfo?.["nombre comercio"]
          : "No hay datos",
          trxInfo: [          
            ["Número de telefono", "****" + phone.slice(-4)],
            ["",""],
            ["Valor", formatMoney.format(valor)],
            ["",""],
            ["Costo transacción", formatMoney.format(comision)],
            ["",""],
            ["Total", formatMoney.format(total)],
            ["",""],
          ],
          disclamer: "Línea de atención personalizada: #688\nMensaje de texto: 85888",
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
        }
      })
      .catch((err) => {
        console.error(err);
        notifyError("Error interno en la transaccion");
      });
  }, [
    phone,
    valor,
    userDoc,
    fetchCashIn,
    roleInfo,
    infoTicket,
    ,
    datosConsulta,
  ]);

  return (
    <>
      <SimpleLoading show={isUploading} />
      <Fragment>
        <h1 className='text-3xl mt-6'>Depositos Daviplata</h1>
        <Form onSubmit={onSubmitDeposit} grid>
          <Input
            id='numCliente'
            name='numCliente'
            label='Numero Daviplata'
            type='text'
            autoComplete='off'
            minLength={"10"}
            maxLength={"10"}
            value={phone}
            onInput={(e) => {
              if (!isNaN(e.target.value)) {
                const num = e.target.value;
                setPhone(num);
              }
            }}
            required
          />
          <Input
            id='numCliente'
            name='numCliente'
            label='Verificación'
            type='text'
            autoComplete='off'
            minLength={"10"}
            maxLength={"10"}
            value={verificacionTel}
            onInput={(e) => {
              if (!isNaN(e.target.value)) {
                const num = e.target.value;
                setVerificacionTel(num);
              }
            }}
            required
          />
          <Select
            id='tipoCuenta'
            label='Tipo de documento'
            options={options}
            value={tipoDocumento}
            onChange={(e) => {
              setTipoDocumento(e.target.value);
            }}
          />
          <Input
            id='docCliente'
            name='docCliente'
            label='CC de quien deposita'
            type='text'
            autoComplete='off'
            minLength={"5"}
            maxLength={"16"}
            value={userDoc}
            onInput={(e) => {
              setUserDoc(e.target.value);
            }}
            required
          />
          <Input
            id='nomDepositante'
            name='nomDepositante'
            label='Nombre Depositante'
            type='text'
            autoComplete='off'
            value={nomDepositante}
            onInput={(e) => {
              setNomDepositante(e.target.value);
            }}
            required
          />
          <MoneyInput
            id='valor'
            name='valor'
            label='Valor a depositar'
            autoComplete='off'
            min={limitesMontos?.min}
            max={limitesMontos?.max}
            onInput={onMoneyChange}
            required
          />
          <ButtonBar className={"lg:col-span-2"}>
            <Button type={"submit"} disabled={loadingConsultaCashIn}>
              Realizar deposito
            </Button>
          </ButtonBar>
        </Form>
        <Modal
          show={showModal}
          handleClose={
            paymentStatus ? () => {} : loadingCashIn ? () => {} : handleClose
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
                  disabled={loadingCashIn}>
                  Aceptar
                </Button>
                <Button onClick={handleClose} disabled={loadingCashIn}>
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
