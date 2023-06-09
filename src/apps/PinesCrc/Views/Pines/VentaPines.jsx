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
  searchConveniosPinesList,
  makeInquiryPin,
} from "../../utils/fetchFunctions";

import { notifyError, notifyPending } from "../../../../utils/notify";
import {
  makeMoneyFormatter,
  onChangeNumber,
} from "../../../../utils/functions";
import fetchData from "../../../../utils/fetchData";
import ScreenBlocker from "../../components/ScreenBlocker";
import TicketColpatria from "../../components/TicketColpatria";
import { decryptPin } from "../../utils/functions";
import Select from "../../../../components/Base/Select/Select";
import { usePinesVus } from "../../../PinesVus/utils/pinesVusHooks" 
import Fieldset from "../../../../components/Base/Fieldset";
import SimpleLoading from "../../../../components/Base/SimpleLoading/SimpleLoading";

const formatMoney = makeMoneyFormatter(2);

const VentaPines = () => {
  const navigate = useNavigate();

  const { id_convenio_pin } = useParams();

  const { roleInfo, pdpUser } = useAuth();

  const [searchingConvData, setSearchingConvData] = useState(false);
  const [idConvenioPin, setIdConvenioPin ] = useState("108928");
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
      // "Valor": formatMoney.format(valVentaPines),
      // "Valor de la comision": formatMoney.format(valorComision),
      // "Valor total": formatMoney.format(valor + valorComision),
    }),
    [userReferences, datosConvenio, valVentaPines, onChangeMoney]
  );

  const handleClose = useCallback(() => {
    if (!paymentStatus) {
      notifyError("Transacción cancelada por el usuario");
    }
    navigate("/Pines/PinesCrc");
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
            navigate("/Pines/PinesCrc", { replace: true });
            if (error?.cause === "custom") {
              return <p style={{ whiteSpace: "pre-wrap" }}>{error?.message}</p>;
            }
            console.error(error?.message);
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

  const onMakePayment = useCallback(
    (ev) => {
      ev.preventDefault();
      if (valVentaPines <= 0) {
        notifyError("El valor del pin debe ser mayor a cero");
        return;
      }
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
            setPaymentStatus(tempTicket);
            return "Transacción satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            setLoadingSell(false);
            navigate("/Pines/PinesCrc", { replace: true });
            if (error?.cause === "custom") {
              return <p style={{ whiteSpace: "pre-wrap" }}>{error?.message}</p>;
            }
            console.error(error?.message);
            return "Transacción fallida";
          },
        }
      );
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
        console.error(err);
        notifyError("Error consultando parametros de la transacción");
      });
  }, []);

  // useEffect(() => {
  //   setSearchingConvData(true);
  //   searchConveniosPinesList({
  //     // pk_codigo_convenio: id_convenio_pin,
  //     pk_codigo_convenio: idConvenioPin,
  //   })
  //     .then((res) => {
  //       setSearchingConvData(false);
  //       const received = res?.obj?.[0] ?? null;
  //       setDatosConvenio(received);
  //       if (received) {
  //         setUserReferences(
  //           Object.fromEntries(
  //             [1, 2, 3, 4, 5]
  //               .filter((ref) => received[`referencia_${ref}`])
  //               .map((ref) => [`referencia_${ref}`, ""])
  //           )
  //         );
  //       }
  //     })
  //     .catch((error) => {
  //       setSearchingConvData(false);
  //       if (error?.cause === "custom") {
  //         notifyError(error?.message);
  //         return;
  //       }
  //       console.error(error?.message);
  //       notifyError("Busqueda fallida");
  //     });
  // }, [
  //  // id_convenio_pin
  //  idConvenioPin,
  //  canal
  // ]);

  /**
   * Check if has commerce data
   */

  const homeLocation = {
    municipio: useState(""),
    departamento: useState(""),
    localidad: useState(""),
    barrio: useState(""),
    direccion: useState(""),
    foundMunicipios: useState([]),
  };

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
    "fk_id_convenio": 23,//2041, 
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
    "fk_id_convenio": 23,//2041, 
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

