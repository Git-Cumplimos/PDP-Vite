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
import Tickets from "../../../components/Base/Tickets";
import { useReactToPrint } from "react-to-print";
import Select from "../../../components/Base/Select";
import { useNavigate } from "react-router-dom";
import Fieldset from "../../../components/Base/Fieldset";
import LocationForm from "../../../components/Compound/LocationForm";
import { enumParametrosPines } from "../utils/enumParametrosPines";

const dateFormatter = Intl.DateTimeFormat("az", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
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

  const { crearPinVus, con_estado_tipoPin, consultaTramite, consultaClientes } = usePinesVus();
  const { infoTicket } = useAuth();

  const { roleInfo } = useAuth();
  const [showFormulario, setShowFormulario] = useState(false)
  const [documento, setDocumento] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [disabledBtns, setDisabledBtns] = useState(false);
  const [respPin, setRespPin] = useState("");
  const [optionsTipoPines, setOptionsTipoPines] = useState([]);
  const [tipoPin, setTipoPin] = useState("");
  const [optionsTramites, setOptionsTramites] = useState([]);
  const [tramite, setTramite] = useState("")

  const [nombre, setNombre] = useState("")
  const [apellidos, setApellidos] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [celular, setCelular] = useState("")
  const [email, setEmail] = useState("")
  const [eps, setEps] = useState("")
  const [arl, setArl] = useState("")
  const [idPin, setIdPin] = useState("")

  const [olimpia, setOlimpia] = useState("")

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
  // const myDate = new Date();  
  // const year = myDate.getFullYear();
  // for(var i = 1900; i < year+1; i++){
    
  // }

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
        setDisabledBtns(false);
        if (!res?.status) {
          notifyError(res?.msg);
        } else {
          setOptionsTramites(res?.obj?.results);
        }
      })
      .catch(() => setDisabledBtns(false));
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
    if(!isNaN(infoCliente?.municipio)){
    e.preventDefault();
    setShowModal(true)
    }
    else{
      notifyError("Agregue municipio y departamento de residencia")
    }
  };

  const onSubmitCliente = (e) => {
    e.preventDefault();
    setDisabledBtns(true);
    setShowFormulario(false)
    consultaClientes(documento,olimpia,idPin).then((resp) => {
      if (resp?.obj?.results?.length > 0) {
        const fecha_nacimiento = new Date(resp?.obj?.results?.[0]?.fecha_nacimiento);
        fecha_nacimiento.setHours(fecha_nacimiento.getHours() + 5);
        setNombre(resp?.obj?.results?.[0]?.nombre)
        setApellidos(resp?.obj?.results?.[0]?.apellidos)
        setFechaNacimiento(dateFormatter.format(fecha_nacimiento))
        setGenero(resp?.obj?.results?.[0]?.genero)
        setCelular(resp?.obj?.results?.[0]?.celular)
        setEmail(resp?.obj?.results?.[0]?.email)
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
        homeLocation?.direccion?.[1](resp?.obj?.results?.[0]?.home_location?.direccion?.[0])
        homeLocation?.barrio?.[1](resp?.obj?.results?.[0]?.home_location?.barrio?.[0])
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
        homeLocation?.municipio?.[1]("")
        homeLocation?.departamento?.[1]("")
        homeLocation?.direccion?.[1]("")
        homeLocation?.barrio?.[1]("")
        homeLocation?.localidad?.[1]("")
        homeLocation?.foundMunicipios?.[1]("")
      }
    }
    setShowFormulario(true)
    setDisabledBtns(false);
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setDisabledBtns(true);
    crearPinVus(documento, tipoPin, tramite,user, tramiteData, infoCliente, olimpia, categoria, idPin)
      .then((res) => {
        setDisabledBtns(false);
        if (!res?.status) {
          notifyError(res?.msg);
        } else {
          setRespPin(res?.obj);
          setShowModal(true);
          setDisabledBtns(false);
          setShowModal(true);
        }
      })
      .catch(() => setDisabledBtns(false));
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
    
    
  }, [respPin]);

  const tickets = useMemo(() => {
    return {
      title: "Recibo de pago: " + tramiteData?.descripcion,
      timeInfo: {
        "Fecha de pago": Intl.DateTimeFormat("es-CO", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }).format(new Date()),
        Hora: Intl.DateTimeFormat("es-CO", {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
        }).format(new Date()),
      },
      commerceInfo: Object.entries({
        "Id Comercio": roleInfo?.id_comercio,
        "No. terminal": roleInfo?.id_dispositivo,
        Municipio: roleInfo?.ciudad,
        Dirección: roleInfo?.direccion,
        "Id Trx": respPin?.transacciones_id_trx?.creacion,
      }),
      commerceName: pinData.descripcion,
      trxInfo: [
        ["Proceso", "Creación de Pin"],
        ["Código", respPin?.cod_hash_pin],
        ["Vence", respPin?.fecha_vencimiento],
        ["Valor Trámite", formatMoney.format(tramiteData?.valor)],
        ["IVA Trámite",formatMoney.format(tramiteData?.iva)],
        ["Valor Pin", formatMoney.format(respPin?.valor)],
        ["IVA Pin",formatMoney.format(respPin?.valor_iva)],
        ["Total", formatMoney.format(respPin?.valor_total)],
      ],
      disclamer:
        "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
    };
  }, [roleInfo, respPin, pinData, tramiteData]);

  useEffect(() => {
    infoTicket(
      respPin?.transacciones_id_trx?.creacion,
      respPin?.tipo_trx,
      tickets
    );
  }, [infoTicket, respPin, tickets]);
  
  const hora = useMemo(() => {    
    return Intl.DateTimeFormat("es-CO", {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(new Date())
  }, [venderVehiculo,tipoPin]);

  useEffect(() => {
    const horaCierre = enumParametrosPines.horaCierre.split(":")
    const horaActual = hora.split(":")
    const deltaHora = parseInt(horaCierre[0])-parseInt(horaActual[0])
    const deltaMinutos = parseInt(horaCierre[1])-parseInt(horaActual[1])
    if (deltaHora<0 || (deltaHora===0 & deltaMinutos<1) ){
      notifyError("Módulo cerrado a partir de las " + enumParametrosPines.horaCierre)
      navigate("/PinesVus",{replace:true});
    }
    else if ((deltaHora ===1 & deltaMinutos<-50)){
      notifyError("El módulo se cerrara en " + String(parseInt(deltaMinutos)+60) + " minutos, por favor evite realizar mas transacciones")  
    }
    else if ((deltaHora ===0 & deltaMinutos<10)){
      notifyError("El módulo se cerrara en " + deltaMinutos + " minutos, por favor evite realizar mas transacciones") 
    }

  }, [venderVehiculo,tipoPin, hora, navigate])

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
      <Button type="submit" disabled={disabledBtns}>
        Continuar
      </Button>
      </ButtonBar>
      </Form>
      {showFormulario? 
      <Form onSubmit={onSubmitModal} grid>
      <Fieldset legend="Datos cliente" className="lg:col-span-2">
        <Select
          id="tipoDocumento"
          label="Tipo de documento"
          options={optionsDocumento}
          value={tipoDocumento}
          onChange={(e) => {
            setTipoDocumento(e.target.value);
          }}
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
        />
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
            setNombre(e.target.value);
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
            setApellidos(e.target.value);
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
          requiered
          value={genero}
          onChange={(e) => {
            setGenero(e.target.value);
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
            console.log(e.target.value?.length)
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
            setEmail(e.target.value);
          }}
        />
        <Input
          id="eps"
          label="Eps"
          type="text"
          minLength="1"
          maxLength="30"
          required
          autoComplete="off"
          value={eps}
          onInput={(e) => {
            setEps(e.target.value);
          }}
        />
        <Input
          id="arl"
          label="Arl"
          type="text"
          minLength="1"
          maxLength="30"
          required
          autoComplete="off"
          value={arl}
          onInput={(e) => {
            setArl(e.target.value);
          }}
        />
        <LocationForm place="Residencia" location={homeLocation} addressInput="input"/>
      </Fieldset>
      <Fieldset legend="Datos Vehículo" className="lg:col-span-2">
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
      </Fieldset>     
      <Fieldset legend="Datos Trámite" className="lg:col-span-2">
        <Select
          className="place-self-stretch"
          id="tipoPin"
          label="Tipo Pin"
          options={
            Object.fromEntries([
              ["", ""],
              ...optionsTipoPines?.map(({ descripcion, id }) => {
                return [descripcion, id];
              }),
            ]) || { "": "" }
          }
          value={tipoPin}
          required={true}
          onChange={(e) => {
            setTipoPin(parseInt(e.target.value) ?? "");
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
                return [descripcion, id];
              }),
            ]) || { "": "" }
          }
          value={tramite}
          required={true}
          onChange={(e) => {
            setTramite(parseInt(e.target.value) ?? "");
          }}
        />
        <Select
          className="place-self-stretch"
          id="categoria"
          label="Categoría de Licencia"
          options={optionsCategoria}
          required={true}
          value={categoria}
          onChange={(e) => {
            setCategoria(e.target.value);
          }}
          />
      </Fieldset>       
      <ButtonBar className="col-auto md:col-span-2">
        <Button type="submit" disabled={disabledBtns}>
          Crear pin
        </Button>
      </ButtonBar>
      </Form>
      :
      ""
      }      

      <Modal show={showModal} handleClose={() => closeModal()}>
        {respPin !== ""? 
        <div className="flex flex-col justify-center items-center">
          <Tickets refPrint={printDiv} ticket={tickets} />
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
            <h1 className="flex flex-row justify-center text-lg font-medium">{tramiteData.descripcion}</h1>
            <br></br>
            <>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Valor Trámite</h1>
                <h1>{formatMoney.format(tramiteData.valor)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>IVA Trámite</h1>
                <h1>{formatMoney.format(tramiteData.iva)}</h1>
              </div>
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
                <h1>{formatMoney.format(pinData.total + tramiteData.total)}</h1>
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
    </>) : (
      <h1 className="text-3xl mt-6">El usuario no tiene comercio asociado</h1>
    )}
    </>
  );
};
export default CrearPin;
