import { useState, useMemo, useCallback, Fragment, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import Button from "../../../../../../components/Base/Button";
import ButtonBar from "../../../../../../components/Base/ButtonBar";
import Form from "../../../../../../components/Base/Form";
import Modal from "../../../../../../components/Base/Modal";
import Select from "../../../../../../components/Base/Select";
import { useAuth } from "../../../../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../../../../utils/notify";
import { useFetch } from "../../../../../../hooks/useFetch";
import { fetchCustom, ErrorCustom } from "../../../utils/fetchRunt";
import { ComponentsModalSummaryTrx } from "../../PagoCartera/PagoCarteraEfectivo/components/components_modal_PagoCartera";
import {
    LecturaNumeroObligacion,
    LecturaNumeroCedula,
} from "../PagoCarteraEfectivo/components/components_form_PagoCartera.jsx";
import classes from "../../Runt/PagarRunt.module.css"
import TicketsAgrario from "../../../components/TicketsBancoAgrario/TicketsAgrario/TicketsAgrario";
import { v4 } from 'uuid';
import { useFetchPagoCartera } from "../../../hooks/hookPagoCartera";
import SimpleLoading from "../../../../../../components/Base/SimpleLoading/SimpleLoading";
import TableEnterprise from "../../../../../../components/Base/TableEnterprise/TableEnterprise";
const { styleComponents } = classes;
const url_consult_pago_cartera = `${process.env.REACT_APP_URL_BANCO_AGRARIO}/banco-agrario/consulta_pago_cartera`;
const url_pago_cartera = `${process.env.REACT_APP_URL_BANCO_AGRARIO}/banco-agrario/pago_cartera`;
const urlreintentos = `${process.env.REACT_APP_URL_CORRESPONSALIA_AGRARIO_RUNT}/banco-agrario/reintento-runt`;
const numero_cedula = "Número de cédula ";
const numero_obligacion = "Número de obligación";
const options_select = [
    { value: numero_obligacion, label: numero_obligacion },
    { value: numero_cedula, label: numero_cedula },
];
const PagoCartera = () => {
    const uniqueId = v4();
    const [selectIndiceObligacion, setSelectIndiceObligacion] = useState(0);
    const [paso, setPaso] = useState("LecturaNumeroObligacion");
    const [documento, setDocumento] = useState("LecturaNumeroObligacion");
    const [numeroPagoCartera, setNumeroPagoCartera] = useState("");
    const [procedimiento, setProcedimiento] = useState(numero_obligacion);
    const [showModal, setShowModal] = useState(false);
    const [showModalTicket, setShowModalTicket] = useState(false);
    const [showModalObligacion, setShowModalObligacion] = useState(false);
    const [resConsultCartera, setResConsultCartera] = useState({});
    const [infTicket, setInfTicket] = useState({});
    const printDiv = useRef();
    const validNavigate = useNavigate();
    const { roleInfo, pdpUser } = useAuth();
    const [loadingPeticionPayCartera, peticionPayCartera] = useFetchPagoCartera(
        url_pago_cartera,
        urlreintentos,
        "PagoCartera"
    );

    const [loadingPeticionConsultPagoCartera, peticionConsultCartera] = useFetch(
        fetchCustom(url_consult_pago_cartera, "POST", "Consultar Pago Cartera")
    );

    const CallErrorPeticion = useCallback((error) => {
        let msg = "Pago Cartera no exitosa";
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
        setShowModal(false);
        setProcedimiento(numero_obligacion);
    }, []);

    const onChangeNumeroCartera = useCallback((e) => {
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

    const onSubmitConsultPagoCartera = (e) => {
        e.preventDefault();
        setShowModalObligacion(false)
        setShowModal(false);
        const data = {
            oficina_propia:
                roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
                    roleInfo?.tipo_comercio === "KIOSCO"
                    ? true
                    : false,
            valor_total_trx: 0,
            nombre_comercio: roleInfo?.["nombre comercio"],
            nombre_usuario: pdpUser?.uname ?? "",
            comercio: {
                id_comercio: roleInfo.id_comercio,
                id_terminal: roleInfo.id_dispositivo,
                id_usuario: roleInfo.id_usuario,
            },
            consultaCartera: {
                numeroObligacion: numeroPagoCartera,
                numeroConsulta: options_select === 'Número de cédula' ? '000001' : '000002',
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
                    setResConsultCartera(response?.obj?.valores_trx);
                    setPaso("ResumenTrx");
                    setShowModal(true);
                }
            })
            .catch((error) => {
                CallErrorPeticion(error);
            });
    };

    const onSubmitPayCartera = useCallback(
        (e, pagoTotal, choice_numero_obligacion, labelSeleccionado) => {
            e.preventDefault();
            const data = {
                oficina_propia:
                    roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
                        roleInfo?.tipo_comercio === "KIOSCO"
                        ? true
                        : false,
                valor_total_trx: parseInt(pagoTotal !== "" ? pagoTotal : 0),
                nombre_comercio: roleInfo?.["nombre comercio"],
                nombre_usuario: pdpUser?.uname ?? "",
                comercio: {
                    id_comercio: roleInfo.id_comercio,
                    id_terminal: roleInfo.id_dispositivo,
                    id_usuario: roleInfo.id_usuario,
                },
                PagoCartera: {
                    numeroObligacion: parseInt(choice_numero_obligacion),
                    numeroPago: labelSeleccionado === 'Valor total deuda' ? '000002' : '000001',
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
            peticionPayCartera(data, dataAditional)
                .then((response) => {
                    if (response?.status === true) {
                        const voucher = response?.obj?.result?.ticket ? response?.obj?.result?.ticket : response?.obj?.ticket ? response?.obj?.ticket : {};
                        setInfTicket(voucher);
                        setPaso("TransaccionExitosa");
                        notify("Pago de Cartera exitoso");
                        setShowModal(false)
                        setShowModalTicket(true)
                    } else if (response?.status === false || response === undefined) {
                        HandleCloseTrxExitosa()
                        notifyError("Error respuesta PDP: Transacción Pago Cartera no exitosa")
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
            peticionPayCartera,
            resConsultCartera,
            CallErrorPeticion,
        ]
    );

    const handlePrint = useReactToPrint({
        content: () => printDiv.current,
    });

    const HandleCloseTrx = useCallback(() => {
        setPaso("LecturaNumeroObligacion");
        setDocumento("LecturaNumeroObligacion");
        setShowModal(false);
        notify("Transacción cancelada");
        setNumeroPagoCartera("");
        setResConsultCartera({});
        setProcedimiento(numero_obligacion);
    }, []);

    const HandleCloseTrxExitosa = useCallback(() => {
        setPaso("LecturaNumeroObligacion");
        setDocumento("LecturaNumeroObligacion");
        setShowModal(false);
        setShowModalTicket(false)
        setNumeroPagoCartera("");
        setResConsultCartera({});
        setInfTicket(null);
        setProcedimiento(numero_obligacion);
        validNavigate("/corresponsalia/corresponsalia-banco-agrario");
    }, [validNavigate]);

    const HandleCloseModal = useCallback(() => {
        setShowModalObligacion(false)
        setShowModalTicket(false)
        setShowModal(false);
        if (paso === "LecturaNumeroObligacion") {
            setDocumento("LecturaNumeroObligacion")
            HandleCloseTrx();
        } else if (paso === "LecturaNumeroCedula" && !loadingPeticionConsultPagoCartera) {
            setDocumento("LecturaNumeroCedula")
            HandleCloseTrx();
        } else if (paso === "ResumenTrx" && !loadingPeticionPayCartera) {
            HandleCloseTrx();
        } else if (paso === "TransaccionExitosa") {
            HandleCloseTrxExitosa();
        }
    }, [
        paso,
        HandleCloseTrx,
        HandleCloseTrxExitosa,
        loadingPeticionPayCartera,
        loadingPeticionConsultPagoCartera,
    ]);

    const tableObligacion = useMemo(() => {
        if (resConsultCartera?.length > 0) {
            return [
                ...resConsultCartera?.map((obligacion) => {
                    return {
                        "Número de obligación": obligacion?.numero_obligacion,
                        "Tipo de Crédito": obligacion?.tipo_credito,
                    };
                }),
            ];
        }
    }, [resConsultCartera]);

    const onSelectAutorizador = useCallback(
        (e, i) => {
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
                            loadingPeticionConsultPagoCartera
                                ? true
                                : false
                        }
                    />
                </div>
                {paso === "LecturaNumeroObligacion" && (
                    <LecturaNumeroObligacion
                        loadingPeticion={loadingPeticionConsultPagoCartera}
                        onSubmit={onSubmitConsultPagoCartera}
                        handleClose={HandleCloseTrx}
                        onChange={onChangeNumeroCartera}
                        procedimiento={procedimiento}
                        numero_obligacion={numero_obligacion}
                        numero_cedula={numero_cedula}
                        numeroPagoCartera={numeroPagoCartera}></LecturaNumeroObligacion>
                )}
                {paso === "LecturaNumeroCedula" && (
                    <LecturaNumeroCedula
                        loadingPeticion={loadingPeticionConsultPagoCartera}
                        onSubmit={onSubmitConsultPagoCartera}
                        handleClose={HandleCloseTrx}
                        onChange={onChangeNumeroCartera}
                        procedimiento={procedimiento}
                        numero_obligacion={numero_obligacion}
                        numero_cedula={numero_cedula}
                        numeroPagoCartera={numeroPagoCartera}></LecturaNumeroCedula>
                )}
            </Form>
            {paso === "ResumenTrx" && (
                <TableEnterprise
                    title="Seleccione el número de obligación a pagar"
                    headers={["Número de obligación", "Tipo de Crédito"]}
                    data={tableObligacion}
                    onSelectRow={onSelectAutorizador}
                >
                </TableEnterprise>
            )}
            {showModalObligacion === true && (
                <Modal show={showModal} handleClose={HandleCloseModal}>
                    <ComponentsModalSummaryTrx
                        documento={documento}
                        numero_obligacion={numero_obligacion}
                        numero_cedula={numero_cedula}
                        numeroPagoCartera={numeroPagoCartera}
                        summary={resConsultCartera}
                        loadingPeticion={loadingPeticionPayCartera}
                        peticion={onSubmitPayCartera}
                        handleClose={HandleCloseTrx}
                        posicion={selectIndiceObligacion}
                    >
                        <Select></Select>
                    </ComponentsModalSummaryTrx>
                </Modal>
            )}
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
        </Fragment>
    );
};

export default PagoCartera;
