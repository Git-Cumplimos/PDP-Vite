import { useState, useCallback, Fragment, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Modal from "../../../../components/Base/Modal";
import Select from "../../../../components/Base/Select";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notify, notifyError, notifyPending } from "../../../../utils/notify";
import { useFetch } from "../../../../hooks/useFetch";
import { fetchCustom, ErrorCustom } from "../../utils/fetchMoviliza";
import { ComponentsModalSummaryTrx } from "./components/components_modal";
import {
  LecturaBarcode,
  LecturaMoviliza,
} from "./components/components_form";
import classes from "./pagarMoviliza.module.css";
import TicketMoviliza from "../../components/TicketsMoviliza/TicketMoviliza";
import { v4 } from "uuid";
import { useFetchMoviliza } from "../../hooks/hookMoviliza";
import {
  makeSellRecaudo,
  searchConveniosRecaudoList,
  makeInquiryRecaudo,
} from "../../utils/fetchFunctions";

//Constantes Style
const { styleComponents } = classes;

//Constantes
const url_get_barcode = `${process.env.REACT_APP_URL_MOVILIZA}/moviliza/codigo_barras`;
const url_consult_moviliza = `${process.env.REACT_APP_URL_MOVILIZA}/moviliza/consultar`;
const url_pagar_moviliza= `${process.env.REACT_APP_URL_MOVILIZA}/moviliza/pagar_tramites`;
const urlreintentos = `${process.env.REACT_APP_URL_MOVILIZA}/moviliza/reintento-moviliza`;
const url_autenticar = `${process.env.REACT_APP_URL_MOVILIZA}/moviliza/autenticar`;
const option_manual = "Manual";
const option_barcode = "Código de barras";
const options_select = [
  { value: option_manual, label: option_manual },
  { value: option_barcode, label: option_barcode }
];

