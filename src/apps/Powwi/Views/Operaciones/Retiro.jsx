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
  notify,
  notifyError,
  notifyPending,
} from "../../../../utils/notify";
import Tickets from "../../components/TicketsPowwi";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import MoneyInput, {
  formatMoney,
} from "../../../../components/Base/MoneyInput";
import { useFetch } from "../../../../hooks/useFetch";
import { useAuth } from "../../../../hooks/AuthHooks";
import Select from "../../../../components/Base/Select";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import HideInput from "../../../../components/Base/HideInput";
import useMoney from "../../../../hooks/useMoney";
import { enumParametrosPowwi } from "../../utils/enumParametrosPowwi";
import { cifrarAES } from "../../../../utils/cryptoUtils"
import { v4 } from "uuid";
import { fetchCustom } from "../../utils/fetchCorresponsaliaPowwi";

const URL_CONSULTAR_COSTO = `${process.env.REACT_APP_URL_CORRESPONSALIA_POWWI}/corresponsal_powwi/consultaRetiroPowwi`;
const URL_RETIRO = `${process.env.REACT_APP_URL_CORRESPONSALIA_POWWI}/corresponsal_powwi/retiroCorresponsalPowwi`;

const Retiro = () => {
  const navigate = useNavigate();
  const { roleInfo, infoTicket } = useAuth();
  const [limitesMontos, setLimitesMontos] = useState({
    max: enumParametrosPowwi.maxRetiroCuentas,
    min: enumParametrosPowwi.minRetiroCuentas,
  });
  const onChangeMoney = useMoney({
    limits: [limitesMontos.min, limitesMontos.max],
    equalError: false,
  });
  const [, fetchTypes] = useFetch();
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [datosConsulta, setDatosConsulta] = useState("");
  const [datosTrx, setDatosTrx] = useState({
    tipoDocumento: "1",
    userDoc: "",
    numeroTelefono: "",
    otp: ""
  });
  const [isUploading, setIsUploading] = useState(false);
  const [valor, setValor] = useState("");
  const [summary, setSummary] = useState([]);
  const [uuid, setUuid] = useState(v4());
  const optionsDocumento = [
    { value: "1", label: "Cédula de ciudadanía" },
    { value: "3", label: "NIT" },
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
    setDatosTrx({
      tipoDocumento: "1",
      userDoc: "",
      numeroTelefono: "",
      otp: "",
    });
    setValor("");
    setSummary([]);
    setUuid(v4());
  }, []);

  const [loadingPeticionConsultaCosto, peticionConsultaCosto] = useFetch(
    fetchCustom(URL_CONSULTAR_COSTO, "POST", "Consultar costo")
  );
  const [loadingPeticionRetiro, peticionRetiro] = useFetch(
    fetchCustom(URL_RETIRO, "POST", "Retiro")
  );

  const onSubmitRetiro = useCallback(
    (e) => {
      e.preventDefault();
      setIsUploading(true);
      if (datosTrx.otp.length < 6) {
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
            const data = {
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
                numeroProducto: "(+57)"+numeroTelefono,
              },
            };
            notifyPending(
              peticionConsultaCosto({}, data),
              {
                render: () => {
                  setIsUploading(true);
                  return "Procesando consulta";
                },
              },
              {
                render: ({data: res }) =>{
                  setIsUploading(false);
                  setDatosConsulta(res?.obj);
                  const summary = {
                    "Número Powwi": numeroTelefono,
                    "Tipo documento cliente": datosTrx.tipoDocumento === "1" ? "Cédula de ciudadanía" : "NIT",
                    "Número documento cliente": userDoc,
                    "Valor a retirar": valorFormat,
                    "Costo de la transacción": formatMoney.format(res?.obj?.costoTotal),
                    "Valor Total": valorFormat,
                  };
                  setSummary(summary);
                  setShowModal(true);
                  return "Consulta satisfactoria";
                },
              },
              {
                render: ( { data: error}) => {
                  setIsUploading(false);
                  navigate("/corresponsaliaPowwi/Retiro");
                  setDatosTrx({
                    tipoDocumento: "1",
                    userDoc: "",
                    numeroTelefono: "",
                    otp: "",
                  });
                  setValor("");
                  return error?.message ?? "Consulta fallida";
                },
              }
            );
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
    [valor, limitesMontos, datosTrx.otp]
  );

  const goToRecaudo = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  
  const onMakePayment = useCallback(() => {
    setIsUploading(true);
    const data = {
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
      id_trx: datosConsulta?.id_trx,
      id_uuid_trx: uuid,
      ticket_init: [
        ["Número Powwi", datosTrx.numeroTelefono],
        ["Valor Retiro", formatMoney.format(valor ?? "0")],
        ["Costo transacción",formatMoney.format(datosConsulta?.costoTotal),],
        ["Valor Total",formatMoney.format(valor + datosConsulta?.costoTotal),],
      ].reduce((list, elem, i) => {
        list.push(elem);
        if ((i + 1) % 1 === 0) list.push(["", ""]);
        return list;
      }, []),
      Datos: {
        tipoIdentificacionCliente: datosTrx.tipoDocumento,
        identificacionCliente: datosTrx.userDoc,
        numeroProducto: "(+57)"+datosTrx.numeroTelefono,
        otp: cifrarAES(
          `${process.env.REACT_APP_LLAVE_AES_ENCRYPT_DAV}`,
          `${process.env.REACT_APP_IV_AES_ENCRYPT_DAV}`,
          datosTrx.otp
        ),
      },
    };
    notifyPending(
      peticionRetiro({}, data),
      {
        render: () => {
          return "Procesando transacción";
        },
      },
      {
        render: ({ data: res }) => {
          setIsUploading(false);
          setPaymentStatus(res?.obj?.ticket ?? {});
          return "Transaccion satisfactoria";
        },
      },
      {
        render({ data: err }) {
          setIsUploading(false);
          navigate("/corresponsaliaPowwi");
          if (err?.cause === "custom") {
            return <p style={{ whiteSpace: "pre-wrap" }}>{err?.message}</p>;
          }
          console.error(err?.message);
          return err?.message ?? "Consulta fallida";
        },
      }
    );
  }, [
    valor,
    datosTrx.userDoc,
    datosTrx.numeroTelefono,
    peticionRetiro,
    roleInfo,
    infoTicket,
    datosConsulta,
    datosTrx.tipoDocumento,
    datosTrx.otp,
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
            value={datosTrx.numeroTelefono}
            onInput={(e) => {
              let valor = e.target.value;
              let num = valor.replace(/[\s\.]/g, "");
              if (!isNaN(num)) {
                if (datosTrx.numeroTelefono.length === 0 && num !== "3") {
                  return notifyError("El número debe comenzar por 3");
                }
                setDatosTrx(prevState => ({
                  ...prevState,
                  numeroTelefono: num
                }));
              }
            }}/>
          <Select
            id='tipoDocumento'
            label='Tipo Documento Cliente'
            options={optionsDocumento}
            value={datosTrx.tipoDocumento}
            onChange={(e) => {
              setDatosTrx(prevState => ({
                ...prevState,
                tipoDocumento: e.target.value
              }));
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
            value={datosTrx.userDoc}
            onInput={(e) => {
              const num = e.target.value.replace(/[\s\.]/g, "");
              if (!isNaN(num)) {
                setDatosTrx(prevState => ({
                  ...prevState,
                  userDoc: num
                }));
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
            value={datosTrx.otp}
            onInput={(e, valor) => {
              let num = valor.replace(/[\s\.]/g, "");
              if (!isNaN(valor)) {
                setDatosTrx(prevState => ({
                  ...prevState,
                  otp: num
                }));
              }
            }}></HideInput>
          <MoneyInput
            id='valor'
            name='valor'
            label='Valor a retirar'
            autoComplete='off'
            type='text'
            minLength={"1"}
            maxLength={"11"}
            min={limitesMontos?.min}
            max={limitesMontos?.max}
            value={valor}
            onInput={(ev) => setValor(onChangeMoney(ev))}
            required
          />
          <ButtonBar className={"lg:col-span-2"}>
            <Button type={"submit"} disabled={loadingPeticionConsultaCosto}>
              Realizar consulta
            </Button>
            <Button  
              onClick={() => 
                {
                  goToRecaudo();
                  notifyError("Transacción cancelada por el usuario");
                }}
            >
              Cancelar
            </Button>
          </ButtonBar>
        </Form>
        <Modal
          show={showModal}
          handleClose={paymentStatus || loadingPeticionRetiro ? () => {} : handleClose}>
          {paymentStatus ? (
            <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center'>
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button onClick={goToRecaudo}>Cerrar</Button>
              </ButtonBar>
              <Tickets refPrint={printDiv} ticket={paymentStatus} />
            </div>
          ) : (
            <PaymentSummary summaryTrx={summary} title='Respuesta de consulta Powwi' subtitle = "Resumen de la transacción">
              <ButtonBar>
                <Button
                  type='submit'
                  onClick={onMakePayment}
                  disabled={loadingPeticionRetiro}>
                  Aceptar
                </Button>
                <Button
                  onClick={() => 
                    {
                      handleClose();
                      notifyError("Transacción cancelada por el usuario");
                    }}
                  disabled={loadingPeticionRetiro}>
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
