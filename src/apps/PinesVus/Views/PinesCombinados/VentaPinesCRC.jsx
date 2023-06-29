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

import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import { useAuth } from "../../../../hooks/AuthHooks";
import useMoney from "../../../../hooks/useMoney";

import {
  makeSellPin,
  makeInquiryPin,
} from "../../../PinesCrc/utils/fetchFunctions";

import { notifyError, notifyPending } from "../../../../utils/notify";
import {
  makeMoneyFormatter,
  onChangeNumber,
} from "../../../../utils/functions";
import fetchData from "../../../../utils/fetchData";
import ScreenBlocker from "../../../PinesCrc/components/ScreenBlocker";
import TicketColpatria from "../../../PinesCrc/components/TicketColpatria/TicketColpatria";
import { decryptPin } from "../../../PinesCrc/utils/functions";
import Select from "../../../../components/Base/Select/Select";
import { usePinesVus } from "../../../PinesVus/utils/pinesVusHooks" 
import Fieldset from "../../../../components/Base/Fieldset";
import SimpleLoading from "../../../../components/Base/SimpleLoading/SimpleLoading";
import { guardarCliente } from "../../../PinesCrc/utils/fetchGuardarCliente";
import { registroTrx } from "../../../PinesCrc/utils/fetchRegistrarTrx";
import LocationFormPinVus from "../../components/LocationForm/LocationFormPinesVus"

const formatMoney = makeMoneyFormatter(2);