const nuevoCelular = useMemo(() => {
  if(showFormulario==true){
setUserReferences((old) => ({
  ...old,
  ["referencia_2"]: String(celular),
}))}
},
[celular]
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

      <h1 className='text-3xl mt-6 mb-10'>Pines CRC</h1>
        <Form onSubmit={onSubmitCliente} grid>
      <Select
        id="tipoDocumento"
        label="Tipo de documento"
        options={optionsDocumento}
        value={tipoDocumento}
        onChange={(e) => {
          const num = parseInt(e.target.value) || "";
          setTipoDocumento(num);
          setShowFormulario(false)
          setShowFormulario2(false)
          setNombre("")
          setApellidos("")
          setCelular("")
          setEmail("")
          setDireccion("")
        }}
        required
      />  
      <Input
        id="documento"
        label="Documento"
        type="text"
        required
        minLength="5"
        maxLength="15"
        autoComplete="off"
        value={documento}
        onInput={(e) => {
          const num = parseInt(e.target.value) || "";
          setDocumento(num);
          setUserReferences((old) => ({
            ...old,
            ["referencia_1"]: onChangeNumber(e),
          }))
          setShowFormulario(false)
          setShowFormulario2(false)
          setNombre("")
          setApellidos("")
          setCelular("")
          setEmail("")
          setDireccion("")
        }}
        readOnly={inquiryStatus}
        // onLazyInput={{
        //   callback: tipoDocumento!=""? onSubmitCliente:false,
        //   timeOut: 1000,
        // }
        // }
      />

            <ButtonBar className="lg:col-span-2">
      <Button type="submit"
      //  disabled={disabledBtnsContinuar}
       >
        Continuar
      </Button>
      </ButtonBar>
      </Form>
        {showFormulario2?
      <Fieldset >
      <Form
        onSubmit={inquiryStatus ? (ev) => ev.preventDefault() : onMakeInquiry}
        grid>

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
          }}

        />

        <Input
          label='Número de convenio pin'
          type='text'
          autoComplete='off'
          value={datosConvenio.pk_codigo_convenio}
          disabled
        />
        <Input
          label='Número de pin'
          type='text'
          autoComplete='off'
          value={datosConvenio.codigo_pin}
          disabled
        />
        <Input
          label='Nombre de convenio pin'
          type='text'
          autoComplete='off'
          value={datosConvenio.nombre_convenio}
          disabled
        />
        {/* {[1, 2, 3, 4, 5]
          .filter((ref) => datosConvenio[`referencia_${ref}`])
          .map((ref) => (
            <Input
              key={ref}
              id={`referencia_${ref}`}
              label={datosConvenio[`referencia_${ref}`]}
              name={`referencia_${ref}`}
              type='text'
              autoComplete='off'
              maxLength='19'
              value={userReferences?.[`referencia_${ref}`] ?? ""}
              onInput={(ev) =>
                setUserReferences((old) => ({
                  ...old,
                  [ev.target.name]: onChangeNumber(ev),
                }))
              }
              readOnly={inquiryStatus}
              required
            />
          ))} */}

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
          setUserReferences((old) => ({
            ...old,
            ["referencia_2"]: onChangeNumber(e),
          }))
          }}
          readOnly={inquiryStatus}
        />

          <Input
          id="nombres"
          label="Nombres"
          type="text"
          minLength="1"
          maxLength="40"
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
          maxLength="40"
          required
          autoComplete="off"
          value={apellidos}
          onInput={(e) => {
            const text = e.target.value.toUpperCase()
            setApellidos(text);
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
          <Input
          id="direccion"
          label="Dirección"
          type="text"
          minLength="1"
          maxLength="30"
          required
          autoComplete="off"
          pattern= "[A-Z 0-9 # -]{1,40}"
          title="Formato de dirección ( # , - )"
          value={direccion}
          onInput={(e) => {
            const text = e.target.value.toUpperCase()
            setDireccion(text);
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
      </Form>
      </Fieldset>:showFormulario?      <Fieldset >
      <Form
        onSubmit={inquiryStatus ? (ev) => ev.preventDefault() : onMakeInquiry}
        grid>

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
          }}

        />

        <Input
          label='Número de convenio pin'
          type='text'
          autoComplete='off'
          value={datosConvenio.pk_codigo_convenio}
          disabled
        />
        <Input
          label='Número de pin'
          type='text'
          autoComplete='off'
          value={datosConvenio.codigo_pin}
          disabled
        />
        <Input
          label='Nombre de convenio pin'
          type='text'
          autoComplete='off'
          value={datosConvenio.nombre_convenio}
          disabled
        />
        {/* {[1, 2, 3, 4, 5]
          .filter((ref) => datosConvenio[`referencia_${ref}`])
          .map((ref) => (
            <Input
              key={ref}
              id={`referencia_${ref}`}
              label={datosConvenio[`referencia_${ref}`]}
              name={`referencia_${ref}`}
              type='text'
              autoComplete='off'
              maxLength='19'
              value={userReferences?.[`referencia_${ref}`] ?? ""}
              onInput={(ev) =>
                setUserReferences((old) => ({
                  ...old,
                  [ev.target.name]: onChangeNumber(ev),
                }))
              }
              readOnly={inquiryStatus}
              required
            />
          ))} */}

          <Input
          label="Celular"
          type='text'
          autoComplete='off'
          value={celular}
          disabled
          onInput={(e) => {

          }}
        />
          <Input
          label="Nombres"
          type="text"
          autoComplete="off"
          value={nombre}
          disabled
        />
        <Input
          label="Apellidos"
          type="text"
          autoComplete="off"
          value={apellidos}
          disabled
        />
        <Input
          label="Email"
          type="email"
          autoComplete="off"
          value={email}
          disabled
        />
          <Input
          label="Dirección"
          type="text"
          autoComplete="off"
          value={direccion}
          disabled
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
      </Form>
      </Fieldset> :""}
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
                <Button onClick={handleClose} disabled={loadingSell}>
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
