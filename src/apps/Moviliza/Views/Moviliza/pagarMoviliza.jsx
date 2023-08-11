import { useState, useCallback, Fragment, useRef } from "react";
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
import TicketColpatria from "../../components/TicketsBancoColpatria/TicketColpatria";
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
  const navigate = useNavigate();

  const CallErrorPeticion = useCallback((error) => {
    let msg = "Pago Moviliza no exitoso";
    if (error instanceof ErrorCustom) {
      switch (error.name) {
        case "ErrorCustomBackend":
          notifyError(error.message);
          break;
        case "msgCustomBackend":
          notify(error.message);
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

      const num = parseInt(e.target.value) || "";
      setNumeroMoviliza(num)

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


  // const onSubmitBarcode = (e) => {
  //   e.preventDefault();
  //   console.log("entro al medico")

  const onSubmitBarcode = useCallback(
    (info) => {
      // const data = {
      //   codigo_barras: info,
      // };
      const data = {
        codigo_barras: numeroMoviliza,
      };

      console.log(data)
      if (numeroMoviliza === "") {
        notifyError(
          "El campo del código de barras está vacío, por favor scanee o dijite el código"
        );
        return;
      }
      peticionBarcode({}, data)
        .then((response) => {
          if (response?.status === true) {
            setNumeroMoviliza(response?.obj?.result?.numero_moviliza);
            notify(response?.msg);
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
    };

    // const response= {obj: {result: "quemado"}}
    // setResConsultMoviliza(response?.obj?.result);
    // setPaso("ResumenTrx");
    // setShowModal(true);

    peticionConsultMoviliza({}, data)
      .then((response) => {
        if (response?.status === true) {
          setResConsultMoviliza(response?.obj);
          setPaso("ResumenTrx");
          setShowModal(true);
        }
      })
      .catch((error) => {
        CallErrorPeticion(error);
      });


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

      // notifyPending(
      //   makeSellRecaudo(data3),
      //   {
      //     render: () => {

      //       return "Procesando transacción";
      //     },
      //   },
      //   {
      //     render: ({ data: res }) => {

      //       // setPaymentStatus(res?.obj?.ticket ?? {});
      //       return "Transacción satisfactoria";
      //     },
      //   },
      //   {
      //     render: ({ data: error }) => {

      //       navigate("/corresponsalia/colpatria", { replace: true });
      //       if (error?.cause === "custom") {
      //         return <p style={{ whiteSpace: "pre-wrap" }}>{error?.message}</p>;
      //       }
      //       console.error(error?.message);
      //       return "Transacción fallida";
      //     },
      //   }
      // );
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
        valor_total_trx: resConsultMoviliza.valor_total_trx,
        ciudad: roleInfo.ciudad,
        direccion: roleInfo.direccion,
        telefono: roleInfo?.telefono,
        dane_code: roleInfo?.codigo_dane,
        city: roleInfo?.["ciudad"],
        idLiquidacion: numeroMoviliza,
        medioPago: "Efectivo",
        nroAutorizacion: 12345,
        id_trx: resConsultMoviliza?.["id_trx"]
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
            console.log("hasta aca bien vocucher", voucher)
            setInfTicket(voucher);
            setPaso("TransaccionExitosa");
            notify("Pago Moviliza exitoso");
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
    notify("Transacción cancelada");
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
            numeroMoviliza={numeroMoviliza}></LecturaMoviliza>
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
            {console.log(printDiv, infTicket)}
            <TicketColpatria refPrint={printDiv} ticket={infTicket} />
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
