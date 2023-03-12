import { useCallback, useState, useMemo, useEffect, useRef } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import { usePinesVus } from "../utils/pinesVusHooks";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/AuthHooks";
import { notifyError } from "../../../utils/notify";
import TicketsPines from "../components/TicketsPines/TicketsPines"
import Tickets from "../../../components/Base/Tickets"
import { useReactToPrint } from "react-to-print";
import Select from "../../../components/Base/Select";
import { useNavigate } from "react-router-dom";
import Fieldset from "../../../components/Base/Fieldset";
import LocationFormPinVus from "../components/LocationForm/LocationFormPinesVus"
import { enumParametrosPines } from "../utils/enumParametrosPines";
import InputSuggestions from "../../../components/Base/InputSuggestions";
import FirmaTratamientoDatos from "../components/FirmaTratamientoDatos/FirmaTratamientoDatos";
import TextArea from "../../../components/Base/TextArea";

const dateFormatter = Intl.DateTimeFormat("az", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const CrearPin = () => {
  const navigate = useNavigate();

  const printDiv = useRef();
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    // pageStyle: "@page {size: 80mm 160mm; margin: 0; padding: 0;}",
  });

  const { crearPinVus, con_estado_tipoPin, consultaTramite, consultaClientes, consultaEpsArl, consultaCierreManual} = usePinesVus();
  const { infoTicket } = useAuth();

  const { roleInfo } = useAuth();
  const [showFormulario, setShowFormulario] = useState(false)
  const [documento, setDocumento] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showModalFirma, setShowModalFirma] = useState(false);
  const [disabledBtns, setDisabledBtns] = useState(false);
  const [disabledBtnsContinuar, setDisabledBtnsContinuar] = useState(false);
  const [showTramiteAdicional, setShowTramiteAdicional] = useState(false);
  const [showPinLicencia, setShowPinLicencia,] = useState(false);
  const [txtButtonTramiteAdicional, settxtButtonTramiteAdicional] = useState("+ Agregar Segundo Trámite");
  const [respPin, setRespPin] = useState("");
  const [optionsTipoPines, setOptionsTipoPines] = useState([]);
  const [tipoPin, setTipoPin] = useState("");
  const [optionsTramites, setOptionsTramites] = useState([]);
  const [optionsTramites2, setOptionsTramites2] = useState([]);
  const [tramite, setTramite] = useState("")
  const [tramite2, setTramite2] = useState("")

  const [nombre, setNombre] = useState("")
  const [apellidos, setApellidos] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [celular, setCelular] = useState("")
  const [email, setEmail] = useState("")
  const [eps, setEps] = useState("")
  const [arl, setArl] = useState("")
  const [idPin, setIdPin] = useState("")
  const [firma, setFirma] = useState("")
  const [pedirFirma, setPedirFirma] = useState(true)
  const [descripcionTipDoc, setDescripcionTipDoc] = useState("")

  const [olimpia, setOlimpia] = useState("")

  const [motivoCompra, setMotivoCompra] = useState("")

  const homeLocation = {
    municipio: useState(""),
    departamento: useState(""),
    localidad: useState(""),
    barrio: useState(""),
    direccion: useState(""),
    foundMunicipios: useState([]),
  };

  const optionsDocumento = [
    { value: "", label: "" },
    { value: "1", label: "Cédula Ciudadanía" },
    { value: "2", label: "Cédula Extranjería" },
    { value: "3", label: "Tarjeta Identidad" },
    { value: "4", label: "NIT" },
    { value: "5", label: "Pasaporte" },
  ];
  const [tipoDocumento, setTipoDocumento] = useState("")

  const optionsGenero = [
    { value: "", label: "" },
    { value: "F", label: "Femenino" },
    { value: "M", label: "Masculino" },
    { value: "O", label: "Otro" }, 
  ];
  const [genero, setGenero] = useState("")


  const optionsVehiculo = [
    { value: "", label: "" },
    { value: "Carro", label: "Carro" },
    { value: "Moto", label: "Moto" },
  ];
  const [tiene_vehiculo, setTiene_vehiculo] = useState("")

  const [modelo, setModelo] = useState("")

  const optionsSiNo = [
    { value: "", label: "" },
    { value: "false", label: "No" },
    { value: "true", label: "Si" },
  ];
  const [venderVehiculo, setVenderVehiculo] = useState("")

  const [creditoVehiculo, setCreditoVehiculo] = useState("")

  const [banco, setBanco] = useState("")

  const [comprarVehiculo, setComprarVehiculo] = useState("")

  const [vehiculoCompra, setVehiculoCompra] = useState("")

  const infoCliente = useMemo(() => {
    return {
      pk_documento_cliente : documento,
      tipo_documento : tipoDocumento,
      nombre : nombre,
      apellidos : apellidos,
      fecha_nacimiento : fechaNacimiento,
      genero : genero,
      celular : celular,
      email : email,
      eps : eps,
      arl : arl,
      municipio : parseInt(homeLocation?.foundMunicipios?.[0]?.[0]?.c_digo_dane_del_municipio.replace(".","")),
      departamento : parseInt(homeLocation?.foundMunicipios?.[0]?.[0]?.c_digo_dane_del_departamento),
      barrio : homeLocation?.barrio?.[0],
      direccion : homeLocation?.direccion?.[0],
      info_vehiculo : {
        vehiculo : tiene_vehiculo,
        modelo : modelo,
        esta_vendiendo : venderVehiculo,
        sigue_pagando_vehiculo : creditoVehiculo,
        banco : banco
      },
      interes_compra_vehiculo : vehiculoCompra,
      home_location : homeLocation
    };
  }, [
    setTipoDocumento,
    setDocumento,
    setNombre,
    setApellidos,
    setFechaNacimiento,
    setGenero,
    setCelular,
    setEmail,
    setEps,
    setArl,
    homeLocation,
    setTiene_vehiculo,
    setModelo,
    setVenderVehiculo,
    setCreditoVehiculo,
    setBanco,
    setVehiculoCompra,
  ]);  

  const optionsCategoria = [
    { value: "", label: "" },
    { value: "A1", label: "A1-Motocicletas con cilindrada hasta 125" },
    { value: "A2", label: "A2-Motocicletas y mototriciclos con cilindrada mayor a 125" },
    { value: "B1", label: "B1-Automóviles, motocarros, cuatrimotos, camperos, camionetas y microbuses de servicio particular" },
    { value: "C1", label: "C1-Automóviles, camperos, camionetas y microbuses de servicio público" },
    { value: "B2", label: "B2-Camiones rígidos, busetas y buses de servicio particular" },
    { value: "C2", label: "C2-Camiones rígidos, busetas y buses de servicio público" },
    { value: "B3", label: "B3-Vehículos articulados servicio particular" },
    { value: "C3", label: "C3-Vehículos articulados servicio público" },
  ];

  const [categoria, setCategoria] = useState("")
  const [categoria2, setCategoria2] = useState("")
  const [foundEps, setFoundEps] = useState([])
  const [foundArl, setFoundArl] = useState([])
  const [optionsEps, setOptionsEps] = useState([])
  const [optionsArl, setOptionsArl] = useState([])
  const [cierreManual, setCierreManual] = useState(false)

  const searchEps = useCallback((e) => {
    const query = (e.target.value);
    if (query.length > 1) {
    const datos = [];
    const resp = optionsEps.map((eps) => {
      if (eps.includes(query)){
      datos.push(
        <div onClick={ (e) => {
          setEps(eps)
        }}
          >
          <h1>{eps}</h1>
          </div>
        )
      }
      return datos
    })  
      setFoundEps(resp[0]) 
    } else {
      setFoundEps([]);
    }
  }, [optionsEps]);

  const searchArl = useCallback((e) => {
    const query = (e.target.value);
    if (query.length > 1) {
    const datos = [];
    const resp = optionsArl.map((arl) => {
      if (arl.includes(query)){
      datos.push(
        <div onClick={ (e) => {
          setArl(arl)
        }}
          >
          <h1>{arl}</h1>
          </div>
        )
      }
      return datos
    })  
      setFoundArl(resp[0]) 
    } else {
      setFoundArl([]);
    }
  }, [optionsArl]);

  const [ticket1, setTicket1] = useState("")
  const [ticket2, setTicket2] = useState("")

  const [objTicketActual, setObjTicketActual] = useState({
    title: "",
    timeInfo: {
      "Fecha de venta": "",
      Hora: "",
    },
    commerceInfo: [
      /*id_comercio*/
      ["Id comercio", roleInfo?.id_comercio ? roleInfo?.id_comercio : 1],
      /*id_dispositivo*/
      ["No. terminal", roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 1],

      ["Id Trx", ""],
      ["", ""],
      ["Comercio", roleInfo?.["nombre comercio"]],
      ["", ""],
      /*direccion*/
      ["Dirección", roleInfo?.direccion ? roleInfo?.direccion : "No hay datos"],
      ["", ""],

  
    ],
    commerceName: "",
    trxInfo: [
      ["Proceso", "Creacion de Pin"],
      ["", ""],
      ["", ""],
      ["",""],
      ["", ""],
    ],
    disclamer: "Para quejas o reclamos comuníquese al 3503485532 (Servicio al cliente) o al 3102976460 (chatbot)",
  });

  const [objTicketActual2, setObjTicketActual2] = useState({
    title: "",
    timeInfo: {
      "Fecha de venta": "",
      Hora: "",
    },
    commerceInfo: [
      /*id_comercio*/
      ["Id comercio", roleInfo?.id_comercio ? roleInfo?.id_comercio : 1],
      /*id_dispositivo*/
      ["No. terminal", roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 1],

      ["Id Trx", ""],
      ["", ""],
      ["Comercio", roleInfo?.["nombre comercio"]],
      ["", ""],
      /*direccion*/
      ["Dirección", roleInfo?.direccion ? roleInfo?.direccion : "No hay datos"],
      ["", ""],
    ],
    commerceName: "",
    trxInfo: [
    ],
    disclamer: "Para quejas o reclamos comuníquese al 3503485532 (Servicio al cliente) o al 3102976460 (chatbot)",
  });

  

  useEffect(() => {
    con_estado_tipoPin("tipo_pines_vus")
    .then((res) => {
      setDisabledBtns(false);
      if (!res?.status) {
        notifyError(res?.msg);
      } else {
        setOptionsTipoPines(res?.obj?.results);
      }
    })
    .catch(() => setDisabledBtns(false));
  
    consultaTramite()
    .then((res) => {
      //console.log(res)
      setDisabledBtns(false);
      if (!res?.status) {
        notifyError(res?.msg);
      } else {
        setOptionsTramites(res?.obj?.results);
      }
    })
    .catch(() => setDisabledBtns(false));

    consultaEpsArl()
    .then((res) => {
      setDisabledBtns(false);
      if (!res?.status) {
        notifyError(res?.msg);
      } else {
        setOptionsEps(res?.obj?.eps);
        setOptionsArl(res?.obj?.arl);
      }
    })
    .catch(() => setDisabledBtns(false));

    ///////////////
    consultaCierreManual()
    .then((res) => {
      if (!res?.status) {
        setCierreManual(false)
      } else {
        setCierreManual(true)
      }
    })
    .catch(() => console.log("Falla en consulta estado cierre manual"));
  }, []);

  const pinData = useMemo(() => {
    const resp = optionsTipoPines?.filter((id) => id.id === tipoPin);
    const pinData = {
      descripcion : resp[0]?.descripcion.toUpperCase(),
      valor : resp[0]?.valor,
      iva : resp[0]?.iva,
      total : resp[0]?.valor + resp[0]?.iva
    }
    return pinData;
  }, [optionsTipoPines, tipoPin]);

  const tramiteData = useMemo(() => {
    const resp = optionsTramites?.filter((id) => id.id === tramite);
    const tramiteData = {
      descripcion : resp[0]?.descripcion.toUpperCase(),
      valor : resp[0]?.valor,
      iva : resp[0]?.iva,
      total : resp[0]?.valor + resp[0]?.iva,
      tipo : resp[0]?.tipoTramite
    }
    return tramiteData;
  }, [optionsTramites, tramite]);

  const tramiteData2 = useMemo(() => {
    const resp = optionsTramites2?.filter((id) => id.id === tramite2);
    const tramiteData2 = {
      descripcion : resp[0]?.descripcion.toUpperCase(),
      valor : resp[0]?.valor,
      iva : resp[0]?.iva,
      total : resp[0]?.valor + resp[0]?.iva,
      tipo : resp[0]?.tipoTramite
    }
    return tramiteData2;
  }, [optionsTramites2, tramite2]);

  const user = useMemo(() => {
    return {
      Tipo: roleInfo?.tipo_comercio,
      Usuario: roleInfo?.id_usuario,
      Dispositivo: roleInfo?.id_dispositivo,
      Comercio: roleInfo?.id_comercio,
      Depto: roleInfo?.codigo_dane?.slice(0, 2),
      Municipio: roleInfo?.codigo_dane?.slice(2),
      nombre_comercio: roleInfo?.["nombre comercio"],
    };
  }, [roleInfo]);

  const onSubmitModal = (e) => {
    e.preventDefault();

    if (firma === "" && pedirFirma) {
      notifyError("Asegúrese de tener la firma del cliente en físico ")
    }
    setShowModal(true) 
  };

  const onSubmitCliente = (e) => {
    e.preventDefault();
    setDisabledBtnsContinuar(true);
    setShowFormulario(false)
    consultaClientes(documento,olimpia,idPin,tipoPin).then((resp) => {
      if (!resp?.status){
        notifyError(resp?.msg)
      }else{
      setPedirFirma(!resp?.obj?.firma)
      setShowFormulario(true)    
      if (resp?.obj?.results?.length > 0) {
        const fecha_nacimiento = new Date(resp?.obj?.results?.[0]?.fecha_nacimiento);
        fecha_nacimiento.setHours(fecha_nacimiento.getHours() + 5);
        setNombre(resp?.obj?.results?.[0]?.nombre?.toUpperCase())
        setApellidos(resp?.obj?.results?.[0]?.apellidos?.toUpperCase())
        setFechaNacimiento(dateFormatter.format(fecha_nacimiento))
        setGenero(resp?.obj?.results?.[0]?.genero)
        setCelular(resp?.obj?.results?.[0]?.celular)
        setEmail(resp?.obj?.results?.[0]?.email?.toUpperCase())
        setEps(resp?.obj?.results?.[0]?.eps)
        setArl(resp?.obj?.results?.[0]?.arl)
        setTiene_vehiculo(resp?.obj?.results?.[0]?.info_vehiculo?.vehiculo)
        setModelo(resp?.obj?.results?.[0]?.info_vehiculo?.modelo)
        setVenderVehiculo(resp?.obj?.results?.[0]?.info_vehiculo?.esta_vendiendo)
        setCreditoVehiculo(resp?.obj?.results?.[0]?.info_vehiculo?.sigue_pagando_vehiculo)
        setBanco(resp?.obj?.results?.[0]?.info_vehiculo?.banco)
        setComprarVehiculo(resp?.obj?.results?.[0]?.interes_compra_vehiculo !== "" ? "true" : "false")
        setVehiculoCompra(resp?.obj?.results?.[0]?.interes_compra_vehiculo)
        if (resp?.obj?.results?.[0]?.home_location !== null){
        homeLocation?.municipio?.[1](resp?.obj?.results?.[0]?.home_location?.municipio?.[0])
        homeLocation?.departamento?.[1](resp?.obj?.results?.[0]?.home_location?.departamento?.[0])
        homeLocation?.direccion?.[1](resp?.obj?.results?.[0]?.home_location?.direccion?.[0]?.toUpperCase())
        homeLocation?.barrio?.[1](resp?.obj?.results?.[0]?.home_location?.barrio?.[0]?.toUpperCase())
        homeLocation?.localidad?.[1](resp?.obj?.results?.[0]?.home_location?.localidad?.[0])
        homeLocation?.foundMunicipios?.[1](resp?.obj?.results?.[0]?.home_location?.foundMunicipios?.[0])
        }
      }
      else{
        setNombre("")
        setApellidos("")
        setFechaNacimiento("")
        setGenero("")
        setCelular("")
        setEmail("")
        setEps("")
        setArl("")
        setTiene_vehiculo("")
        setModelo("")
        setVenderVehiculo("")
        setCreditoVehiculo("")
        setBanco("")
        setComprarVehiculo("")
        setVehiculoCompra("")
        if (resp?.obj?.results?.[0]?.home_location !== null){ 
        /// Se inicializa en Bogota
        homeLocation?.municipio?.[1]("Bogotá D.C.")
        homeLocation?.departamento?.[1]("Bogotá D.C.")
        homeLocation?.direccion?.[1]("")
        homeLocation?.barrio?.[1]("")
        homeLocation?.localidad?.[1]("")
        homeLocation?.foundMunicipios?.[1]([{
          c_digo_dane_del_departamento: "11",
          c_digo_dane_del_municipio: "11.001",
          departamento: "Bogotá D.C.",
          municipio: "Bogotá D.C.",
          region: "Región Centro Oriente"}
        ])
      }
    }}
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setDisabledBtns(true);
    const hora_actual=Intl.DateTimeFormat("es-CO", {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(new Date())
    const hora = hora_actual.split(":")
    const deltaHora = parseInt(horaCierre[0])-parseInt(hora[0])
    const deltaMinutos = parseInt(horaCierre[1])-parseInt(hora[1])
    if (deltaHora<0 || (deltaHora===0 & deltaMinutos<5) ){
      notifyError("Para evitar fallas no se permite realizar la transacción, hora cierre: " + horaCierre[0] + ":" + horaCierre[1])
      navigate("/Pines/PinesVus",{replace:true});
    }else{

    const fecha = Intl.DateTimeFormat("es-CO", {
      year: "2-digit",
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
    objTicket["title"] = "Recibo de pago: Servicio voluntario de impresión premium"
    objTicket["timeInfo"]["Fecha de venta"] = fecha;
    objTicket["timeInfo"]["Hora"] = hora;
    objTicket["commerceName"] = "PIN PARA GENERACIÓN DE LICENCIA"
    objTicket["trxInfo"][0] = ["Trámite", "Creación de Pin"]
    // objTicket["trxInfo"][2] = ["Valor Pin", formatMoney.format(respPin?.valor)]
    // objTicket["trxInfo"][3] = ["IVA Pin",formatMoney.format(respPin?.valor_iva)]
    // objTicket["trxInfo"][4] = ["Total", formatMoney.format(respPin?.valor + respPin?.valor_iva)] 

    const objTicket2 = { ...objTicketActual2 };
    objTicket2["title"] = "Recibo de pago: Trámite de licencias " 
    objTicket2["timeInfo"]["Fecha de venta"] = fecha;
    objTicket2["timeInfo"]["Hora"] = hora;
    objTicket2["commerceName"] = "TRÁMITE GENERACIÓN DE LICENCIA"
    if (!isNaN(tramiteData2.total)){
    objTicket2["trxInfo"][0] = ["Detalle trámite 1", tramiteData?.descripcion]
    objTicket2["trxInfo"][1] = ["", ""]
    objTicket2["trxInfo"][2] = ["Valor trámite 1", formatMoney.format(tramiteData?.valor)]
    objTicket2["trxInfo"][3] = ["", ""]
    objTicket2["trxInfo"][4] = ["Detalle trámite 2", tramiteData2?.descripcion]
    objTicket2["trxInfo"][5] = ["", ""]
    objTicket2["trxInfo"][6] = ["Valor trámite 2", formatMoney.format(tramiteData2?.valor)]
    objTicket2["trxInfo"][7] = ["", ""]
    objTicket2["trxInfo"][8] = ["Total", formatMoney.format(tramiteData?.valor + tramiteData?.iva + tramiteData2?.valor)] 
    objTicket2["trxInfo"][9] = ["", ""]


    }
    else{
      objTicket2["trxInfo"][0] = ["Detalle trámite 1", tramiteData?.descripcion]
      objTicket2["trxInfo"][1] = ["", ""]
      objTicket2["trxInfo"][2] = ["Valor trámite 1", formatMoney.format(tramiteData?.valor)]
      objTicket2["trxInfo"][3] = ["", ""]
      objTicket2["trxInfo"][4] = ["Total", formatMoney.format(tramiteData?.valor + tramiteData?.iva)] 
      objTicket2["trxInfo"][5] = ["", ""]

    }

    crearPinVus(documento, tipoPin, tramite,tramite2, user, tramiteData, tramiteData2, infoCliente, olimpia, categoria, categoria2, idPin,firma, motivoCompra, descripcionTipDoc, objTicket,objTicket2 )
      .then((res) => {
        setDisabledBtns(false);
        if (!res?.status) {
          notifyError(res?.msg);
        } else {
          setRespPin(res?.obj);
          setShowModal(true);
          setDisabledBtns(false);
          setShowModal(true);
          objTicket["commerceInfo"][2] = ["Id trx", res?.obj?.transacciones_id_trx?.creacion]
          objTicket["trxInfo"][1] =["Vence", res?.obj?.fecha_vencimiento];
          objTicket["trxInfo"][2] =["Valor Pin", formatMoney.format(res?.obj?.valor)];
          objTicket["trxInfo"][3] =["IVA Pin",formatMoney.format(res?.obj?.valor_iva)];
          objTicket["trxInfo"][4] =["Total", formatMoney.format(res?.obj?.valor + res?.obj?.valor_iva)];
          objTicket2["commerceInfo"][2] = ["Id trx", res?.obj?.transacciones_id_trx?.creacion]
          setTicket1(objTicket)
          setTicket2(objTicket2)
        }
      })
      .catch(() => setDisabledBtns(false));
    }
  };

  const closeModal = useCallback(async () => {
    if(respPin !== ""){
      navigate(-1);
      setDocumento("");
      setRespPin("");
      setTipoPin("");
      setIdPin("");
    }
    setShowModal(false);
    setDisabledBtns(false);
    setFirma("")
    
  }, [respPin]);

  const closeModalFirma = useCallback(async () => {    
    setShowModalFirma(false);      
  }, []);

  
  const hora = useMemo(() => {    
    return Intl.DateTimeFormat("es-CO", {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(new Date())
  }, [venderVehiculo, tipoPin, showModal]);

  const horaCierre = useMemo(() => { 
    const dia = (new Date()).getDay()  
    if (dia === enumParametrosPines.diaFinSemana) {
      return enumParametrosPines.horaCierreFinSemana.split(":")
    }
    else{
      return enumParametrosPines.horaCierre.split(":")
    }
     
  }, [hora]);

  useEffect(() => {
    
    const horaActual = hora.split(":")
    const deltaHora = parseInt(horaCierre[0])-parseInt(horaActual[0])
    const deltaMinutos = parseInt(horaCierre[1])-parseInt(horaActual[1])
    if (deltaHora<0 || (deltaHora===0 & deltaMinutos<1) ){
      notifyError("Módulo cerrado a partir de las " + horaCierre[0] + ":" + horaCierre[1])
      navigate("/Pines/PinesVus",{replace:true});
    }
    else if (cierreManual){
      notifyError("Módulo cerrado de manera manual")
      navigate("/Pines/PinesVus",{replace:true});
    }
    else if ((deltaHora ===1 & deltaMinutos<-50)){
      notifyError("El módulo se cerrara en " + String(parseInt(deltaMinutos)+60) + " minutos, por favor evite realizar mas transacciones")  
    }
    else if ((deltaHora ===0 & deltaMinutos<10)){
      notifyError("El módulo se cerrara en " + deltaMinutos + " minutos, por favor evite realizar mas transacciones") 
    }

  }, [venderVehiculo,tipoPin, hora, horaCierre, navigate, cierreManual])
  
  return (
    <>
    {"id_comercio" in roleInfo ? (
    <>
      <h1 className="text-3xl">Datos creación de Pin</h1>
      <Form onSubmit={onSubmitCliente} grid>
      <Select
        id="tipoDocumento"
        label="Tipo de documento"
        options={optionsDocumento}
        value={tipoDocumento}
        onChange={(e) => {
          setTipoDocumento(e.target.value);
          setDescripcionTipDoc(optionsDocumento.filter(tip => tip.value === e.target.value)[0]['label'])
          setDisabledBtnsContinuar(false)
          setShowFormulario(false)
          setTipoPin("")
          setTramite("")
          setCategoria("")
        }}
        required
      />  
      <Input
        id="numDocumento"
        label="Documento"
        type="text"
        required
        minLength="5"
        maxLength="12"
        autoComplete="off"
        value={documento}
        onInput={(e) => {
          const num = parseInt(e.target.value) || "";
          setDocumento(num);
          setDisabledBtnsContinuar(false)
          setShowFormulario(false)
          setTipoPin("")
          setTramite("")
          setCategoria("")
        }}
      />
      <Select
        id="olimpia"
        label="¿Ya inicio el proceso en Olimpia?"
        required
        options={[
          { value: "", label: "" },
          { value: true, label: "Si" },
          { value: false, label: "No" },
        ]}
        value={olimpia}
        onChange={(e) => {
          setOlimpia(e.target.value);
          setDisabledBtnsContinuar(false)
          setShowFormulario(false)
          setTipoPin("")
          setTramite("")
          setCategoria("")
        }}
      />
      {olimpia === "true" ? 
      <>
       <Input
       id="idPin"
       label="Id Pin"
       type="text"
       required
       minLength="1"
       maxLength="12"
       autoComplete="off"
       value={idPin}
       onInput={(e) => {
         const num = parseInt(e.target.value) || "";
         setIdPin(num);
       }}
      />
      </>
      :"" }
      <ButtonBar className="lg:col-span-2">
      <Button type="submit" disabled={disabledBtnsContinuar}>
        Continuar
      </Button>
      </ButtonBar>
      </Form>
      {showFormulario? 
      <Form onSubmit={onSubmitModal} grid>
      <Fieldset legend="Datos cliente" className="lg:col-span-2">
        {/* <Input
          id="nombre"
          label="Nombre"
          type="text"
          minLength="1"
          maxLength="30"
          required
          autoComplete="off"
          value={nombre}
          onInput={(e) => {
            const text = e.target.value.toUpperCase()
            setNombre(text);
          }}
        />
        <Input
          id="apellidos"
          label="Apellidos"
          type="text"
          minLength="1"
          maxLength="30"
          required
          autoComplete="off"
          value={apellidos}
          onInput={(e) => {
            const text = e.target.value.toUpperCase()
            setApellidos(text);
          }}
        />
        <Input
          id="dateInit"
          label="Fecha Nacimiento"
          type="date"
          required
          value={fechaNacimiento}
          onInput={(e) => setFechaNacimiento(e.target.value)}
        />
        <Select
          id="genero"
          label="Genero"
          options={optionsGenero}
          value={genero}
          onChange={(e) => {
            setGenero(e.target.value);
          }}
        /> */}
        <Input
          id="celular"
          label="Celular"
          type="text"
          required
          minLength="10"
          maxLength="10"
          autoComplete="off"
          value={celular}
          onInput={(e) => {
            if (celular?.length === 0 & e.target.value!=="3"){
              notifyError("El número de celular debe iniciar por 3")
              setCelular("");
            } 
            else {
            const num = parseInt(e.target.value) || "";
            setCelular(num);
          }
          }}
        />
        <Input
          id="email"
          label="Email"
          type="email"
          minLength="5"
          maxLength="100"
          required
          autoComplete="off"
          value={email}
          onInput={(e) => {
            const text = e.target.value.toUpperCase()
            setEmail(text);
          }}
        />
        <TextArea
          id="motivo"
          label="Motivo compra"
          type="input"
          minLength="1"
          maxLength="160"
          autoComplete="off"
          value={motivoCompra}
          required
          onInput={(e) => {
            setMotivoCompra(e.target.value);
          }}
        />
        {/* <InputSuggestions
        id={"searchEps"}
        label={"Eps"}
        name={"nameEps"}
        type={"search"}
        value={eps}
        autoComplete="off"
        suggestions={foundEps || []}
        onInput={(e) => {
          const text = e.target.value.toUpperCase()
          setEps(text);
        }}
        onLazyInput={{
          callback: searchEps,
          timeOut: 500,
        }}
        />
        <InputSuggestions
        id={"searchArl"}
        label={"Arl"}
        name={"nameArl"}
        type={"search"}
        value={arl}
        autoComplete="off"
        suggestions={foundArl || []}
        onInput={(e) => {
          const text = e.target.value.toUpperCase()
          setArl(text);
        }}
        onLazyInput={{
          callback: searchArl,
          timeOut: 500,
        }}
        />
        <LocationFormPinVus place="Residencia" location={homeLocation} addressInput="input"/> */}
      </Fieldset>
      {/* <Fieldset legend="Datos Vehículo" className="lg:col-span-2">
        <Select
          id="tieneVehiculo"
          label="¿Tiene Vehículo?"
          options={optionsVehiculo}
          value={tiene_vehiculo}
          onChange={(e) => {
            setTiene_vehiculo(e.target.value);
          }}
        />
        {tiene_vehiculo !== "" ?
        <>
          <Input
          id="modelo"
          label="Modelo"
          type="text"
          required
          minLength="4"
          maxLength="4"
          autoComplete="off"
          value={modelo}
          onInput={(e) => {
            const num = parseInt(e.target.value) || "";
            setModelo(num);
          }}
          />
          <Select
          id="venderVehiculo"
          label="¿Interés en vender?"
          options={optionsSiNo}
          value={venderVehiculo}
          onChange={(e) => {
            setVenderVehiculo(e.target.value);
          }}
          />
          <Select
          id="venderVehiculo"
          label="¿Sigue pagando crédito?"
          options={optionsSiNo}
          value={creditoVehiculo}
          onChange={(e) => {
            setCreditoVehiculo(e.target.value);
          }}
          />
          {creditoVehiculo==="true"? 
            <Input
            id="banco"
            label="Entidad financiera"
            type="text"
            autoComplete="off"
            value={banco}
            onInput={(e) => {
              setBanco(e.target.value);
            }}
            />
            : "" }
        </>
        :""}
        <Fieldset className="lg:col-span-2">
        <Select
          id="comprarVehiculo"
          label="¿Interés en comprar?"
          options={optionsSiNo}
          value={comprarVehiculo}
          onChange={(e) => {
            setComprarVehiculo(e.target.value);
          }}
        />
        {comprarVehiculo==="true"? 
            <Select
            id="vehiculoCompra"
            label="¿Qué desea comprar?"
            options={optionsVehiculo}
            value={vehiculoCompra}
            onChange={(e) => {
              setVehiculoCompra(e.target.value);
            }}
          />
            : "" }
        </Fieldset>
      </Fieldset>      */}
      <Fieldset legend="Datos Trámite" className="lg:col-span-2">
      
        <Select
          className="place-self-stretch"
          id="tipoPin"
          label="Tipo Pin"
          options={
            Object.fromEntries([    
              ["",""],        
              ...optionsTipoPines?.map(({ descripcion, id }) => {
                return [descripcion, id];
              }),
            ]) || { "": "" }
          }
          value={tipoPin}
          required={true}
          onChange={(e) => {
            setTipoPin(parseInt(e.target.value) ?? "");
            if(isNaN(tipoPin)){
              setTipoPin("")
            } setDisabledBtns(true)
            consultaClientes(documento,olimpia,idPin,e.target.value).then((resp) => {
              if (!resp?.status){
                notifyError(resp?.msg)
                setShowPinLicencia(false)
                setTipoPin("")
                setDisabledBtns(false)
               // console.log(resp)
              }else{               // console.log(resp)
                if(e.target.value=="1"){
                  setShowPinLicencia(true)
                  setShowTramiteAdicional(false)
                  setTramite2("")
                  setCategoria2("")
                  settxtButtonTramiteAdicional("+ Agregar Segundo Trámite")
                  setTramite("")
                  setCategoria("")
                  setDisabledBtns(false)
                }else{
                setShowPinLicencia(false)
                setDisabledBtns(false)

                //setDisabledBtns(false)

                }
              }})
          }}
        />
        

        <Select
          className="place-self-stretch"
          id="tramite"
          label="Trámite"
          options={
            Object.fromEntries([
              ["", ""],
              ...optionsTramites?.map(({ descripcion, id }) => {

              if(optionsTramites[id-1]["tipoPin"]==tipoPin){
                return [descripcion, id];
              }else{
                return ["", ""];
              }
              }),
            ]) || { "": "" }
          }
          value={tramite}
          required={true}
          onChange={(e) => {
            setTramite(parseInt(e.target.value) ?? "");
            setShowTramiteAdicional(false)
            setTramite2("")
            setCategoria2("")
            settxtButtonTramiteAdicional("+ Agregar Segundo Trámite")
          }}
        />
    
    {showPinLicencia ? 
      <>


        <Select
          className="place-self-stretch"
          id="categoria"
          label="Categoría de Licencia"
          options={optionsCategoria}
          required={true}
          value={categoria}
          onChange={(e) => {
            setCategoria(e.target.value);
            setShowTramiteAdicional(false)
            setTramite2("")
            setCategoria2("")
            settxtButtonTramiteAdicional("+ Agregar Segundo Trámite")
          }
        }
          />

          <br></br>

          <ButtonBar className="col-auto md:col-span-2">
            <Button type="" value="Trámite adicional" onClick={ev=>{
              ev.preventDefault()
              
             if (showTramiteAdicional==false&&!isNaN(tramite)&&categoria!=""){

              setOptionsTramites2([...(optionsTramites)])
              
             //if(!isNaN(tramite)&&tramite!="3"&&tramite!="4"&&tramite!="5"&&tramite!="6"){
              if(!isNaN(tramite)){
                setShowTramiteAdicional(true)
              settxtButtonTramiteAdicional("- Suprimir Segundo Trámite")
                if(tramite=="1"){
                  setOptionsTramites2([...(optionsTramites.slice(1,2)),...(optionsTramites.slice(3,4)),...(optionsTramites.slice(5,10))])
                }else if(tramite=="2"){
                  setOptionsTramites2([...(optionsTramites.slice(0,1)),...(optionsTramites.slice(2,3)),...(optionsTramites.slice(4,5)),...(optionsTramites.slice(6,10))])
                }else if(tramite=="3"){
                  setOptionsTramites2([...(optionsTramites.slice(1,2)),...(optionsTramites.slice(3,4)),...(optionsTramites.slice(5,6)),...(optionsTramites.slice(7,8)),...(optionsTramites.slice(9,10))])
                }else if(tramite=="4"){
                  setOptionsTramites2([...(optionsTramites.slice(0,1)),...(optionsTramites.slice(2,3)),...(optionsTramites.slice(4,5)),...(optionsTramites.slice(6,7)),...(optionsTramites.slice(8,9))])
                }else if(tramite=="5"){
                  setOptionsTramites2([...(optionsTramites.slice(1,2)),...(optionsTramites.slice(3,4)),...(optionsTramites.slice(5,6)),...(optionsTramites.slice(7,8)),...(optionsTramites.slice(9,10))])
                }else if(tramite=="6"){
                  setOptionsTramites2([...(optionsTramites.slice(0,1)),...(optionsTramites.slice(2,3)),...(optionsTramites.slice(4,5)),...(optionsTramites.slice(6,7)),...(optionsTramites.slice(8,9))])
                }else if(tramite=="7"){
                  setOptionsTramites2([...(optionsTramites.slice(0,2)),...(optionsTramites.slice(3,4)),...(optionsTramites.slice(5,6)),...(optionsTramites.slice(7,10))])
                }else if(tramite=="8"){
                  setOptionsTramites2([...(optionsTramites.slice(0,3)),...(optionsTramites.slice(4,5)),...(optionsTramites.slice(6,7)),...(optionsTramites.slice(8,10))])
                }else if(tramite=="9"){
                  setOptionsTramites2([...(optionsTramites.slice(0,2)),...(optionsTramites.slice(3,4)),...(optionsTramites.slice(5,8)),...(optionsTramites.slice(9,10))])
                }else if(tramite=="10"){
                  setOptionsTramites2([...(optionsTramites.slice(0,3)),...(optionsTramites.slice(4,5)),...(optionsTramites.slice(6,9))])
                }
                else{
                  setOptionsTramites2([])
                }
                
           }
                }
              else{
                setShowTramiteAdicional(false)
                setTramite2("")
                setCategoria2("")
                settxtButtonTramiteAdicional("+ Agregar Segundo Trámite")
              }

            }}>  
                     {txtButtonTramiteAdicional}
                    </Button>
                    </ButtonBar>


                    {showTramiteAdicional? 
              
                <Fieldset legend="Datos Trámite Adicional" className="lg:col-span-2">
              <Select
                    className="place-self-stretch"
                    id="tramite2"
                    label="Trámite adicional"
                    options={
                      Object.fromEntries([
                        ["", ""],
                        ...optionsTramites2?.map(({ descripcion, id }) => {
                          return [descripcion, id];
                        }),
                      ]) || { "": "" }
                    }
                    value={tramite2}
                    required={true}
                    onChange={(e) => {
                      setTramite2(parseInt(e.target.value) ?? "");
                    }}
                  />

                  <Select
                    className="place-self-stretch"
                    id="categoria2"
                    label="Categoría de Licencia"
                    options={optionsCategoria}
                    required={true}
                    value={categoria2}
                    onChange={(e) => {
                      setCategoria2(e.target.value);
                    }}
                    />
                   </Fieldset> 
      
              :
              ""
              }  
                      </>
      :"" 
      }
      </Fieldset>       
      <ButtonBar className="col-auto md:col-span-2">
        <Button type="submit" disabled={disabledBtns}>
          Crear pin
        </Button>
        <Button type="button"
        onClick={() => {
          setShowModalFirma(true)
        }}
        disabled={!pedirFirma}
        >
          Firma
        </Button>
      </ButtonBar>
      </Form>
      :
      ""
      }    
      
        

      <Modal show={showModal} handleClose={() => closeModal()}>
        {respPin !== ""? 
        <div className="flex flex-col justify-center items-center" >
          <div ref={printDiv}>
          <TicketsPines
            refPrint={null} 
            ticket={ticket1} 
            logo = 'LogoVus'
          />
          <TicketsPines
            refPrint={null} 
            ticket={ticket2}
            logo = 'LogoVus'
          />
          </div>
          <ButtonBar>
            <Button
              onClick={() => {
                handlePrint();
              }}
            >
              Imprimir
            </Button>
            <Button
              onClick={() => {
                closeModal();
              }}
            >
              Cerrar
            </Button>
          </ButtonBar>
        </div>
        :
        <div className="flex flex-col justify-center items-center">
          <div className="flex flex-col w-1/2 mx-auto">
            <h1 className="text-3xl mt-3 mx-auto">Crear Pin</h1>
            <br></br>
            <h1 className="flex flex-row justify-center text-lg font-medium">{tramiteData.descripcion}   -   {tramiteData2.descripcion}</h1>
            <br></br>
            <>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Valor Trámite 1</h1>
                <h1>{formatMoney.format(tramiteData.valor)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>IVA Trámite 1</h1>
                <h1>{formatMoney.format(tramiteData.iva)}</h1>
              </div>
              {showTramiteAdicional? 
              <div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Valor Trámite 2</h1>
                <h1>{formatMoney.format(tramiteData2.valor)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>IVA Trámite 2</h1>
                <h1>{formatMoney.format(tramiteData2.iva)}</h1>
              </div>
              </div>
              :
              ""
              }  
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Valor Pin</h1>
                <h1>{formatMoney.format(pinData.valor)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>IVA Pin</h1>
                <h1>{formatMoney.format(pinData.iva)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Total</h1>
                {!isNaN(tramiteData2.total)? 
                <h1>{                 
                formatMoney.format(pinData.total + tramiteData.total + tramiteData2.total)}</h1>
                :
                <h1>{                 
                  formatMoney.format(pinData.total + tramiteData.total)}</h1>
                } 
              </div>
            </>
            {/* {Object.entries(tramiteData).map(([key, val]) => {
              return (
                <>
                  <div
                    className="flex flex-row justify-between text-lg font-medium"
                    key={key}
                  >
                    <h1>{key}</h1>
                    <h1>{val}</h1>
                  </div>
                </>
              );
            })} */}
            <div className="flex flex-col justify-center items-center mx-auto container">
              <Form onSubmit={onSubmit}>
                <ButtonBar>
                  <Button type="submit" disabled={disabledBtns}>
                    Crear Pin
                  </Button>
                  <Button
                    onClick={() => {
                      closeModal();
                      // setrespPago();
                      // getQuota();
                    }}
                  >
                    Cerrar
                  </Button>
                </ButtonBar>
              </Form>
            </div>
          </div>
        </div>     
        }   
      </Modal>
      <Modal show={showModalFirma} handleClose={() => closeModalFirma()}>
        <FirmaTratamientoDatos
        closeModal={closeModalFirma}
        setFirma = {setFirma}
        firma = {firma}
        >
        </FirmaTratamientoDatos>
      </Modal>
    </>) : (
      <h1 className="text-3xl mt-6">El usuario no tiene comercio asociado</h1>
    )}
    </>
  );
};
export default CrearPin;
