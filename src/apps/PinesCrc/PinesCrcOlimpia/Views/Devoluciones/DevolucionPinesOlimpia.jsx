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
import fetchData from "../../../../../utils/fetchData";
import ScreenBlocker from "../../../components/ScreenBlocker";
import TicketOlimpia from "../../components/TicketOlimpia";
import Select from "../../../../../components/Base/Select/Select";
import { usePinesVus } from "../../../../PinesVus/utils/pinesVusHooks" 
import Fieldset from "../../../../../components/Base/Fieldset";
import SimpleLoading from "../../../../../components/Base/SimpleLoading/SimpleLoading";
import { ComponentsModalSummaryTrx } from "../../components/components_devolucion_modal";

const DevolucionPinesOlimpia = () => {
  const navigate = useNavigate();

  const { id_convenio_pin } = useParams();

  const { roleInfo, pdpUser } = useAuth();
  const [numeroPin, setNumeroPin] = useState("");
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
    navigate("/Pines/PinesCrcOlimpia");
  }, [navigate, paymentStatus]);


  const onSubmitConsultPin = (e) => {
    e.preventDefault();
    setIsLoading(true)
    fetchData(
      `${process.env.REACT_APP_URL_PinesVus}/consulta_devolucion_pendiente`,
      "POST",
      {},
      {
        id_comercio: roleInfo?.id_comercio,
        id_terminal: roleInfo?.id_dispositivo,
        id_usuario: roleInfo?.id_usuario,
        nombre_usuario: pdpUser?.uname ?? "",
        pin: numeroPin
    }
    )
      .then((res) => {
        if (!res?.status) {
          setIsLoading(false);
          setEstadoConsulta(false);
          setCodigoDestino("");
          setExiste(false);
          setNumeroIdentificacion("");
          setTipoIdentificacion("");
          setValorPin("");
          setIdTrx("");
          setPin("");
          notifyError(res?.msg);
          setNumeroPin("");
          return;
        }
        else{
          setIsLoading(false);
          setCodigoDestino(res?.obj?.result?.CodigoDestino);
          setExiste(res?.obj?.result?.Existe);
          setNumeroIdentificacion(res?.obj?.result?.NumeroIdentificacion);
          setTipoIdentificacion(res?.obj?.result?.TipoIdentificacion);
          setValorPin(res?.obj?.result?.ValorPin);
          setIdTrx(res?.obj?.result?.id_trx);
          setPin(res?.obj?.result?.pin);
          setEstadoConsulta(true);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        setEstadoConsulta(false);
        setNumeroPin("");
        // console.error(err);
        notifyError("Error consultando pin referenciado Olimpia");
      });
  };

  const onSubmitVentaPin = (e) => {
    e.preventDefault();
    setIsLoadingPago(true)
    fetchData(
      `${process.env.REACT_APP_URL_PinesVus}/confirmar_devolucion`,
      "POST",
      {},
      {
        id_comercio: roleInfo?.id_comercio,
        id_terminal: roleInfo?.id_dispositivo,
        id_usuario: roleInfo?.id_usuario,
        nombre_usuario: pdpUser?.uname ?? "",
        pin: numeroPin,
        tipo_identificacion: tipoIdentificacion,
        numero_identificacion: numeroIdentificacion,
        valor_pin: valorPin,
        codigo_destino: codigoDestino,
        terminal : roleInfo?.id_dispositivo,
        codigo_aprobacion: idTrx,
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
          return;
        }
        else{
          setAuditoria(res?.obj?.result?.Auditoria);
          setIdRespuesta(res?.obj?.result?.IdRespuesta);
          setMensajeRespuesta(res?.obj?.result?.MensajeRespuesta);
          setIdTrx(res?.obj?.result?.id_trx);
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
        // console.error(err);
        notifyError("Error confirmando el recaudo de pin Olimpia");
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

      <h1 className='text-3xl mt-6 mb-10'>Devolución Pines CRC Olimpia</h1>
        <Form onSubmit={onSubmitConsultPin}>
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
          tipoIdentificacion = {tipoIdentificacion}
          numeroIdentificacion ={numeroIdentificacion}
          valorPin = {valorPin}
          >
          </ComponentsModalSummaryTrx>
        )}
      </Modal>
    </Fragment>
  );
};

export default DevolucionPinesOlimpia;