const VentaPines = ({
  infoCliente,
  homeLocation,
  setDocumento, documento,
  setTipoDocumento, tipoDocumento,
  setNombre, nombre,
  setApellidos, apellidos, 
  setCelular, celular,
  setEmail, email,
  setFechaNacimiento, fechaNacimiento,
  setGenero, genero,
  setEps, eps,
  setArl, arl,
  setTiene_vehiculo, tiene_vehiculo,
  setModelo, modelo,
  setVenderVehiculo, venderVehiculo,
  setCreditoVehiculo, creditoVehiculo,
  setBanco, banco,
  setComprarVehiculo, comprarVehiculo,
  setVehiculoCompra, vehiculoCompra,
}) => {
  const navigate = useNavigate();

  const { id_convenio_pin } = useParams();

  const { roleInfo, pdpUser } = useAuth();

  const [searchingConvData, setSearchingConvData] = useState(false);
  const [idConvenioPin, setIdConvenioPin ] = useState("108928");
  const [datosConvenio, setDatosConvenio] = useState("");
  const [canal, setCanal ] = useState("1");
  const [direccion, setDireccion] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  const [showFormulario, setShowFormulario] = useState(false)
  const [showFormulario2, setShowFormulario2] = useState(false)

  const userReferences = useMemo(() => {
  return {
    referencia_1: String(documento), 
    referencia_2: String(celular)};
  },[documento, celular])

  const [userAddress /* , setUserAddress */] = useState(
    roleInfo?.direccion ?? ""
  );
  const [valVentaPines, setValVentaPines] = useState(0);

  const [limitesMontos, setLimitesMontos] = useState({
    max: 9999999,
    min: 50000,
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
  const { consultaClientes} = usePinesVus();

  infoCliente = useMemo(() => {
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

  const summary = useMemo(
    () => ({
      "Número de convenio": datosConvenio.pk_codigo_convenio,
      "Convenio": datosConvenio.nombre_convenio, 
      ...Object.fromEntries(
        Object.entries(userReferences).map(([, val], index) => [
          datosConvenio[`referencia_${index + 1}`],
          val,
        ])
      ),
      Valor:
        datosConvenio?.fk_tipo_valor !== 3 ? (
          formatMoney.format(valVentaPines)
        ) : (
          <Input
            id='valor'
            name='valor'
            // label="Valor a pagar"
            autoComplete='off'
            type='tel'
            minLength={"5"}
            maxLength={"10"}
            value={formatMoney.format(valVentaPines)}
            onInput={(ev) => setValVentaPines(onChangeMoney(ev))}
            required
          />
        ),
    }),
    [userReferences, datosConvenio, valVentaPines, onChangeMoney]
  );

  const handleClose = useCallback(() => {
    if (!paymentStatus) {
      notifyError("Transacción cancelada por el usuario");
    }
    setInquiryStatus(null)
    // navigate("/Pines");
  }, [navigate, paymentStatus]);

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
            navigate("/Pines", { replace: true });
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
        registroTrx(infoPinCrc)
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
        notifyError("El valor del pin debe ser mayor a cero");
        return;
      }
    if(showFormulario2){ 
          notifyPending(
            guardarCliente(infoCliente),
            {
              render: () => {
                setLoadingSell(true);
                return "Procesando transacción";
              },
            },
            {
              render: ({ infoCliente: res }) => {
                setLoadingSell(false);
                fetchTrx();
                 return "Datos del cliente guardados satisfactoriamente";
              },
            },
            {
              render: ({ infoCliente: error }) => {
                setLoadingSell(false);
                // navigate("/Pines", { replace: true });
                if (error?.cause === "custom") {
                  return <p style={{ whiteSpace: "pre-wrap" }}>{error?.message}</p>;
                }
                // console.error(error?.message);
                return "Error guardando datos de cliente";
              },
            }
          );
    }else{
      fetchTrx();
      } 
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

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_URL_TRXS_TRX}/tipos-operaciones`,
      "GET",
      { tipo_op: 73 }
    )
      .then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        const _parametros = res?.obj?.[0]?.Parametros;
        setLimitesMontos({
          max: parseFloat(_parametros?.monto_maximo),
          min: parseFloat(_parametros?.monto_minimo),
        });

        // setRevalTrxParams({
        //   idcliente: parseFloat(_parametros?.idcliente) ?? 0,
        //   idpersona: parseFloat(_parametros?.idpersona) ?? 0,
        //   NoidentificacionCajero: _parametros?.NoidentificacionCajero ?? "",
        // });
      })
      .catch((err) => {
        // console.error(err);
        notifyError("Error consultando parametros de la transacción");
      });
  }, []);

  /**
   * Check if has commerce data
   */


  const onSubmitCliente = (e) => {
    e.preventDefault();
    setIsLoading(true)
    // setDisabledBtnsContinuar(true);
    // setShowFormulario(false)
    
 consultaClientes(documento,"",tipoDocumento,roleInfo.id_comercio,"").then((resp) => {
      if (!resp?.status){
        setIsLoading(false)
        notifyError(resp?.msg)
        setShowFormulario(false)
        setShowFormulario2(true)
      }else{
        setIsLoading(false)
        setShowFormulario(true)
        setShowFormulario(true)
        setShowFormulario2(false)
      // setPedirFirma(!resp?.obj?.firma)
      // setShowFormulario(true)    
      if (resp?.obj?.results?.length > 0) {
        // const fecha_nacimiento = new Date(resp?.obj?.results?.[0]?.fecha_nacimiento);
        // fecha_nacimiento.setHours(fecha_nacimiento.getHours() + 5);
        setNombre(resp?.obj?.results?.[0]?.nombre?.toUpperCase())
        setApellidos(resp?.obj?.results?.[0]?.apellidos?.toUpperCase())
        // setFechaNacimiento(dateFormatter.format(fecha_nacimiento))
        // setGenero(resp?.obj?.results?.[0]?.genero)
        setCelular(resp?.obj?.results?.[0]?.celular)
        setEmail(resp?.obj?.results?.[0]?.email?.toUpperCase())
        setDireccion(resp?.obj?.results?.[0]?.home_location?.direccion?.[0]?.toUpperCase())
        setShowFormulario(true)
        setShowFormulario2(false)
        // setEps(resp?.obj?.results?.[0]?.eps)
        // setArl(resp?.obj?.results?.[0]?.arl)
        // setTiene_vehiculo(resp?.obj?.results?.[0]?.info_vehiculo?.vehiculo)
        // setModelo(resp?.obj?.results?.[0]?.info_vehiculo?.modelo)
        // setVenderVehiculo(resp?.obj?.results?.[0]?.info_vehiculo?.esta_vendiendo)
        // setCreditoVehiculo(resp?.obj?.results?.[0]?.info_vehiculo?.sigue_pagando_vehiculo)
        // setBanco(resp?.obj?.results?.[0]?.info_vehiculo?.banco)
        // setComprarVehiculo(resp?.obj?.results?.[0]?.interes_compra_vehiculo !== "" ? "true" : "false")
        // setVehiculoCompra(resp?.obj?.results?.[0]?.interes_compra_vehiculo)
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
          setDireccion((homeLocation["direccion"][0])!=""? homeLocation["direccion"][0] : "" )
        }
      }
      else{
        setNombre("")
        setApellidos("")
        // setFechaNacimiento("")
        // setGenero("")
        setCelular("")
        setEmail("")
        setDireccion("")
        setShowFormulario(false)
        setShowFormulario2(true)
        // setEps("")
        // setArl("")
        // setTiene_vehiculo("")
        // setModelo("")
        // setVenderVehiculo("")
        // setCreditoVehiculo("")
        // setBanco("")
        // setComprarVehiculo("")
        // setVehiculoCompra("")
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




  const optionsDocumento = [
    { value: "1", label: "Cédula Ciudadanía" },
    { value: "2", label: "Cédula Extranjería" },
    { value: "3", label: "Tarjeta Identidad" },
    { value: "4", label: "NIT" },
    { value: "5", label: "Pasaporte" },
    { value: "13", label: "PPT (Permiso por Protección Temporal)" },
  ];

  const datosConveni = useMemo(() => {
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

const datosConven = useMemo(() => {
    setDatosConvenio(datosConveni)
},
[datosConveni]
);

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

  const  optionsCanales = [
    {"descripcion": "Olimpia",
    "id":1},
    {"descripcion": "Paynet(Indra)" ,
    "id":2}
  ]

  if (searchingConvData || !(searchingConvData || datosConvenio)) {
    return (
      <Fragment>
        <h1 className='text-3xl mt-6'>Pines CRC</h1>
        <h1 className='text-xl mt-6'>
          {searchingConvData
            ? "Buscando infomacion de convenio ..."
            : "No se ha encontrado informacion del convenio"}
        </h1>
      </Fragment>
    );
  }

  return (
    <Fragment>
       
      <SimpleLoading show={isLoading}></SimpleLoading>

      {/* <h1 className='text-3xl mt-6 mb-10'>Pines CRC</h1> */}
      <Form
        onSubmit={inquiryStatus ? (ev) => ev.preventDefault() : onMakeInquiry}
        grid>
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
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"} disabled={loadingInquiry}>
            Realizar {!inquiryStatus ? "consulta" : "venta de pin"}
          </Button>
        </ButtonBar>
      
      </Fieldset>
      </Form>
      <ScreenBlocker show={loadingInquiry} />
      <Modal
        show={inquiryStatus}
        handleClose={loadingSell ? () => {} : handleClose}>
        {paymentStatus ? (
          <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center'>
            <TicketColpatria refPrint={printDiv} ticket={paymentStatus} />
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
    </Fragment>
  );
};

export default VentaPines;