const PagarMoviliza = () => {
  const uniqueId = v4();
  const [paso, setPaso] = useState("LecturaMoviliza");
  const [numeroMoviliza, setNumeroMoviliza] = useState("");
  const [bloqueoInput, setBloqueoInput] = useState(false);
  const [procedimiento, setProcedimiento] = useState(option_manual);
  const [showModal, setShowModal] = useState(false);
  const [resConsultMoviliza, setResConsultMoviliza] = useState({});
  const [infTicket, setInfTicket] = useState(null);
  const printDiv = useRef();
  const buttonDelate = useRef(null);
  const validNavigate = useNavigate();
  const { roleInfo, pdpUser } = useAuth();
  const [loadingPeticionPayMoviliza, peticionPayMoviliza] = useFetchMoviliza(
    url_pagar_moviliza,
    urlreintentos,
    "PagarMoviliza"
  );
  const [loadingPeticionBarcode, peticionBarcode] = useFetch(
    fetchCustom(url_get_barcode, "POST", "Leer código de barras")
  );
  const [loadingPeticionConsultMoviliza, peticionConsultMoviliza] = useFetch(
    fetchCustom(url_consult_moviliza, "POST", "Consultar moviliza")
  );
  const [loadingPeticionJwt, peticionJwt] = useFetch(
    fetchCustom(url_autenticar, "POST", "Obtener token")
  );
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  

  useEffect(() => {
    const data = {
      id_comercio: roleInfo.id_comercio,
      id_terminal: roleInfo.id_dispositivo,
      id_usuario: roleInfo.id_usuario,
      nombre_usuario: pdpUser["uname"]
    };
    peticionJwt({}, data)
    .then((response) => {
      if (response?.status === true) {
        setToken(response?.obj?.object)
      }
    })
    .catch((error) => {
      CallErrorPeticion(error);
    });
  }, []);


  const CallErrorPeticion = useCallback((error) => {
    let msg = "Error respuesta PDP: Pago Moviliza no exitoso";
    if (error instanceof ErrorCustom) {
      switch (error.name) {
        case "ErrorCustomBackend":
          notifyError(error.message);
          break;
        case "msgCustomBackend":
          notifyError(error.message);
          break;
        default:
          if (error.notificacion == null) {
            notifyError(`${msg}: ${error.message}`);
          }
          break;
      }
    } else {
      if (
        error.message ===
        "Error respuesta Front-end PDP: Timeout al consumir el servicio (Moviliza) [0010002]"
      ) {
      } else {
        notifyError(msg);
      }
    }
    setPaso("LecturaMoviliza");
    setNumeroMoviliza("");
    setResConsultMoviliza(null);
    setShowModal(false);
    setProcedimiento(option_manual);
  }, []);

  const onChangeNumeroMoviliza = useCallback((e) => {

      // let num = parseInt(e.target.value) || "";
      let num =e.target.value;
      let number = num.replace(/[\s\.\-+eE]/g, "");
      if (!isNaN(number)) {
        setNumeroMoviliza(number)
      }
      // setNumeroMoviliza(num)

  }, []);

  const onChangeInfoBarCode = useCallback((e) => {
      if (!isNaN(parseInt(e.target.value.slice(-1)))){
        setNumeroMoviliza(e.target.value)
      }
      if ((e.target.value).length==0){
        setNumeroMoviliza("")
      }
   }, []);

  const onChangeSelect = useCallback((e) => {
    if (e.target.value === option_barcode) {
      setPaso("LecturaBarcode");
      setProcedimiento(option_barcode);
    } else if (e.target.value === option_manual) {
      setPaso("LecturaMoviliza");
      setProcedimiento(option_manual);
      setBloqueoInput(false)
    }
    setNumeroMoviliza("");
  }, []);


  const onSubmitBarcode = useCallback(
    (info) => {
      // const data = {
      //   codigo_barras: info,
      // };
      const data = {
        codigo_barras: numeroMoviliza,
      };
      if (numeroMoviliza === "") {
        notifyError(
          "Error respuesta PDP: El campo del código de barras está vacío, por favor scanee o digite el código"
        );
        return;
      }
      peticionBarcode({}, data)
        .then((response) => {
          if (response?.status === true) {
            setNumeroMoviliza(response?.obj?.result?.numero_moviliza);
            notify("Respuesta PDP: "+response?.msg);
            setBloqueoInput(true)
            // setPaso("LecturaMoviliza");
          }
        })
        .catch((error) => {
          // buttonDelate.current.click();
          CallErrorPeticion(error);
        });
    }
    ,
    [peticionBarcode, CallErrorPeticion]
  );

  const resetConsultaBarcode = (e) => {
    e.preventDefault();
    setBloqueoInput(false)
    setNumeroMoviliza("")
 }

  const onSubmitConsultMoviliza = (e) => {
    e.preventDefault();
    const data = {
      id_comercio: roleInfo.id_comercio,
      id_terminal: roleInfo.id_dispositivo,
      id_usuario: roleInfo.id_usuario,
      nombre_usuario: pdpUser["uname"],
      tipoRecaudo: 1,
      idLiquidacion: numeroMoviliza,
      token: token
    };

    // const response= {obj: {result: "quemado"}}
    // setResConsultMoviliza(response?.obj?.result);
    // setPaso("ResumenTrx");
    // setShowModal(true);




      // const data3 = {
      //   comercio: {
      //     id_comercio: roleInfo?.id_comercio,
      //     id_usuario: roleInfo?.id_usuario,
      //     id_terminal: roleInfo?.id_dispositivo,
      //   },
      //   oficina_propia:
      //     roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
      //     roleInfo?.tipo_comercio === "KIOSCO",
      //   valor_total_trx: 1500,
      //   nombre_usuario: pdpUser?.uname ?? "",
      //   nombre_comercio: roleInfo?.["nombre comercio"] ?? "",
      //   // ticket_init: [
      //   //   ["Convenio", datosConvenio?.nombre_convenio],
      //   //   ...Object.entries(userReferences).map(([, val], index) => [
      //   //     datosConvenio[`referencia_${index + 1}`],
      //   //     val,
      //   //   ]),
      //   //   ["Valor", formatMoney.format(valTrxRecaudo)],
      //   // ].reduce((list, elem, i) => {
      //   //   list.push(elem);
      //   //   if ((i + 1) % 1 === 0) list.push(["", ""]);
      //   //   return list;
      //   // }, []),         

      //   id_trx: 223023,//inquiryStatus?.id_trx,
      //   // Datos trx colpatria
      //   colpatria: {
      //     codigo_convenio_pdp: "0004", //datosConvenio?.fk_id_convenio,
      //     codigo_convenio: 2211, //datosConvenio?.pk_codigo_convenio,
      //     //  ...userReferences,
      //     referencia_1 : "123456789",
      //     location: {
      //       address: "roleInfo.address dir usuario",
      //       dane_code: roleInfo?.codigo_dane,
      //       city: roleInfo?.ciudad.substring(0, 7),
      //     },
      //   },
      // };





        // peticionConsultMoviliza({}, data)
        // .then((response) => {
        //   // notify(response.status);
        //   if (response?.status == true) {
        //     if (response?.obj?.object?.estado != "PAGADO"){
        //     setResConsultMoviliza(response?.obj);
        //     setPaso("ResumenTrx");
        //     setShowModal(true);
        //     notify("Consulta realizada");
        //   }
        //   else{
        //     notify("Liquidación se encuentra en estado PAGADO");
        //   }
        // }
        // if (response?.status == false){
        //     notify("Consulta realizada: "+ toString("response.status"));
        //   }
        //   //return response
        // }
        // )
        // .catch((error) => {
        //   CallErrorPeticion(error);
        //   console.log(error.message)
        //   notifyError("Consulta realizada: "+ toString(resConsultMoviliza.mensaje));
        // })

        notifyPending(
          ( peticionConsultMoviliza({}, data)),
        {
          render: () => {
            return "Realizando consulta";
          },
        },
        {
          render: ({data: response}) => {
            // setPaymentStatus(res?.obj?.ticket ?? {});
          if (response?.status === true) {
            if (response?.obj?.object?.estado != "PAGADO"){
            setResConsultMoviliza(response?.obj);
            setPaso("ResumenTrx");
            setShowModal(true);
            return "Respuesta PDP: Consulta realizada";
            }
            else{
              return "Respuesta PDP: Liquidación se encuentra en estado PAGADO";
            }
          }
          else if (response?.status === false){ 
                if (response?.obj?.mensaje != null){
                  if (response?.obj?.mensaje=="Error autenticando adminot "){
                    return "Respuesta PDP: Recargar página";
                  }
                  else{
                    return "Respuesta Moviliza: "+response?.obj?.mensaje
                  }
          }
              else{
                return "Respuesta PDP: Recargar página";
              }
          }
          },
        },
        {
          render: ({ data: error }) => {
            navigate("/moviliza");
            if (error?.cause === "custom") {
              return <p style={{ whiteSpace: "pre-wrap" }}>{error?.message}</p>;
            }
            return "Error respuesta PDP: Error al realizar consulta";
          },
        }
      )
  };

  const onSubmitPayMoviliza = useCallback(
    (e) => {
      const tipo__comercio = roleInfo.tipo_comercio.toLowerCase();
      const data = {
        id_comercio: roleInfo.id_comercio,
        id_terminal: roleInfo.id_dispositivo,
        id_usuario: roleInfo.id_usuario,
        id_uuid_trx: uniqueId,
        oficina_propia:
          tipo__comercio.search("kiosco") >= 0 ||
          tipo__comercio.search("oficinas propias") >= 0
            ? true
            : false,
        nombre_usuario: pdpUser["uname"],
        nombre_comercio: roleInfo?.["nombre comercio"],
        numero_moviliza: numeroMoviliza,
        // valor_total_runt: resConsultMoviliza.object?.totalRUNT,
        // valor_total_mt: resConsultMoviliza.object?.totalMT,
        // valor_total_local: resConsultMoviliza.object?.totalLocal,
        valor_total_trx: resConsultMoviliza.object?.totalLiquidacion,  //valor_total_trx,
        ciudad: roleInfo.ciudad,          
        direccion: roleInfo.direccion,
        telefono: roleInfo?.telefono,
        dane_code: roleInfo?.codigo_dane,
        city: roleInfo?.["ciudad"],
        idLiquidacion: resConsultMoviliza.numero_moviliza,
        medioPago: "PSE",
        // medioPago: {
        //   descripcion: "Ventanilla de efectivo",
        //   id: 1,
        //   requiereAut: "null"
        //   },
        nroAutorizacion: resConsultMoviliza?.["id_trx"],
        id_trx: resConsultMoviliza?.["id_trx"],
        token: token,
        obj_consulta: resConsultMoviliza.object
      };
      const dataAditional = {
        id_uuid_trx: uniqueId,
      };


          //   setInfTicket(voucher);
          //   setPaso("TransaccionExitosa");
          //   notify("Pago Moviliza exitoso");

      peticionPayMoviliza(data, dataAditional)
        .then((response) => {
          if (response?.status === true) {
            const voucher = response?.obj?.result?.ticket
              ? response?.obj?.result?.ticket
              : response?.obj?.ticket
              ? response?.obj?.ticket
              : {};
            setInfTicket(voucher);
            setPaso("TransaccionExitosa");
            notify("Respuesta PDP: Pago Moviliza exitoso");
          } else if (response?.status === false || response === undefined) {
            HandleCloseTrxExitosa();
            notifyError("Error respuesta PDP: Transacción Moviliza no exitosa");
          }
        })
        .catch((error) => {
          CallErrorPeticion(error);
        });

        // const data2 = {
        //   comercio: {
        //     id_comercio: roleInfo?.id_comercio,
        //     id_usuario: roleInfo?.id_usuario,
        //     id_terminal: roleInfo?.id_dispositivo,
        //   },
        //   oficina_propia:
        //     roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
        //     roleInfo?.tipo_comercio === "KIOSCO",
        //   valor_total_trx: resConsultMoviliza.valor_total_trx,
        //   nombre_usuario: pdpUser?.uname ?? "",
  
        //   // Datos trx colpatria
        //   colpatria: {
        //     codigo_convenio_pdp: "0004", //datosConvenio?.fk_id_convenio,
        //     codigo_convenio: 2211, //datosConvenio?.pk_codigo_convenio,
        //     //  ...userReferences,
        //     referencia_1 : "123456789",
        //     location: {
        //       address: "roleInfo.address dir usuario",
        //       dane_code: roleInfo?.codigo_dane,
        //       city: roleInfo?.ciudad.substring(0, 7),
        //     },
        //   },
        // };

        // notifyPending(
        //   makeInquiryRecaudo(data2),
        //   {
        //     render: () => {

        //       return "Procesando consulta";
        //     },
        //   },
        //   {
        //     render: ({ data: res }) => {

        //       // setInquiryStatus(res?.obj);
        //       // setValTrxRecaudo(res?.obj?.valor);
        //       console.log(res)
        //       return "Consulta satisfactoria";
        //     },
        //   },
        //   {
        //     render: ({ data: error }) => {

        //       navigate("/moviliza", { replace: true });
        //       if (error?.cause === "custom") {
        //         return <p style={{ whiteSpace: "pre-wrap" }}>{error?.message}</p>;
        //       }
        //       console.error(error?.message);
        //       return "Consulta fallida";
        //     },
        //   }
        // );
    },
    [
      numeroMoviliza,
      pdpUser,
      roleInfo,
      peticionPayMoviliza,
      resConsultMoviliza,
      CallErrorPeticion,
    ]
  );

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  //********************Funciones para cerrar el Modal**************************
  const HandleCloseTrx = useCallback(() => {
    setPaso("LecturaMoviliza");
    setShowModal(false);
    notifyError("Respuesta PDP: Transacción cancelada");
    setNumeroMoviliza("");
    setResConsultMoviliza(null);
    setProcedimiento(option_manual);
    setBloqueoInput(false)
  }, []);

  const HandleCloseTrxExitosa = useCallback(() => {
    setPaso("LecturaMoviliza");
    setShowModal(false);
    setNumeroMoviliza("");
    setResConsultMoviliza(null);
    setInfTicket(null);
    setProcedimiento(option_manual);
    validNavigate("/moviliza");
  }, [validNavigate]);

  const HandleCloseModal = useCallback(() => {
    if (paso === "LecturaBarcode" && !loadingPeticionBarcode) {
      HandleCloseTrx();
    } else if (paso === "LecturaMoviliza" && !loadingPeticionConsultMoviliza) {
      HandleCloseTrx();
    } else if (paso === "ResumenTrx" && !loadingPeticionPayMoviliza) {
      HandleCloseTrx();
    } else if (paso === "TransaccionExitosa") {
      HandleCloseTrxExitosa();
    }
  }, [
    paso,
    HandleCloseTrx,
    HandleCloseTrxExitosa,
    loadingPeticionBarcode,
    loadingPeticionPayMoviliza,
    loadingPeticionConsultMoviliza,
  ]);

  return (
    <Fragment>
      <h1 className='text-3xl mt-6'>Pagos Moviliza</h1>
      <Form>
       <div className={styleComponents}>
          <Select
            id='opciones'
            label='Tipo de captura'
            options={options_select}
            onChange={onChangeSelect}
            value={procedimiento}
            disabled={
              loadingPeticionBarcode || loadingPeticionConsultMoviliza
                ? true
                : false
            }
            // defaultValue = {options_select[1]}
          />
        </div>

        {/******************************Respuesta Lectura runt*******************************************************/}
        {paso === "LecturaMoviliza" && (
          <LecturaMoviliza
            loadingPeticion={loadingPeticionConsultMoviliza}
            onSubmit={onSubmitConsultMoviliza}
            handleClose={HandleCloseTrx}
            onChange={onChangeNumeroMoviliza}
            procedimiento={procedimiento}
            option_barcode={option_barcode}
            option_manual={option_manual}
            numeroMoviliza={numeroMoviliza}
            token={token}></LecturaMoviliza>
        )}
        {/******************************Respuesta Lectura runt*******************************************************/}

        {/******************************Lectura runt*******************************************************/}
        {/* {paso === "LecturaBarcode" && (
          <LecturaBarcode
            loadingPeticion={loadingPeticionBarcode}
            onSubmit={onSubmitBarcode}
            buttonDelate={buttonDelate}></LecturaBarcode>
        )} */}

          {paso === "LecturaBarcode" && (
          <LecturaBarcode
            loadingPeticion={loadingPeticionBarcode}
            // onSubmit={onSubmitBarcode}
            // handleClose={HandleCloseTrx}
            // onChange={onChangeInfoBarCode}
            onSubmit={onSubmitConsultMoviliza}
            handleClose={HandleCloseTrx}
            onChange={onChangeInfoBarCode}
            procedimiento={procedimiento}
            option_barcode={option_barcode}
            option_manual={option_manual}
            numeroMoviliza={numeroMoviliza}
            onSubmitBarcode={onSubmitBarcode}
            bloqueoInput={bloqueoInput}
            resetConsultaBarcode={resetConsultaBarcode}
            token={token}
          ></LecturaBarcode>
        )}

        {/******************************Lectura runt*******************************************************/}

      </Form>

      <Modal show={showModal} handleClose={HandleCloseModal}>
        {/******************************Resumen de trx*******************************************************/}
        {paso === "ResumenTrx" && (
          <ComponentsModalSummaryTrx
            summary={resConsultMoviliza}
            loadingPeticion={loadingPeticionPayMoviliza}
            peticion={onSubmitPayMoviliza}
            handleClose={HandleCloseTrx}></ComponentsModalSummaryTrx>
        )}
        {/******************************Resumen de trx*******************************************************/}

        {/**************** TransaccionExitosa **********************/}
        {infTicket && paso === "TransaccionExitosa" && (
          <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center'>
            <TicketMoviliza refPrint={printDiv} ticket={infTicket} />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={HandleCloseTrxExitosa}>Cerrar</Button>
            </ButtonBar>
          </div>
        )}
        {/*************** Recarga Exitosa **********************/}
      </Modal>
    </Fragment>
  );
};

export default PagarMoviliza;
