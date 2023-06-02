import { useState, useCallback, Fragment, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Form from "../../../../../components/Base/Form";
import Modal from "../../../../../components/Base/Modal";
import Select from "../../../../../components/Base/Select";
import { useAuth } from "../../../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../../../utils/notify";
import { useFetch } from "../../../../../hooks/useFetch";
import { fetchCustom, ErrorCustom } from "../../utils/fetchRunt";
import { ComponentsModalSummaryTrx } from "../Runt/components/components_modal";
import {
    LecturaNumeroObligacion,
    LecturaNumeroCedula,
} from "../Runt/components/components_form_PagoCartera";
import classes from "./PagarRunt.module.css";
import TicketsAgrario from "../../components/TicketsBancoAgrario/TicketsAgrario/TicketsAgrario";
import { v4 } from 'uuid';
import { useFetchRunt } from "../../hooks/hookRunt";
//Constantes Style
const { styleComponents } = classes;

//Constantes
const url_get_barcode = `${process.env.REACT_APP_URL_CORRESPONSALIA_AGRARIO_RUNT}/banco-agrario/get-codigo-barras`;
const url_consult_runt = `${process.env.REACT_APP_URL_CORRESPONSALIA_AGRARIO_RUNT}/banco-agrario/consulta-runt`;
const url_pagar_runt = `${process.env.REACT_APP_URL_CORRESPONSALIA_AGRARIO_RUNT}/banco-agrario/pago-runt`;
const urlreintentos = `${process.env.REACT_APP_URL_CORRESPONSALIA_AGRARIO_RUNT}/banco-agrario/reintento-runt`;
const numero_cedula = "Número de cédula ";
const numero_obligacion = "Número de obligación";
const options_select = [
    { value: numero_obligacion, label: numero_obligacion },
    { value: numero_cedula, label: numero_cedula },
];

const PagarRunt = () => {
    const uniqueId = v4();
    const [paso, setPaso] = useState("LecturaNumeroObligacion");
    const [numeroRunt, setNumeroRunt] = useState("");
    const [procedimiento, setProcedimiento] = useState(numero_obligacion);
    const [showModal, setShowModal] = useState(false);
    const [resConsultRunt, setResConsultRunt] = useState({});
    const [infTicket, setInfTicket] = useState(null);
    const printDiv = useRef();
    const buttonDelate = useRef(null);
    const validNavigate = useNavigate();
    const { roleInfo, pdpUser } = useAuth();
    const [loadingPeticionPayRunt, peticionPayRunt] = useFetchRunt(
        url_pagar_runt,
        urlreintentos,
        "PagarRunt"
    );
    const [loadingPeticionBarcode, peticionBarcode] = useFetch(
        fetchCustom(url_get_barcode, "POST", "Leer código de barras")
    );
    const [loadingPeticionConsultRunt, peticionConsultRunt] = useFetch(
        fetchCustom(url_consult_runt, "POST", "Consultar runt")
    );

    const CallErrorPeticion = useCallback((error) => {
        let msg = "Pago RUNT no exitosa";
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
            if (error.message === "Error respuesta Front-end PDP: Timeout al consumir el servicio (PagarRunt) [0010002]") {
            } else {

                notifyError(msg);
            }
        }
        setPaso("LecturaNumeroObligacion");
        setNumeroRunt("");
        setResConsultRunt(null);
        setShowModal(false);
        setProcedimiento(numero_obligacion);
    }, []);

    const onChangeNumeroRunt = useCallback((e) => {
        setNumeroRunt(e.target.value);
    }, []);

    const onChangeSelect = useCallback((e) => {
        if (e.target.value === numero_obligacion) {
            setPaso("LecturaNumeroObligacion");
            setProcedimiento(numero_obligacion);
        } else if (e.target.value === numero_cedula) {
            setPaso("LecturaNumeroCedula");
            setProcedimiento(numero_cedula);
        }
        setNumeroRunt("");
    }, []);

    const onSubmitBarcode = useCallback(
        (info) => {
            const data = {
                codigo_barras: info,
            };
            if (info === "") {
                notifyError("El campo del código de barras está vacío, por favor scanee o dijite el código");
                return;
            }
            peticionBarcode({}, data)
                .then((response) => {
                    if (response?.status === true) {
                        setNumeroRunt(response?.obj?.result?.numero_runt);
                        notify(response?.msg);
                        setPaso("LecturaNumeroCedula");
                    }
                })
                .catch((error) => {
                    buttonDelate.current.click();
                    CallErrorPeticion(error);
                });
        },
        [peticionBarcode, CallErrorPeticion]
    );

    const onSubmitConsultRunt = (e) => {
        e.preventDefault();
        const data = {
            comercio: {
                id_comercio: roleInfo.id_comercio,
                id_terminal: roleInfo.id_dispositivo,
                id_usuario: roleInfo.id_usuario,
            },
            nombre_usuario: pdpUser["uname"],
            numero_runt: numeroRunt,
        };
        peticionConsultRunt({}, data)
            .then((response) => {
                if (response?.status === true) {
                    setResConsultRunt(response?.obj?.result);
                    setPaso("ResumenTrx");
                    setShowModal(true);
                }
            })
            .catch((error) => {
                CallErrorPeticion(error);
            });
    };

    const onSubmitPayRunt = useCallback(
        (e) => {
            const tipo__comercio = roleInfo.tipo_comercio.toLowerCase();
            const data = {
                comercio: {
                    id_comercio: roleInfo.id_comercio,
                    id_terminal: roleInfo.id_dispositivo,
                    id_usuario: roleInfo.id_usuario,
                },
                id_uuid_trx: uniqueId,
                oficina_propia:
                    tipo__comercio.search("kiosco") >= 0 ||
                        tipo__comercio.search("oficinas propias") >= 0
                        ? true
                        : false,
                nombre_usuario: pdpUser["uname"],
                nombre_comercio: roleInfo?.["nombre comercio"],
                numero_runt: numeroRunt,
                id_trx_original: resConsultRunt.id_trx,
                valor_mt: resConsultRunt.valor_mt,
                valor_runt: resConsultRunt.valor_runt,
                valor_total_trx: resConsultRunt.valor_total_trx,
                ciudad: roleInfo.ciudad,
                direccion: roleInfo.direccion,
                idterminal_punto: roleInfo.idterminal_punto,
                idtipo_dispositivo: roleInfo.idtipo_dispositivo,
                serial_dispositivo: roleInfo.serial_dispositivo,
                telefono: roleInfo?.telefono,
                dane_code: roleInfo?.codigo_dane,
                city: roleInfo?.["ciudad"],
            };
            const dataAditional = {
                id_uuid_trx: uniqueId,
            }
            peticionPayRunt(data, dataAditional)
                .then((response) => {
                    if (response?.status === true) {
                        const voucher = response?.obj?.result?.ticket ? response?.obj?.result?.ticket : response?.obj?.ticket ? response?.obj?.ticket : {};
                        setInfTicket(voucher);
                        setPaso("TransaccionExitosa");
                        notify("Pago del RUNT exitoso");
                    } else if (response?.status === false || response === undefined) {
                        HandleCloseTrxExitosa()
                        notifyError("Error respuesta PDP: Transacción Runt no exitosa")
                    }
                })
                .catch((error) => {
                    CallErrorPeticion(error);
                });
        },
        [
            numeroRunt,
            pdpUser,
            roleInfo,
            peticionPayRunt,
            resConsultRunt,
            CallErrorPeticion,
        ]
    );

    const handlePrint = useReactToPrint({
        content: () => printDiv.current,
    });

    //********************Funciones para cerrar el Modal**************************
    const HandleCloseTrx = useCallback(() => {
        setPaso("LecturaNumeroObligacion");
        setShowModal(false);
        notify("Transacción cancelada");
        setNumeroRunt("");
        setResConsultRunt(null);
        setProcedimiento(numero_obligacion);
    }, []);

    const HandleCloseTrxExitosa = useCallback(() => {
        setPaso("LecturaNumeroObligacion");
        setShowModal(false);
        setNumeroRunt("");
        setResConsultRunt(null);
        setInfTicket(null);
        setProcedimiento(numero_obligacion);
        validNavigate("/corresponsalia/corresponsalia-banco-agrario");
    }, [validNavigate]);

    const HandleCloseModal = useCallback(() => {
        if (paso === "LecturaNumeroObligacion" && !loadingPeticionBarcode) {
            HandleCloseTrx();
        } else if (paso === "LecturaNumeroCedula" && !loadingPeticionConsultRunt) {
            HandleCloseTrx();
        } else if (paso === "ResumenTrx" && !loadingPeticionPayRunt) {
            HandleCloseTrx();
        } else if (paso === "TransaccionExitosa") {
            HandleCloseTrxExitosa();
        }
    }, [
        paso,
        HandleCloseTrx,
        HandleCloseTrxExitosa,
        loadingPeticionBarcode,
        loadingPeticionPayRunt,
        loadingPeticionConsultRunt,
    ]);

    return (
        <Fragment>
            <h1 className='text-3xl mt-6'>Pago de cartera en efectivo</h1>
            <Form>
                <div className={styleComponents}>
                    <Select
                        id='opciones'
                        label=''
                        options={options_select}
                        onChange={onChangeSelect}
                        value={procedimiento}
                        disabled={
                            loadingPeticionBarcode || loadingPeticionConsultRunt
                                ? true
                                : false
                        }
                    />
                </div>
                {/******************************Lectura runt*******************************************************/}
                {paso === "LecturaNumeroObligacion" && (
                    <LecturaNumeroObligacion
                        loadingPeticion={loadingPeticionConsultRunt}
                        onSubmit={onSubmitConsultRunt}
                        handleClose={HandleCloseTrx}
                        onChange={onChangeNumeroRunt}
                        procedimiento={procedimiento}
                        numero_obligacion={numero_obligacion}
                        numero_cedula={numero_cedula}
                        numeroRunt={numeroRunt}></LecturaNumeroObligacion>
                )}
                {/******************************Lectura runt*******************************************************/}

                {/******************************Respuesta Lectura runt*******************************************************/}
                {paso === "LecturaNumeroCedula" && (
                    <LecturaNumeroCedula
                        loadingPeticion={loadingPeticionConsultRunt}
                        onSubmit={onSubmitConsultRunt}
                        handleClose={HandleCloseTrx}
                        onChange={onChangeNumeroRunt}
                        procedimiento={procedimiento}
                        numero_obligacion={numero_obligacion}
                        numero_cedula={numero_cedula}
                        numeroRunt={numeroRunt}></LecturaNumeroCedula>
                )}
                {/******************************Respuesta Lectura runt*******************************************************/}
            </Form>

            <Modal show={showModal} handleClose={HandleCloseModal}>
                {/******************************Resumen de trx*******************************************************/}
                {paso === "ResumenTrx" && (
                    <ComponentsModalSummaryTrx
                        summary={resConsultRunt}
                        loadingPeticion={loadingPeticionPayRunt}
                        peticion={onSubmitPayRunt}
                        handleClose={HandleCloseTrx}></ComponentsModalSummaryTrx>
                )}
                {/******************************Resumen de trx*******************************************************/}

                {/**************** TransaccionExitosa **********************/}
                {infTicket && paso === "TransaccionExitosa" && (
                    <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center'>
                        <TicketsAgrario refPrint={printDiv} ticket={infTicket} />
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

export default PagarRunt;
