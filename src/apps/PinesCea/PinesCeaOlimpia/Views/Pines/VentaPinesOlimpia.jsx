import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, Navigate, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import Modal from "../../../../../components/Base/Modal";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";
import { useAuth } from "../../../../../hooks/AuthHooks";
import useMoney from "../../../../../hooks/useMoney";

import { notifyError, notifyPending } from "../../../../../utils/notify";
import fetchDataPinesCea from "../../utils/fetchDataPinesCea";
import ScreenBlocker from "../../../components/ScreenBlocker";
import TicketOlimpia from "../../components/TicketOlimpia";
import Select from "../../../../../components/Base/Select/Select";
import { usePinesVus } from "../../../../PinesVus/utils/pinesVusHooks" 
import Fieldset from "../../../../../components/Base/Fieldset";
import SimpleLoading from "../../../../../components/Base/SimpleLoading/SimpleLoading";
import { ComponentsModalSummaryTrx } from "../../components/components_modal";

const VentaPinesOlimpia = () => {
  const navigate = useNavigate();

  const { id_convenio_pin } = useParams();

  const { roleInfo, pdpUser } = useAuth();
  const [numeroPin, setNumeroPin] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [valorTansaccion, setValorTansaccion] = useState("");
  const [estado, setEstado] = useState("");
  const [codigoDestino, setCodigoDestino] = useState("");
  const [existe, setExiste] = useState(false);
  const [numeroIdentificacion, setNumeroIdentificacion] = useState("");
  const [tipoIdentificacion, setTipoIdentificacion] = useState("");
  const [valorPin, setValorPin] = useState("");
  const [idTrx, setIdTrx] = useState("");
  const [pin, setPin] = useState("");
  const [auditoria, setAuditoria] = useState("");
  const [idRespuesta, setIdRespuesta] = useState("");
  const [mensajeRespuesta, setMensajeRespuesta] = useState("");
  const [estadoConsulta, setEstadoConsulta] = useState(false);
  const [estadoPago, setEstadoPago] = useState(false);
  const [isLoadingPago, setIsLoadingPago] = useState(false);

  const [searchingConvData, setSearchingConvData] = useState(false);
  const [datosConvenio, setDatosConvenio] = useState("");
  const [canal, setCanal ] = useState("1");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [documento, setDocumento] = useState("");
  const [celular, setCelular] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState(1);
  const [isLoading, setIsLoading] = useState(false)
  const [showFormulario, setShowFormulario] = useState(false)
  const [showFormulario2, setShowFormulario2] = useState(false)

  const [userReferences, setUserReferences] = useState({});
  const [userAddress /* , setUserAddress */] = useState(
    roleInfo?.direccion ?? ""
  );
  const [valVentaPines, setValVentaPines] = useState(0);

  const [limitesMontos, setLimitesMontos] = useState({
    max: 9999999,
    min: 5000,
  });

  const [paymentStatus, setPaymentStatus] = useState(null);
  const [inquiryStatus, setInquiryStatus] = useState(null);

  const onChangeMoney = useMoney({
    limits: [limitesMontos.min, limitesMontos.max],
  });

  const [loadingSell, setLoadingSell] = useState(false);
  const [loadingInquiry, setLoadingInquiry] = useState(false);

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const { crearPinVus, con_estado_tipoPin, consultaTramite, consultaClientes, consultaEpsArl, consultaCierreManual} = usePinesVus();

  const optionsDocumento = [
    { value: "", label: "" },
    { value: 1, label: "Cédula de ciudadanía" },
    { value: 2, label: "Cédula de extranjería" },
    { value: 3, label: "Tarjeta de identidad" },
    { value: 4, label: "NIT" },
    { value: 5, label: "Pasaporte" }
  ];
  const [tipoDocumentoInput, setTipoDocumentoInput] = useState(1)

  const homeLocation = {
    municipio: useState(""),
    departamento: useState(""),
    localidad: useState(""),
    barrio: useState(""),
    direccion: useState(""),
    foundMunicipios: useState([]),
  };


  const infoCliente = useMemo(() => {
    homeLocation["direccion"][0] = direccion
    return {infoCliente:{
      pk_documento_cliente : documento,
      tipo_documento : tipoDocumento,
      nombre : nombre,
      apellidos : apellidos,
      celular : celular,
      email : email,
      direccion : direccion,
      home_location : homeLocation
  }};
  }, [
    setTipoDocumento,
    setDocumento,
    setNombre,
    setApellidos,
    setCelular,
    setEmail,
    homeLocation,
    setDireccion
  ]);  

  const handleClose = useCallback(() => {
    if (!paymentStatus) {
      notifyError("Transacción cancelada por el usuario");
    }
    navigate("/Pines/PinesCeaOlimpia");
  }, [navigate, paymentStatus]);


  const onSubmitConsultPin = (e) => {
    e.preventDefault();
    setIsLoading(true)
    fetchDataPinesCea(
      `${process.env.REACT_APP_URL_PinesVus}/consulta_pin_cea`,
      "POST",
      {},
      {
        id_comercio: roleInfo?.id_comercio,
        id_terminal: roleInfo?.id_dispositivo,
        id_usuario: roleInfo?.id_usuario,
        nombre_usuario: pdpUser?.uname ?? "",
        Pin: numeroPin,
        TipoIdentificacion: tipoDocumentoInput,
        NumeroIdentificacion: numeroDocumento
    }
    )
      .then((res) => {
        if (!res?.status || (res?.obj?.result?.Estado != 'Referenciado')) {
          if (res?.obj?.result?.Estado == undefined){
            setIsLoading(false);
            setEstadoConsulta(false);
            setEstado("");
            setNumeroIdentificacion("");
            setTipoIdentificacion("");
            setValorTansaccion("");
            setIdTrx("");
            setPin("");
            notifyError(res?.msg);
            setNumeroPin("");
            setNumeroDocumento("");
            setTipoDocumentoInput(1);
            return;
          }
          else{
            setIsLoading(false);
            setEstadoConsulta(false);
            setEstado("");
            setNumeroIdentificacion("");
            setTipoIdentificacion("");
            setValorTansaccion("");
            setIdTrx("");
            setPin("");
            notifyError("Estado de pin no permitido para para recaudo");
            setNumeroPin("");
            setNumeroDocumento("");
            setTipoDocumentoInput(1);
            return;
          }

        }
        else{
          setIsLoading(false);
          setEstado(res?.obj?.result?.Estado);
          setNumeroIdentificacion(res?.obj?.result?.NumeroIdentificacion);
          setTipoIdentificacion(res?.obj?.result?.TipoIdentificacion);
          setValorTansaccion(res?.obj?.result?.ValorTansaccion);
          setIdTrx(res?.obj?.id_trx);
          setPin(res?.obj?.result?.Pin);
          setEstadoConsulta(true);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        setEstadoConsulta(false);
        setNumeroPin("");
        setNumeroDocumento("");
        setTipoDocumentoInput(1);
        // console.error(err);
        notifyError("Error consultando pin cea Olimpia");
      });
  };

  const onSubmitVentaPin = (e) => {
    e.preventDefault();
    setIsLoadingPago(true)
    fetchDataPinesCea(
      `${process.env.REACT_APP_URL_PinesVus}/recaudar_pin`,
      "POST",
      {},
      {
        id_comercio: roleInfo?.id_comercio,
        id_terminal: roleInfo?.id_dispositivo,
        id_usuario: roleInfo?.id_usuario,
        Pin: numeroPin,
        TipoIdentificacion: tipoIdentificacion,
        NumeroIdentificacion: numeroIdentificacion,
        ValorTansaccion: valorTansaccion,
        id_trx: idTrx,
        direccion: roleInfo?.direccion ?? "",
        nombre_comercio: roleInfo?.["nombre comercio"] ?? "",
        comercio_propio: roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
        roleInfo?.tipo_comercio === "KIOSCO"
    }
    )
      .then((res) => {
        if (!res?.status) {
          setEstadoPago(false);
          setAuditoria("");
          setIdRespuesta("");
          setMensajeRespuesta("");
          setIdTrx("");
          setPin("");
          notifyError(res?.msg);
          setEstadoConsulta(false);
          setIsLoadingPago(false);
          setNumeroPin("");
          setNumeroDocumento("");
          setTipoDocumentoInput(1);
          return;
        }
        else{
          const fecha = Intl.DateTimeFormat("es-CO", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date());
          const partesFecha = fecha.split("/");
          const fechaFormateada = `${partesFecha[0]}-${partesFecha[1]}-${partesFecha[2]}`;
          fetchDataPinesCea(
            `${process.env.REACT_APP_URL_PinesVus}/ConfirmarRecaudo`,
            "POST",
            {},
            {
              IdCliente: process.env.REACT_APP_ID_CLIENTE_OLIMPIA,
              Pin: numeroPin,
              TipoIdentificacion: tipoIdentificacion,
              NumeroIdentificacion: numeroIdentificacion,
              ValorTansaccion: valorTansaccion,
              CodigoAprobacion: idTrx,
              FechaTransaccion: fechaFormateada
          }
          )
            .then((res2) => {
              if (res2?.IdRespuesta!=0) {
                setEstadoPago(false);
                setAuditoria("");
                setIdRespuesta("");
                setMensajeRespuesta("");
                setIdTrx("");
                setPin("");
                notifyError(res2?.msg);
                setEstadoConsulta(false);
                setIsLoadingPago(false);
                setNumeroPin("");
                setNumeroDocumento("");
                setTipoDocumentoInput(1);
                return;
              }
              else{
                setAuditoria(res?.obj?.result?.Auditoria);
                setIdRespuesta(res?.obj?.result?.IdRespuesta);
                setMensajeRespuesta(res?.obj?.result?.MensajeRespuesta);
                // setIdTrx(res?.obj?.result?.id_trx);
                setPin(res?.obj?.result?.pin);
                setEstadoPago(true);
                setPaymentStatus(res?.obj?.ticket ?? {});
                setIsLoadingPago(false);
              }
            })
            .catch((err) => {
              setEstadoPago(false);
              setEstadoConsulta(false);
              setIsLoadingPago(false);
              setNumeroPin("");
              setNumeroDocumento("");
              setTipoDocumentoInput(1);
              // console.error(err);
              notifyError("Error confirmando recaudo del pin cea Olimpia");
            });
        }
      })
      .catch((err) => {
        setEstadoPago(false);
        setEstadoConsulta(false);
        setIsLoadingPago(false);
        setNumeroPin("");
        setNumeroDocumento("");
        setTipoDocumentoInput(1);
        // console.error(err);
        notifyError("Error recaudando el pin cea Olimpia");
      });
  };

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
       
      <SimpleLoading show={isLoading}></SimpleLoading>

      <h1 className='text-3xl mt-6 mb-10'>Pines CEA Olimpia</h1>
        <Form onSubmit={onSubmitConsultPin} grid>
      <Input
        id="numeroPin"
        label="Número de PIN"
        type="text"
        required
        minLength="5"
        maxLength="16"
        autoComplete="off"
        value={numeroPin}
        onInput={(e) => {
          const num = (parseInt(e.target.value) || "").toString().replace("-","");
          setNumeroPin(num);
        }}
        readOnly={inquiryStatus}
      />
      <Select
        id="tipoDocumentoInput"
        label="Tipo de documento"
        options={optionsDocumento}
        value={tipoDocumentoInput}
        onChange={(e) => {
          setTipoDocumentoInput(e.target.value);
          // setDescripcionTipDoc(optionsDocumento.filter(tip => tip.value === e.target.value)[0]['label'])
        }}
        required
      /> 
      <Input
        id="numeroDocumento"
        label="Número de documento"
        type="text"
        required
        minLength="5"
        maxLength="12"
        autoComplete="off"
        value={numeroDocumento}
        onInput={(e) => {
          const num = (parseInt(e.target.value) || "").toString().replace("-","");
          setNumeroDocumento(num);
        }}
        readOnly={inquiryStatus}
      />
            <ButtonBar className="lg:col-span-2">
      <Button 
      type="submit"
      disabled={isLoading}
       >
        Realizar Consulta
      </Button>
              <Button onClick={handleClose}>Cancelar</Button>
      </ButtonBar>
      </Form>


      {/* <ScreenBlocker show={!estadoPago} /> */}
      <Modal
        show={estadoConsulta}
        handleClose={loadingSell ? () => {} : handleClose}>
        {paymentStatus ? (
          <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center'>
            <TicketOlimpia refPrint={printDiv} ticket={paymentStatus} />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={handleClose}>Cerrar</Button>
            </ButtonBar>
          </div>
        ) : (
          <ComponentsModalSummaryTrx
          loadingPeticion = {isLoadingPago}
          peticion={onSubmitVentaPin}
          handleClose = {handleClose}
          numeroPin = {numeroPin}
          tipoIdentificacion = {tipoIdentificacion}
          numeroIdentificacion ={numeroIdentificacion}
          valorTansaccion = {valorTansaccion}
          >
          </ComponentsModalSummaryTrx>
        )}
      </Modal>
    </Fragment>
  );
};

export default VentaPinesOlimpia;
