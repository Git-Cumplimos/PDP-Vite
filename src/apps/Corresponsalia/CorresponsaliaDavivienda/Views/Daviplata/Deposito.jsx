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
import { enumParametrosDavivienda } from "../../utils/enumParametrosDavivienda";
import { decryptAES } from "../../../../../utils/cryptoUtils";

const Deposito = () => {
  const navigate = useNavigate();
  const [verificacionTel, setVerificacionTel] = useState("");

  const [phone, setPhone] = useState("");
  const [userDoc, setUserDoc] = useState("");
  const [valor, setValor] = useState("");
  const [nomDepositante, setNomDepositante] = useState("");
  const [summary, setSummary] = useState([]);
  const { roleInfo, pdpUser } = useAuth();
  const [loadingCashIn, fetchCashIn] = useFetch(pagoGiroDaviplata);
  const [loadingConsultaCashIn, fetchConsultaCashIn] = useFetch(
    consultaGiroDaviplata
  );
  const [, fetchTypes] = useFetch();
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [datosConsulta, setDatosConsulta] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("01");
  const [isUploading, setIsUploading] = useState(false);

  const [limitesMontos, setLimitesMontos] = useState({
    max: enumParametrosDavivienda.maxCashInDaviplata,
    min: enumParametrosDavivienda.minCashInDaviplata,
  });

  const options = [
    { value: "01", label: "Cédula Ciudadanía" },
    { value: "02", label: "Cédula Extranjería" },
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
    setPhone("");
    setVerificacionTel("");
    setNomDepositante("");
    setSummary([]);
    setValor("");
    setTipoDocumento("01");
    setUserDoc("");
  }, []);

  const onSubmitDeposit = useCallback(
    (e) => {
      e.preventDefault();
      setIsUploading(true);
      const { min, max } = limitesMontos;

      if (valor >= min && valor <= max) {
        // const formData = new FormData(e.target);
        // const phone = formData.get("numCliente");
        // const userDoc = formData.get("docCliente");
        // const nomDepositante = formData.get("nomDepositante");
        // const valorFormat = formData.get("valor");

        if (verificacionTel === phone) {
          const body = {
            idComercio: roleInfo?.id_comercio,
            idUsuario: roleInfo?.id_usuario,
            idDispositivo: roleInfo?.id_dispositivo,
            nombre_usuario: pdpUser?.uname ?? "",
            // Tipo: roleInfo?.tipo_comercio,
            numIdentificacionDepositante: userDoc,
            numDaviplata: phone,
            valGiro: valor,
            valTipoIdentificacionDepositante: tipoDocumento, /// Tipo de documento
          };
          fetchConsultaCashIn(body)
            .then((res) => {
              setIsUploading(false);
              if (!res?.status) {
                setIsUploading(false);
                setPhone("");
                setVerificacionTel("");
                setNomDepositante("");
                setSummary([]);
                setValor("");
                setTipoDocumento("01");
                setUserDoc("");
                notifyError(res?.msg);
                handleClose();
                return;
              } else {
                setIsUploading(false);
                setDatosConsulta(res?.obj);
                const total =
                  parseInt(res?.obj?.Data?.valComisionGiroDaviplata) + valor;
                const summary = {
                  "Nombre cliente": res?.obj?.Data?.valNumbreDaviplata,
                  "Número celular": phone,
                  "Documento depositante": userDoc,
                  // "Nombre depositante": nomDepositante,
                  "Valor depósito": formatMoney.format(valor),
                  "Valor comisión": formatMoney.format(
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
              setIsUploading(false);
              console.error(err);
              notifyError("No se ha podido conectar al servidor");
              handleClose();
            });
        } else {
          setIsUploading(false);
          notifyError("Verifique que el celular del cliente es correcto");
        }
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
    [
      phone,
      verificacionTel,
      tipoDocumento,
      userDoc,
      nomDepositante,
      valor,
      limitesMontos,
      pdpUser,
    ]
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
      nombre_usuario: pdpUser?.uname ?? "",
      oficinaPropia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
        roleInfo?.tipo_comercio === "KIOSCO"
          ? true
          : false,
      numIdentificacionDepositante: userDoc,
      nomDepositante: summary["Nombre cliente"],
      numDaviplata: phone,
      valGiro: valor,
      nomComercio: roleInfo?.["nombre comercio"] ? roleInfo?.["nombre comercio"]: "No hay datos",
      nomMunicipio: roleInfo?.ciudad ? roleInfo?.ciudad : "No hay datos",
      valCodigoConvenioDaviplata: datosConsulta?.Data?.valCodigoConvenioDaviplata,
      valTipoIdentificacionDepositante: tipoDocumento,
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
          setIsUploading(false);
          handleClose();
        } else {
          notify("Transaccion satisfactoria");
          setPaymentStatus(res?.obj?.ticket);
        }
      })
      .catch((err) => {
        setIsUploading(false);
        console.error(err);
        notifyError("No se ha podido conectar al servidor");
      });
  }, [
    phone,
    valor,
    userDoc,
    fetchCashIn,
    roleInfo,
    summary,
    datosConsulta,
    pdpUser,
  ]);

  return (
    <>
      <SimpleLoading show={isUploading} />
      <Fragment>
        <h1 className='text-3xl mt-6'>Depósito DaviPlata</h1>
        <br></br>
        <Form onSubmit={onSubmitDeposit} grid>
          <Input
            id='numCliente'
            name='numCliente'
            label='Número DaviPlata'
            type='text'
            autoComplete='off'
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
                const num = e.target.value.replace(/[\s\.\-+eE]/g, "");
                if (!isNaN(num)) {
                  setPhone(num);
                }
              }
            }}
            required
          />
          <Input
            id='numCliente'
            name='numCliente'
            label='Verificación No. DaviPlata'
            type='text'
            autoComplete='off'
            minLength={"10"}
            maxLength={"10"}
            value={verificacionTel}
            onInput={(e) => {
              if (
                (String(e.target.value).length > 2) &
                (String(verificacionTel).length < 1)
              ) {
                notifyError("Debe digitar el número celular y no pegarlo");
              } else {
                if (
                  (String(e.target.value).length > 0) &
                  (String(e.target.value).slice(0, 1) !== "3")
                ) {
                  notifyError("El número de celular debe iniciar por 3");
                  setVerificacionTel("");
                } else {
                  const num = e.target.value.replace(/[\s\.\-+eE]/g, "");
                  if (!isNaN(num)) {
                    setVerificacionTel(num);
                  }
                }
              }
            }}
            required
          />
          <Select
            className='place-self-stretch'
            id='tipoDocumento'
            label='Tipo de documento'
            options={options}
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
            <Button type={"submit"} disabled={loadingConsultaCashIn}>
              Realizar depósito
            </Button>
          </ButtonBar>
        </Form>
        <Modal
          show={showModal}
          handleClose={
            paymentStatus ? goToRecaudo : loadingCashIn ? () => {} : handleClose
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
