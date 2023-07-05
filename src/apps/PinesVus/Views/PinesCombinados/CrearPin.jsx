import { useCallback, useState, useMemo, useEffect, useRef } from "react";
import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import { usePinesVus } from "../../utils/pinesVusHooks";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notifyError, notifyPending } from "../../../../utils/notify";
import TicketsPines from "../../components/TicketsPines/TicketsPines"
import { useReactToPrint } from "react-to-print";
import Select from "../../../../components/Base/Select";
import { useNavigate } from "react-router-dom";
import Fieldset from "../../../../components/Base/Fieldset";
import LocationFormPinVus from "../../components/LocationForm/LocationFormPinesVus"
import { enumParametrosPines } from "../../utils/enumParametrosPines";
import FirmaTratamientoDatos from "../../components/FirmaTratamientoDatos/FirmaTratamientoDatos";
import useMoney from "../../../../hooks/useMoney";
import {
  makeSellPin,
  makeInquiryPin,
} from "../../../PinesCrc/utils/fetchFunctions";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import ScreenBlocker from "../../../PinesCrc/components/ScreenBlocker";
import TicketColpatria from "../../../PinesCrc/components/TicketColpatria/TicketColpatria";
import { decryptPin } from "../../../PinesCrc/utils/functions";
import { registroTrx } from "../../../PinesCrc/utils/fetchRegistrarTrx";

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

  const [limitesMontos, setLimitesMontos] = useState({
    max: 9999999,
    min: 1000,
  });

  const onChangeMoney = useMoney({
    limits: [limitesMontos.min, limitesMontos.max],
  });

  const [valVentaPines, setValVentaPines] = useState(0);
  const [loadingInquiry, setLoadingInquiry] = useState(false);
  const [inquiryStatus, setInquiryStatus] = useState(null);
  const [loadingSell, setLoadingSell] = useState(false);

  const navigate = useNavigate();

  const printDiv = useRef();
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    // pageStyle: "@page {size: 80mm 160mm; margin: 0; padding: 0;}",
  });

  const { crearPinVus, con_estado_tipoPin, consultaTramite, consultaClientes, consultaCierreManual} = usePinesVus();
  const { infoTicket } = useAuth();

  const { roleInfo, pdpUser } = useAuth();
  const [userAddress /* , setUserAddress */] = useState(
    roleInfo?.direccion ?? ""
  );

  const [showFormulario, setShowFormulario] = useState(false)
  const [documento, setDocumento] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showModalFirma, setShowModalFirma] = useState(false);
  const [disabledBtns, setDisabledBtns] = useState(false);
  const [disabledBtnsContinuar, setDisabledBtnsContinuar] = useState(false);
  const [showTramiteAdicional, setShowTramiteAdicional] = useState(false);
  const [showPinLicencia, setShowPinLicencia,] = useState(true);
  const [txtButtonTramiteAdicional, settxtButtonTramiteAdicional] = useState("+ Agregar Segundo Trámite");
  const [respPin, setRespPin] = useState("");
  const [optionsTipoPines, setOptionsTipoPines] = useState([]);
  const [tipoPin, setTipoPin] = useState("1");
  const [optionsTramites, setOptionsTramites] = useState([]);
  const [optionsTramites2, setOptionsTramites2] = useState([]);
  const [tramite, setTramite] = useState(7)
  const [tramite2, setTramite2] = useState("")

  const [nombre, setNombre] = useState("")
  const [apellidos, setApellidos] = useState("")
  const [direccion, setDireccion] = useState("")
  const [municipio, setMunicipio] = useState("")
  const [departamento, setDepartamento] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [celular, setCelular] = useState("")
  const [email, setEmail] = useState("")
  const [eps, setEps] = useState("")
  const [arl, setArl] = useState("")
  const [idPin, setIdPin] = useState("")
  const [firma, setFirma] = useState("")
  const [pedirFirma, setPedirFirma] = useState(true)
  const [descripcionTipDoc, setDescripcionTipDoc] = useState("")
  const [metodoPago, setMetodoPago] = useState("1")
  const [codigoPago, setCodigoPago] = useState("")
  const [codigoPago2, setCodigoPago2] = useState("")

  const [pinData, setPinData] = useState({})
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
    { value: "13", label: "PPT (Permiso por Protección Temporal)" },
  ];
  const [tipoDocumento, setTipoDocumento] = useState("1")

  const [genero, setGenero] = useState("")

  const [tiene_vehiculo, setTiene_vehiculo] = useState("")

  const [modelo, setModelo] = useState("")

  const [venderVehiculo, setVenderVehiculo] = useState("")

  const [creditoVehiculo, setCreditoVehiculo] = useState("")

  const [banco, setBanco] = useState("")

  const [comprarVehiculo, setComprarVehiculo] = useState("")

  const [vehiculoCompra, setVehiculoCompra] = useState("")

  const [paymentStatus, setPaymentStatus] = useState(null);

  const [finProceso, setFinProceso] = useState(false)

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

  const [categoria, setCategoria] = useState("B1")
  const [categoria2, setCategoria2] = useState("")
  const [cierreManual, setCierreManual] = useState(false)

  const  optionsCanales = [
    {"descripcion": "Olimpia",
    "id":1},
    {"descripcion": "Paynet(Indra)" ,
    "id":2}
  ]
  const [canal, setCanal ] = useState("1");

  const datosConvenio = useMemo(() => {
    if (canal == "1") {
      return{
    "codigo_pin": "0807", 
    "fk_id_convenio": 2310,//2041, 
    "fk_tipo_valor": 1, 
    "nombre_convenio": "Venta pines CRC", 
    "permite_modificar": true, 
    "pk_codigo_convenio": "108928", 
    "referencia_1": "Documento", 
    "referencia_2": "Celular", 
    "referencia_3": null, 
    "referencia_4": null, 
    "referencia_5": null
  };}
  else{ return{
    "codigo_pin": "0043", 
    "fk_id_convenio": 2310,//2041, 
    "fk_tipo_valor": 1, 
    "nombre_convenio": "Venta pines CRC", 
    "permite_modificar": false, 
    "pk_codigo_convenio": "108928", 
    "referencia_1": "Documento", 
    "referencia_2": "Celular", 
    "referencia_3": null, 
    "referencia_4": null, 
    "referencia_5": null
    };}
  },
    [canal]
  );

  const userReferences = useMemo(() => {
    return {
      referencia_1: String(documento), 
      referencia_2: String(celular)};
    },[documento, celular])

  const onMakeInquiry = useCallback(
    (ev) => {
      ev.preventDefault();

      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO",
        valor_total_trx: valVentaPines,
        nombre_usuario: pdpUser?.uname ?? "",

        // Datos trx colpatria
        colpatria: {
          codigo_convenio_pdp: datosConvenio?.fk_id_convenio,
          codigo_convenio: datosConvenio?.pk_codigo_convenio,
          codigo_pin: datosConvenio?.codigo_pin,
          ...userReferences,
          location: {
            address: userAddress,
            dane_code: roleInfo?.codigo_dane,
            city: roleInfo?.ciudad.substring(0, 7),
          },
        },
      };

      notifyPending(
        makeInquiryPin(data),
        {
          render: () => {
            setLoadingInquiry(true);
            return "Procesando consulta";
          },
        },
        {
          render: ({ data: res }) => {
            setLoadingInquiry(false);
            setInquiryStatus(res?.obj);
            if (canal==2){
            setValVentaPines(res?.obj?.valor);
            }
            return "Consulta satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            setLoadingInquiry(false);
            // navigate("/Pines", { replace: true });
            if (error?.cause === "custom") {
              return <p style={{ whiteSpace: "pre-wrap" }}>{error?.message}</p>;
            }
            // console.error(error?.message);
            return "Consulta fallida";
          },
        }
      );
    },
    [
      datosConvenio,
      userReferences,
      userAddress,
      valVentaPines,
      roleInfo,
      pdpUser?.uname,
      navigate,
    ]
  );

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

  useEffect(() => {
    con_estado_tipoPin("tipo_pines_vus")
    .then((res) => {
      setDisabledBtns(false);
      if (!res?.status) {
        notifyError(res?.msg);
      } else {
        const pin = res?.obj?.results
        setOptionsTipoPines(pin.filter(pin => pin.id === 1));
        const resp = pin.filter(pin => pin.id === 1);
        setPinData({
          descripcion : resp[0]?.descripcion.toUpperCase(),
          valor : resp[0]?.valor,
          iva : resp[0]?.iva,
          total : resp[0]?.valor + resp[0]?.iva
        }) 
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

    // consultaEpsArl()
    // .then((res) => {
    //   setDisabledBtns(false);
    //   if (!res?.status) {
    //     notifyError(res?.msg);
    //   } else {
    //     setOptionsEps(res?.obj?.eps);
    //     setOptionsArl(res?.obj?.arl);
    //   }
    // })
    // .catch(() => setDisabledBtns(false));

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

  // const pinData = useMemo(() => {
  //   const resp = optionsTipoPines?.filter((id) => id.id === tipoPin);
  //   const pinData = {
  //     descripcion : resp[0]?.descripcion.toUpperCase(),
  //     valor : resp[0]?.valor,
  //     iva : resp[0]?.iva,
  //     total : resp[0]?.valor + resp[0]?.iva
  //   }
  //   return pinData;
  // }, [optionsTipoPines, tipoPin]);

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
     setDisabledBtns(true)
    if(homeLocation){
      if((homeLocation["departamento"][0]=="")||(homeLocation["municipio"][0]=="")){
        notifyError("Asegúrese de diligenciar los datos de Ubicación")
        setShowModal(false)
      }
      else{
        if (firma === "" && pedirFirma) {
          notifyError("Asegúrese de tener la firma del cliente en físico ")
        }
        onMakeInquiry(e)
      }
    }
    setDisabledBtns(false)
  };
  const onSubmitCliente = (e) => {
    e.preventDefault();
    setDisabledBtnsContinuar(true);
    setShowFormulario(false)
    consultaClientes(documento,olimpia,tipoDocumento,idPin,tipoPin).then((resp) => {
      if (!resp?.status){
        notifyError(resp?.msg)
      }else{
      setPedirFirma(!resp?.obj?.firma)
      setShowFormulario(true) 
      if (tipoPin==""){   
      setShowPinLicencia(true)
      setShowTramiteAdicional(false)
      setTramite2("")
      setCategoria2("")
      settxtButtonTramiteAdicional("+ Agregar Segundo Trámite")
      setTramite(7)
      setCategoria("B1")
      setDisabledBtns(false)
      }
      else{
        setShowPinLicencia(false)
        setDisabledBtns(false)
        setCategoria("")
        setTramite2("")
        setCategoria2("")
        setTramite("")
        }

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
        else{
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
      
    }}
    });
  };

  const onSubmit = useCallback(
    (e) => {
    // e.preventDefault();
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
    if(tipoPin==1){
      objTicket["title"] = "Recibo de pago: Servicio voluntario de impresión premium"
    }else{
      objTicket["title"] = "Recibo de pago: " +pinData["descripcion"].toUpperCase() 
    }
    objTicket["timeInfo"]["Fecha de venta"] = fecha;
    objTicket["timeInfo"]["Hora"] = hora;
    objTicket["commerceName"] = pinData["descripcion"]
    objTicket["trxInfo"][0] = ["Trámite", "Creación de Pin"]
    objTicket["trxInfo"][5] = ["Documento", documento]
    objTicket["trxInfo"][6] = ["Método de pago", metodoPago === "1"? 'Efectivo' : 'Tarjeta']
    if (metodoPago === "2") {
      objTicket["trxInfo"][7] = ["", ""]
      objTicket["trxInfo"][8] = ["Código Aprobación", codigoPago]
      objTicket["trxInfo"][9] = ["", ""]
    }
    if (codigoPago2 !== "") {
      objTicket["trxInfo"][8] = ["Código Aprobación 1", codigoPago]
      objTicket["trxInfo"][10] = ["Código Aprobación 2", codigoPago2]
      objTicket["trxInfo"][11] = ["", ""]    
    }

    const objTicket2 = { ...objTicketActual2 };
    objTicket2["title"] = "Recibo de pago: TRÁMITE "+ tramiteData?.descripcion.toUpperCase() 
    objTicket2["timeInfo"]["Fecha de venta"] = fecha;
    objTicket2["timeInfo"]["Hora"] = hora;
    if(tipoPin==1){
      objTicket2["commerceName"] = "TRÁMITE GENERACIÓN DE LICENCIA"
    }else{
      objTicket2["commerceName"] = "TRÁMITE "+ tramiteData?.descripcion.toUpperCase() 
    }
    if (!isNaN(tramiteData2.total)){
    //objTicket2["title"] = "Recibo de pago: TRÁMITE "+ tramiteData?.descripcion.toUpperCase() +", "+ tramiteData2?.descripcion.toUpperCase()
    objTicket2["trxInfo"][0] = ["Detalle trámite 1", ""]
    objTicket2["trxInfo"][1] = ["", ""]
    objTicket2["trxInfo"][2] = ["", tramiteData?.descripcion]
    objTicket2["trxInfo"][3] = ["", ""]
    objTicket2["trxInfo"][4] = ["Valor trámite 1", formatMoney.format(tramiteData?.valor)]
    objTicket2["trxInfo"][5] = ["", ""]
    objTicket2["trxInfo"][6] = ["Detalle trámite 2", ""]
    objTicket2["trxInfo"][7] = ["", ""]
    objTicket2["trxInfo"][8] = ["", tramiteData2?.descripcion]
    objTicket2["trxInfo"][9] = ["", ""]
    objTicket2["trxInfo"][10] = ["Valor trámite 2", formatMoney.format(tramiteData2?.valor)]
    objTicket2["trxInfo"][11] = ["", ""]
    objTicket2["trxInfo"][12] = ["Total", formatMoney.format(tramiteData?.valor + tramiteData?.iva + tramiteData2?.valor)] 
    objTicket2["trxInfo"][13] = ["", ""]
    objTicket2["trxInfo"][14] = ["Documento", documento]
    objTicket2["trxInfo"][15] = ["", ""]
    objTicket2["trxInfo"][16] = ["Método de pago", metodoPago === "1"? 'Efectivo' : 'Tarjeta']
    objTicket2["trxInfo"][17] = ["", ""]
    if (metodoPago === "2") {
      objTicket2["trxInfo"][18] = ["Código Aprobación", codigoPago]
      objTicket2["trxInfo"][19] = ["", ""]
    }
    if (codigoPago2 !== "") {
      objTicket2["trxInfo"][18] = ["Código Aprobación 1", codigoPago]
      objTicket2["trxInfo"][19] = ["", ""]
      objTicket2["trxInfo"][19] = ["Código Aprobación 2", codigoPago2]
      objTicket2["trxInfo"][20] = ["", ""]    
    }


    }
    else{
     // objTicket2["title"] = "Recibo de pago: TRÁMITE "+ tramiteData?.descripcion.toUpperCase() 
      objTicket2["trxInfo"][0] = ["Detalle trámite", ""]
      objTicket2["trxInfo"][1] = ["", ""]
      objTicket2["trxInfo"][2] = ["", tramiteData?.descripcion]
      objTicket2["trxInfo"][3] = ["", ""]
      objTicket2["trxInfo"][4] = ["Valor trámite", formatMoney.format(tramiteData?.valor)]
      objTicket2["trxInfo"][5] = ["", ""]
      objTicket2["trxInfo"][6] = ["Total", formatMoney.format(tramiteData?.valor + tramiteData?.iva)] 
      objTicket2["trxInfo"][7] = ["", ""]
      objTicket2["trxInfo"][8] = ["Documento", documento]
      objTicket2["trxInfo"][9] = ["", ""]
      objTicket2["trxInfo"][10] = ["Método de pago", metodoPago === "1"? 'Efectivo' : 'Tarjeta']
      objTicket2["trxInfo"][11] = ["", ""]
      if (metodoPago === "2") {
        objTicket2["trxInfo"][12] = ["Código Aprobación", codigoPago]
        objTicket2["trxInfo"][13] = ["", ""]
      }
      if (codigoPago2 !== "") {
        objTicket2["trxInfo"][12] = ["Código Aprobación 1", codigoPago]
        objTicket2["trxInfo"][13] = ["", ""]
        objTicket2["trxInfo"][14] = ["Código Aprobación 2", codigoPago2]
        objTicket2["trxInfo"][15] = ["", ""]    
      }

    }

    crearPinVus(documento, tipoPin, tramite,tramite2, user, tramiteData, tramiteData2, infoCliente, olimpia, categoria, categoria2, idPin,firma, motivoCompra, descripcionTipDoc, objTicket,objTicket2, codigoPago, codigoPago2 )
      .then((res) => {
        setDisabledBtns(false);
        setFinProceso(true)
        if (!res?.status) {
          notifyError("Solo se completo la venta del pin para exámenes médicos, para crear el pin premium diríjase al módulo Pines para generación de licencias", false)
          // notifyError(res?.msg);
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
      .catch(() => {
        notifyError("Solo se completo la venta del pin para exámenes médicos, para crear el pin premium diríjase al módulo Pines para generación de licencias", false)
        setDisabledBtns(false)
        setFinProceso(true)});
    }
    
    
  });

  const fetchTrx = useCallback(
    (ev) => {
      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO",
        valor_total_trx: valVentaPines,
        nombre_usuario: pdpUser?.uname ?? "",
        nombre_comercio: roleInfo?.["nombre comercio"] ?? "",
        ticket_init: [
          ["Convenio", datosConvenio?.nombre_convenio],
          ["No. Pin", "pin_desencriptado"],
          ...Object.entries(userReferences).map(([, val], index) => [
            datosConvenio[`referencia_${index + 1}`],
            val,
          ]),
          ["Valor", formatMoney.format(valVentaPines)],
        ].reduce((list, elem, i) => {
          list.push(elem);
          if ((i + 1) % 1 === 0) list.push(["", ""]);
          return list;
        }, []),

        id_trx: inquiryStatus?.id_trx,
        // Datos trx colpatria
        colpatria: {
          codigo_convenio_pdp: datosConvenio?.fk_id_convenio,
          codigo_convenio: datosConvenio?.pk_codigo_convenio,
          codigo_pin: datosConvenio?.codigo_pin,
          ...userReferences,
          location: {
            address: userAddress,
            dane_code: roleInfo?.codigo_dane,
            city: roleInfo?.ciudad.substring(0, 7),
          },
        },
      };
    notifyPending(
      makeSellPin(data),
      {
        render: () => {
          setLoadingSell(true);
          return "Procesando transacción";
        },
      },
      {
        render: ({ data: res }) => {
          setLoadingSell(false);
          const tempTicket = res?.obj?.ticket ?? {};
          const pin_encriptado = res?.obj?.pin_encriptado ?? "";
          const pin_desencriptado = decryptPin(pin_encriptado);
          tempTicket.trxInfo[2][1] = pin_desencriptado;
          const infoPinCrc = {
          pk_id_trx : res?.obj?.id_trx,
          id_comercio : roleInfo?.id_comercio,
          nombre_comercio : roleInfo?.nombre_comercio,
          referencia : pin_desencriptado,
          documento : documento,
          valor_pin : valVentaPines,
          estado : res?.status?"Aprobado":"Declinado"
        }
          registroTrx(infoPinCrc);
          onSubmit();
          setPaymentStatus(tempTicket);
          return "Transacción satisfactoria";
        },
      },
      {
        render: ({ data: error }) => {
          setLoadingSell(false);
          const infoPinCrc = {
            pk_id_trx : inquiryStatus?.id_trx ,//error?.obj?.id_trx,
            id_comercio : roleInfo?.id_comercio,
            nombre_comercio : roleInfo?.nombre_comercio,
            referencia : "",
            documento : documento,
            valor_pin : valVentaPines,
            estado : "Declinado"
          }
          registroTrx(infoPinCrc)
          navigate("/Pines", { replace: true });
          if (error?.cause === "custom") {
            return <p style={{ whiteSpace: "pre-wrap" }}>{error?.message}</p>;
          }
          // console.error(error?.message);
          return "Transacción fallida";
        },
      }
    );
    }
  );

  const onMakePayment = useCallback(
    (ev) => {
      ev.preventDefault();   
      if (valVentaPines <= 0) {
        notifyError("El valor del pin CRC debe ser mayor a cero");
        return;
      }    
      fetchTrx();
    },
    [
      datosConvenio,
      userReferences,
      userAddress,
      valVentaPines,
      inquiryStatus,
      roleInfo,
      pdpUser?.uname,
      navigate,
    ]
  );

  const closeModal = useCallback(async () => {
    if(respPin !== ""){
      navigate(-1);
      setDocumento("");
      setRespPin("");
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
    if (enumParametrosPines.diaFinSemana.includes(dia)) {
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

  const handleClose = useCallback(() => {
    
    if (!paymentStatus) {
      notifyError("Transacción cancelada por el usuario");
    }else{
      navigate("/Pines");
    }
    setInquiryStatus(null)
    setFinProceso(false)
    
  }, [navigate, paymentStatus]);


  const summary = useMemo(() =>     
      {
        console.log("PRUEBA -->",showTramiteAdicional)
      let datos = {}
      if(!showTramiteAdicional){
      datos = {
        // "Número de convenio": datosConvenio.pk_codigo_convenio,
        ...Object.fromEntries(
          Object.entries(userReferences).map(([, val], index) => [
            datosConvenio[`referencia_${index + 1}`],
            val,
          ])
        ),
        "Convenio": datosConvenio.nombre_convenio,
        "Valor Pin CRC":formatMoney.format(valVentaPines),
        "Trámite": tramiteData.descripcion,
        "Valor Trámite": formatMoney.format(tramiteData.valor),
        // "IVA Trámite": formatMoney.format(tramiteData.iva),
        "Valor Pin": formatMoney.format(pinData.valor),
        "IVA Pin": formatMoney.format(pinData.iva),
        "Total": formatMoney.format(pinData.total + tramiteData.total + valVentaPines)}
      }
      else{
      datos = {
        // "Número de convenio": datosConvenio.pk_codigo_convenio,      
        ...Object.fromEntries(
          Object.entries(userReferences).map(([, val], index) => [
            datosConvenio[`referencia_${index + 1}`],
            val,
          ])
        ),
        "Convenio": datosConvenio.nombre_convenio,
        "Valor Pin CRC":formatMoney.format(valVentaPines),
        "Trámite 1": tramiteData.descripcion,
        "Valor Trámite 1": formatMoney.format(tramiteData.valor),
        // "IVA Trámite 1": formatMoney.format(tramiteData.iva),
        "Trámite 2": tramiteData2.descripcion,
        "Valor Trámite 2": formatMoney.format(tramiteData2.valor),
        // "IVA Trámite 2": formatMoney.format(tramiteData2.iva),
        "Valor Pin": formatMoney.format(pinData.valor),
        "IVA Pin": formatMoney.format(pinData.iva),
        "Total": formatMoney.format(pinData.total + tramiteData.total + tramiteData2.total + valVentaPines)
      }        
      }
      console.log("DATOS--->",datos)
      return datos 
    },
    [userReferences, 
    datosConvenio, 
    valVentaPines,
    showTramiteAdicional,
    valVentaPines,
    tramiteData,
    pinData,
    onChangeMoney]
  );
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
          setTramite(7)
          setCategoria("B1")
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
          setTramite(7)
          setCategoria("B1")
        }}
      />
      {/* <Select
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
          setTramite("")
          setCategoria("")
        }}
      /> */}
      {/* {olimpia === "true" ? 
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
      :"" } */}
      <ButtonBar className="lg:col-span-2">
      <Button type="submit" disabled={disabledBtnsContinuar}>
        Continuar
      </Button>
      </ButtonBar>
      </Form>
      {showFormulario? 
      <>    
      {/* <VentaPines 
        homeLocation={homeLocation}
        infoCliente={infoCliente}
        setDocumento={setDocumento} documento={documento}
        setTipoDocumento={setTipoDocumento} tipoDocumento={tipoDocumento}
        setNombre={setNombre} nombre={nombre}
        setApellidos={setApellidos} apellidos={apellidos} 
        setCelular={setCelular} celular={celular}
        setEmail={setEmail} email={email}
        setFechaNacimiento={setFechaNacimiento} fechaNacimiento={fechaNacimiento}
        setGenero={setGenero} genero={genero}
        setEps={setEps} eps={eps}
        setArl={setArl} arl={arl}
        setTiene_vehiculo={setTiene_vehiculo} tiene_vehiculo={tiene_vehiculo}
        setModelo={setModelo} modelo={modelo}
        setVenderVehiculo={setVenderVehiculo} venderVehiculo={venderVehiculo}
        setCreditoVehiculo={setCreditoVehiculo} creditoVehiculo={creditoVehiculo}
        setBanco={setBanco} banco={banco}
        setComprarVehiculo={setComprarVehiculo} comprarVehiculo={comprarVehiculo}
        setVehiculoCompra={setVehiculoCompra} vehiculoCompra={vehiculoCompra}
        setPaymentStatus={setPaymentStatus} paymentStatus={paymentStatus} 
        ></VentaPines> */}
      <Form onSubmit={inquiryStatus ? (ev) => ev.preventDefault() : onSubmitModal} grid>
      <Fieldset legend="Datos cliente" className="lg:col-span-2">
        <Input
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
          id="apellido"
          label="Apellido"
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
        <LocationFormPinVus place="Residencia" location={homeLocation} addressInput="input"/> 
      </Fieldset>
      <Fieldset legend="Pin exámenes médicos  " className="lg:col-span-2">     
        <Select
          className="place-self-stretch"
          id="tramite"
          label="Canal"
          options={ 
            Object.fromEntries([
              ...optionsCanales?.map(({ descripcion, id }) => {
                return [descripcion, id];
              }),
            ]) || { "": "" }
          }
          value={canal}
          required={true}
          onChange={(e) => {
            setCanal(e.target.value);
            console.log(infoCliente)
          }}

        />
        {(datosConvenio.fk_tipo_valor === 1 && canal == 1)? (
          <Input
            id='valor'
            name='valor'
            label='Valor a pagar'
            autoComplete='off'
            type='tel'
            minLength={"5"}
            maxLength={"12"}
            onInput={(ev) => setValVentaPines(onChangeMoney(ev))}
            required
          />
        ) : (
          ""
        )}      
      </Fieldset>
      <Fieldset legend="Datos Trámite" className="lg:col-span-2">
      
        <Select
          className="place-self-stretch"
          id="tipoPin"
          label="Tipo Pin"
          options={                
            Object.fromEntries([      
              ...optionsTipoPines?.map(({ descripcion, id }) => {
                return [descripcion, id];
              }),
            ]) || { "": "" }
          }
          value={tipoPin}
          required={true}          
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

        <Select
          className="place-self-stretch"
          id="categoria"
          label="Categoría de Licencia"
          options={
           tramite==1||tramite==3||tramite==5||tramite==7||tramite==9?  [...(optionsCategoria.slice(0,1)),...(optionsCategoria.slice(3))]:
           tramite==2||tramite==4||tramite==6||tramite==8||tramite==10?  [...(optionsCategoria.slice(0,3))]:
           tramite==""||isNaN(tramite)?  [...(optionsCategoria.slice(0,1))]:""
             }
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
                    options={
                      tramite2==1||tramite2==3||tramite2==5||tramite2==7||tramite2==9?  [...(optionsCategoria.slice(0,1)),...(optionsCategoria.slice(3))]:
                      tramite2==2||tramite2==4||tramite2==6||tramite2==8||tramite2==10?  [...(optionsCategoria.slice(0,3))]:
                      tramite2==""||isNaN(tramite2)?  [...(optionsCategoria.slice(0,1))]:""
                    }
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
      </Fieldset>       
      <ButtonBar className="col-auto md:col-span-2">
        <Button type="submit" disabled={disabledBtns}>
          Consultar
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
      </>
      :
      ""
      }
      <ScreenBlocker show={loadingInquiry} />
      <Modal
        show={inquiryStatus}
        handleClose={loadingSell ? () => {} : handleClose}>
        {finProceso ? (
          <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center'>
            <div ref={printDiv}>
            <TicketColpatria 
              refPrint={null} 
              ticket={paymentStatus} 
            />
            {respPin !== ""? 
            <>
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
            </>:
            ""}
            
            </div>
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={handleClose}>Cerrar</Button>
            </ButtonBar>
          </div>
        ) : (
          <form onSubmit={onMakePayment}>
            
            <PaymentSummary summaryTrx={summary}>
            <ButtonBar>
              <Button type='submit' disabled={loadingSell}>
                Realizar pago
              </Button>
              <Button type='button' onClick={handleClose} disabled={loadingSell}>
                Cancelar
              </Button>
            </ButtonBar>
            </PaymentSummary>
          </form>
        )}
      </Modal>
      {/* <Modal show={showModal} handleClose={() => closeModal()}>
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
            <h1 className="flex flex-row justify-center text-lg font-medium">- {tramiteData.descripcion}</h1>
            { tramiteData2.descripcion ?
              <h1 className="flex flex-row justify-center text-lg font-medium">- {tramiteData2.descripcion}</h1>
            : ""
            }
            
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
              <br></br>
            </>
            <div className="flex flex-col justify-center items-center mx-auto container">
              <Form onSubmit={onSubmit}>
              <Select
                id="metodoPago"
                label="Método de pago"
                required
                options={[
                  { value: 1, label: "Efectivo" },
                  { value: 2, label: "Tarjeta" },
                ]}
                value={metodoPago}
                onChange={(e) => {
                  setMetodoPago(e.target.value);
                  setDisabledBtnsContinuar(false)
                  setCodigoPago("")
                  setCodigoPago2("")
                }}
              />
              { metodoPago === '2' ?
              <>
              <Input
              id="codPago"
              label="Código Aprobación 1"
              type="text"
              autoComplete="off"
              value={codigoPago}
              minLength="1"
              maxLength="20"
              required
              onInput={(e) => {
                if (!isNaN(e.target.value)) {
                  const num = e.target.value;
                  setCodigoPago(num);
                }                
              }}
              />
              <Input
              id="codPagoVerificacion"
              label="Código Aprobación 2"
              type="text"
              autoComplete="off"
              value={codigoPago2}
              minLength="1"
              maxLength="20"
              onInput={(e) => {
                if (!isNaN(e.target.value)) {
                  const num = e.target.value;
                  setCodigoPago2(num);
                }                
              }}
              />
              </>
              :
              ""}
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
      </Modal> */}
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
