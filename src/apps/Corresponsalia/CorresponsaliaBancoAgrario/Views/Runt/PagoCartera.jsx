import { useState, useEffect,useMemo, useCallback, Fragment, useRef } from "react";
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
import { ComponentsModalSummaryTrx } from "../Runt/components/components_modal_PagoCartera";
import {
    LecturaNumeroObligacion,
    LecturaNumeroCedula,
} from "../Runt/components/components_form_PagoCartera";
import classes from "./PagarRunt.module.css";
import TicketsAgrario from "../../components/TicketsBancoAgrario/TicketsAgrario/TicketsAgrario";
import { v4 } from 'uuid';
// import { useFetchPagoCartera } from "../../hooks/hookRunt";
import { useFetchPagoCartera } from "../../hooks/hookPagoCartera";
import SimpleLoading from "../../../../../components/Base/SimpleLoading/SimpleLoading";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary/PaymentSummary";
import { formatMoney } from "../../../../../components/Base/MoneyInput";
import TableEnterprise from "../../../../../components/Base/TableEnterprise/TableEnterprise";
import Input from "../../../../../components/Base/Input/Input";
//Constantes Style
const { styleComponents } = classes;

//Constantes
const url_get_barcode = `${process.env.REACT_APP_URL_CORRESPONSALIA_AGRARIO_RUNT}/banco-agrario/get-codigo-barras`;
const url_consult_pago_cartera = `${process.env.REACT_APP_URL_PAGO_CARTERA_AGRARIO}/consulta_pago_cartera`;
const url_pago_cartera = `${process.env.REACT_APP_URL_PAGO_CARTERA_AGRARIO}/pago_cartera`;
const url_pagar_runt = `${process.env.REACT_APP_URL_CORRESPONSALIA_AGRARIO_RUNT}/banco-agrario/pago-runt`;
const urlreintentos = `${process.env.REACT_APP_URL_CORRESPONSALIA_AGRARIO_RUNT}/banco-agrario/reintento-runt`;
const numero_cedula = "Número de cédula ";
const numero_obligacion = "Número de obligación";
const options_select = [
    { value: numero_obligacion, label: numero_obligacion },
    { value: numero_cedula, label: numero_cedula },
];

const PagoCartera = () => {
    const navigate = useNavigate();
    const [datosTrans, setDatosTrans] = useState({
        pin: "",
    });
    const uniqueId = v4();
    const [selectIndiceObligacion, setSelectIndiceObligacion] = useState(0);
    const [paso, setPaso] = useState("LecturaNumeroObligacion");
    const [documento, setDocumento] = useState("LecturaNumeroObligacion");
    const [numeroPagoCartera, setNumeroPagoCartera] = useState("");
    const [procedimiento, setProcedimiento] = useState(numero_obligacion);
    const [showModal, setShowModal] = useState(false);
    const [showModalTicket, setShowModalTicket] = useState(false);
    const [showModalObligacion, setShowModalObligacion] = useState(false);
    const [resConsultRunt, setResConsultRunt] = useState({});
    const [infTicket, setInfTicket] = useState({});
    const [valorPagoCartera, setValorPagoCartera] = useState(0);
    const printDiv = useRef();
    const buttonDelate = useRef(null);
    const validNavigate = useNavigate();
    const { roleInfo, pdpUser } = useAuth();
    // const [pagoTotal, setPagoTotal] = useState(0);
    const [loadingPeticionPayRunt, peticionPayRunt] = useFetchPagoCartera(
        url_pago_cartera,
        urlreintentos,
        "PagoCartera"
    );

    const [loadingPeticionBarcode, peticionBarcode] = useFetch(
        fetchCustom(url_get_barcode, "POST", "Leer código de barras")
    );

    const [loadingPeticionConsultPagoCartera, peticionConsultCartera] = useFetch(
        fetchCustom(url_consult_pago_cartera, "POST", "Consultar Pago Cartera")
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
            if (error.message === "Error respuesta Front-end PDP: Timeout al consumir el servicio (PagoCartera) [0010002]") {
            } else {

                notifyError(msg);
            }
        }
        setPaso("LecturaNumeroObligacion");
        setDocumento("LecturaNumeroObligacion");
        setNumeroPagoCartera("");
        // setResConsultRunt(null);
        setShowModal(false);
        setProcedimiento(numero_obligacion);
    }, []);

    const onChangeNumeroRunt = useCallback((e) => {
        setNumeroPagoCartera(e.target.value);
    }, []);

    const onChangeSelect = useCallback((e) => {
        if (e.target.value === numero_obligacion) {
            setDocumento("LecturaNumeroObligacion");
            setPaso("LecturaNumeroObligacion");
            setProcedimiento(numero_obligacion);
        } else if (e.target.value === numero_cedula) {
            setPaso("LecturaNumeroCedula");
            setDocumento("LecturaNumeroCedula");
            setProcedimiento(numero_cedula);
        }
        setNumeroPagoCartera("");
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
                        setNumeroPagoCartera(response?.obj?.result?.numero_runt);
                        notify(response?.msg);
                        setPaso("LecturaNumeroCedula");
                        setDocumento("LecturaNumeroCedula");
                    }
                })
                .catch((error) => {
                    buttonDelate.current.click();
                    CallErrorPeticion(error);
                });
        },
        [peticionBarcode, CallErrorPeticion]
    );

    const onSubmitConsultPagoCartera = (e) => {
        e.preventDefault();
        // setPagoTotal(0)
        setShowModalObligacion(false)
        setShowModal(false);
        const data = {
            oficina_propia:
                roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
                    roleInfo?.tipo_comercio === "KIOSCO"
                    ? true
                    : false,
            valor_total_trx: valorPagoCartera !== "" ? valorPagoCartera : 0,
            nombre_comercio: roleInfo?.["nombre comercio"],
            nombre_usuario: pdpUser?.uname ?? "",
            comercio: {
                id_comercio: roleInfo.id_comercio,
                id_terminal: roleInfo.id_dispositivo,
                id_usuario: roleInfo.id_usuario,
            },
            consultaCartera: {
                valReferencia1: numeroPagoCartera,
                location: {
                    address: roleInfo?.["direccion"],
                    dane_code: roleInfo?.codigo_dane,
                    city: roleInfo?.["ciudad"],
                },
            },
        };
        peticionConsultCartera({}, data)
            .then((response) => {
                if (response?.status === true) {
                    setResConsultRunt(response?.obj?.valores_trx);
                    setPaso("ResumenTrx");
                    setShowModal(true);
                }
            })
            .catch((error) => {
                CallErrorPeticion(error);
            });
    };

    const onSubmitPayRunt = useCallback(
        (e, pagoTotal, choice_numero_obligacion) => {
            e.preventDefault();
            // setValorPagoCartera(pagoTotal);
            const tipo__comercio = roleInfo.tipo_comercio.toLowerCase();
            const data = {
                oficina_propia:
                    roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
                        roleInfo?.tipo_comercio === "KIOSCO"
                        ? true
                        : false,
                valor_total_trx: pagoTotal !== "" ? pagoTotal : 0,
                nombre_comercio: roleInfo?.["nombre comercio"],
                nombre_usuario: pdpUser?.uname ?? "",
                comercio: {
                    id_comercio: roleInfo.id_comercio,
                    id_terminal: roleInfo.id_dispositivo,
                    id_usuario: roleInfo.id_usuario,
                },
                PagoCartera: {
                    valReferencia1: choice_numero_obligacion,
                    valor_total_trx: pagoTotal !== "" ? pagoTotal : 0,
                    location: {
                        address: roleInfo?.["direccion"],
                        dane_code: roleInfo?.codigo_dane,
                        city: roleInfo?.["ciudad"],
                    },
                },
            };
            const dataAditional = {
                id_uuid_trx: uniqueId,
            }
            peticionPayRunt(data, dataAditional)
                .then((response) => {
                    if (response?.status === true) {
                        const voucher = response?.obj?.result?.ticket ? response?.obj?.result?.ticket : response?.obj?.ticket ? response?.obj?.ticket : {};
                        // setInfTicket(JSON.parse(voucher));
                        setInfTicket(voucher);
                        setPaso("TransaccionExitosa");
                        notify("Pago del RUNT exitoso");
                        setShowModal(false)
                        setShowModalTicket(true)
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
            numeroPagoCartera,
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
        setDocumento("LecturaNumeroObligacion");
        setShowModal(false);
        notify("Transacción cancelada");
        setNumeroPagoCartera("");
        // setResConsultRunt(null);
        setProcedimiento(numero_obligacion);
    }, []);

    const HandleCloseTrxExitosa = useCallback(() => {
        setPaso("LecturaNumeroObligacion");
        setDocumento("LecturaNumeroObligacion");
        setShowModal(false);
        setShowModalTicket(false)
        setNumeroPagoCartera("");
        // setResConsultRunt(null);
        setInfTicket(null);
        setProcedimiento(numero_obligacion);
        validNavigate("/corresponsalia/corresponsalia-banco-agrario");
    }, [validNavigate]);

    const HandleCloseModal = useCallback(() => {
        setShowModalObligacion(false)
        setShowModalTicket(false)
        setShowModal(false);
        if (paso === "LecturaNumeroObligacion" && !loadingPeticionBarcode) {
            setDocumento("LecturaNumeroObligacion")
            HandleCloseTrx();
        } else if (paso === "LecturaNumeroCedula" && !loadingPeticionConsultPagoCartera) {
            setDocumento("LecturaNumeroCedula")
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
        loadingPeticionConsultPagoCartera,
    ]);

    const tableObligacion = useMemo(() => {
        if (resConsultRunt?.length > 0){
            return [
                ...resConsultRunt?.map(( obligacion ) => {
                    return {
                        "Número de obligación": obligacion?.numero_obligacion,
                        "Tipo de Crédito": obligacion?.tipo_credito,
                    };
                }),
            ];
        }
    }, [resConsultRunt]);

    const onSelectAutorizador = useCallback(
        (e, i) =>
        {
            setShowModalObligacion(true)
            setSelectIndiceObligacion(i)
        }
    );

    return (
        <Fragment>
            <SimpleLoading show={loadingPeticionConsultPagoCartera}></SimpleLoading>
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
                            loadingPeticionBarcode || loadingPeticionConsultPagoCartera
                                ? true
                                : false
                        }
                    />
                </div>
                {/******************************Lectura runt*******************************************************/}
                {paso === "LecturaNumeroObligacion" && (
                    <LecturaNumeroObligacion
                        loadingPeticion={loadingPeticionConsultPagoCartera}
                        onSubmit={onSubmitConsultPagoCartera}
                        handleClose={HandleCloseTrx}
                        onChange={onChangeNumeroRunt}
                        procedimiento={procedimiento}
                        numero_obligacion={numero_obligacion}
                        numero_cedula={numero_cedula}
                        numeroPagoCartera={numeroPagoCartera}></LecturaNumeroObligacion>
                )}
                {/******************************Lectura runt*******************************************************/}

                {/******************************Respuesta Lectura runt*******************************************************/}
                {paso === "LecturaNumeroCedula" && (
                    <LecturaNumeroCedula
                        loadingPeticion={loadingPeticionConsultPagoCartera}
                        onSubmit={onSubmitConsultPagoCartera}
                        handleClose={HandleCloseTrx}
                        onChange={onChangeNumeroRunt}
                        procedimiento={procedimiento}
                        numero_obligacion={numero_obligacion}
                        numero_cedula={numero_cedula}
                        numeroPagoCartera={numeroPagoCartera}></LecturaNumeroCedula>
                )}
                {/******************************Respuesta Lectura runt*******************************************************/}
            </Form>

            {/* <Modal show={showModal} handleClose={HandleCloseModal}> */}
                {/******************************Resumen de trx*******************************************************/}
                {paso === "ResumenTrx" && (
                    <TableEnterprise
                        title="Seleccione el número de obligación a pagar"
                        headers={["Número de obligación", "Tipo de Crédito"]}
                        data={tableObligacion}
                        onSelectRow={onSelectAutorizador}
                    >
                        <Input
                            id="searchPin"
                            name="searchPin"
                            label={"Nombre del tipo de Pin"}
                            minLength="1"
                            maxLength="30"
                            type="text"
                            autoComplete="off"
                            onInput={(e) => {
                                setDatosTrans((old) => {
                                    return { ...old, pin: e.target.value };
                                });
                            }}
                        />
                    </TableEnterprise>
                )}
            {showModalObligacion === true && (
                <Modal show={showModal} handleClose={HandleCloseModal}>
                    <ComponentsModalSummaryTrx
                            documento={documento}
                            numero_obligacion={numero_obligacion}
                            numero_cedula={numero_cedula}
                            numeroPagoCartera={numeroPagoCartera}
                            summary={resConsultRunt}
                            loadingPeticion={loadingPeticionPayRunt}
                            peticion={onSubmitPayRunt}
                            handleClose={HandleCloseTrx}
                            posicion= {selectIndiceObligacion}
                            >
                            <Select></Select>
                    </ComponentsModalSummaryTrx>
                </Modal>
            )}
                {/******************************Resumen de trx*******************************************************/}

                {/**************** TransaccionExitosa **********************/}
                {infTicket && paso === "TransaccionExitosa" && (
                <Modal show={showModalTicket} handleClose={HandleCloseModal}>
                    <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center'>
                        <TicketsAgrario refPrint={printDiv} ticket={infTicket} />
                        <ButtonBar>
                            <Button onClick={handlePrint}>Imprimir</Button>
                            <Button onClick={HandleCloseTrxExitosa}>Cerrar</Button>
                        </ButtonBar>
                    </div>
                </Modal>
                )}
                {/*************** Recarga Exitosa **********************/}
            {/* </Modal> */}
        </Fragment>
    );
};

export default PagoCartera;
