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
import { fetchCustom, ErrorCustom } from "../../../utils/fetchCarteraCredito";
import { ComponentsModalSummaryTrx } from "./components/ComponentsModalSummaryTrx";
import {
    LecturaNumeroObligacion,
    LecturaNumeroCedula,
} from "./components/components_form_PagoCartera.jsx";
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
const PagoCarteraEfectivo = () => {
    const uniqueId = v4();
    const [datosPagoEfectivo, setDatosPagoEfectivo] = useState({
        numero_cedula : "Número de cédula ",
        numero_obligacion : "Número de obligación",
        documento: "LecturaNumeroObligacion",
        confirmacionTicket: "",
        confirmacionConsulta: "",
        seleccionCedulaObligacion: "LecturaNumeroObligacion",
        numeroPagoCartera: "",
        procedimiento: numero_obligacion,
        resConsultCartera: {},
    });
    
    const options_select = [
        { value: datosPagoEfectivo?.numero_obligacion, label: numero_obligacion },
        { value: datosPagoEfectivo?.numero_cedula, label: numero_cedula },
    ];
    
    const [showModalGenerico, setShowModalGenerico] = useState({
        showModal: false,
        showModalTicket: false,
        showModalObligacion: false,
    });
    
    const [selectIndiceObligacion, setSelectIndiceObligacion] = useState(0);
    const [loadingPayCartera, setLoadingPayCartera] = useState(false);
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
        setDatosPagoEfectivo((old) => {
            return { ...old, documento: "LecturaNumeroObligacion" };
        });
        setDatosPagoEfectivo((old) => {
            return { ...old, numeroPagoCartera: "" };
        });
        setShowModalGenerico((old) => {
            return { ...old, showModal: false };
        });
        setDatosPagoEfectivo((old) => {
            return { ...old, procedimiento: datosPagoEfectivo?.numero_obligacion };
        });
    }, []);

    const onChangeNumeroCartera = useCallback((e) => {
        setDatosPagoEfectivo((old) => {
            return { ...old, numeroPagoCartera: e.target.value };
        });
    }, []);

    const onChangeSelect = useCallback((e) => {
        if (e.target.value === datosPagoEfectivo?.numero_obligacion) {
            setDatosPagoEfectivo((old) => {
                return { ...old, documento: "LecturaNumeroObligacion", procedimiento: datosPagoEfectivo?.numero_obligacion, seleccionCedulaObligacion: "LecturaNumeroObligacion" };
            });
        } else if (e.target.value === datosPagoEfectivo?.numero_cedula) {
            setDatosPagoEfectivo((old) => {
                return { ...old, documento: "LecturaNumeroCedula", procedimiento: datosPagoEfectivo?.numero_cedula, seleccionCedulaObligacion: "LecturaNumeroCedula" };
            });
        }
        setDatosPagoEfectivo((old) => {
            return { ...old, numeroPagoCartera: "" };
        });
    }, []);

    const onSubmitConsultPagoCartera = (e) => {
        e.preventDefault();
        setShowModalGenerico((old) => {
            return { ...old, showModal: false, setShowModalObligacion:false };
        });
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
                numeroObligacion: datosPagoEfectivo?.numeroPagoCartera,
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
                    setDatosPagoEfectivo((old) => {
                        return { ...old, seleccionCedulaObligacion:"", confirmacionConsulta: "ResumenConsulta", resConsultCartera: response?.obj?.valores_trx };
                    });
                    setShowModalGenerico((old) => {
                        return { ...old, showModal: true };
                    });
                }
            })
            .catch((error) => {
                CallErrorPeticion(error);
            });
    };

    const onSubmitPayCartera = useCallback(
        (e, pagoTotal, choice_numero_obligacion, labelSeleccionado) => {
            setLoadingPayCartera(true)
            e.preventDefault(); 
            if (isNaN(pagoTotal)) {
                return notifyError("El valor no es un numero")
            }
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
                    setLoadingPayCartera(false)
                    if (response?.status === true) {
                        const voucher = response?.obj?.result?.ticket ? response?.obj?.result?.ticket : response?.obj?.ticket ? response?.obj?.ticket : {};
                        setInfTicket(voucher);
                        setDatosPagoEfectivo((old) => {
                            return { ...old, confirmacionTicket: "TransaccionExitosa" };
                        });
                        notify("Pago de Cartera Efectivo exitoso");
                        setShowModalGenerico((old) => {
                            return { ...old, showModal: false,showModalTicket: true };
                        });
                    } else if (response?.status === false) {
                        HandleCloseTrxExitosa()
                        if (response?.msg) {
                            notifyError(response?.msg);
                        } else {
                            notifyError("Error respuesta PDP: Transacción Pago Cartera no exitosa")
                        }
                    } else if (response === undefined) {
                        HandleCloseTrxExitosa()
                        notifyError("Error respuesta PDP: Transacción Pago Cartera no exitosa")
                    }
                })
                .catch((error) => {
                    CallErrorPeticion(error);
                });
        },
        [
            datosPagoEfectivo,
            pdpUser,
            roleInfo,
            peticionPayCartera,
            CallErrorPeticion,
        ]
    );

    const handlePrint = useReactToPrint({
        content: () => printDiv.current,
    });

    const HandleCloseTrx = useCallback(() => {
        setShowModalGenerico((old) => {
            return { ...old, confirmacionConsulta:"",showModal: false };
        });
        notifyError("Transacción cancelada por el usuario");
        setDatosPagoEfectivo((old) => {
            return {
            ...old,
            documento: "LecturaNumeroObligacion",
            numeroPagoCartera: "",
            procedimiento: datosPagoEfectivo?.numero_obligacion, 
            seleccionCedulaObligacion: "LecturaNumeroObligacion",
            resConsultCartera: {}
            };
        });
        validNavigate(-1);
    }, [validNavigate]);

    const HandleCloseTrxExitosa = useCallback(() => {
        setDatosPagoEfectivo((old) => {
            return {
                ...old,
                seleccionCedulaObligacion: "LecturaNumeroObligacion", documento: "LecturaNumeroObligacion", numeroPagoCartera: "",
                procedimiento: datosPagoEfectivo?.numero_obligacion,
                confirmacionConsulta: "",
                resConsultCartera: {},
            };
        });
        setShowModalGenerico((old) => {
            return {
                ...old,                
                showModal: false,
                showModalTicket: false
            };
        });
        setInfTicket(null);
        validNavigate(-1);
    }, [validNavigate]);
    
    const HandleCloseModal = useCallback(() => {
        setShowModalGenerico((old) => {
            return {
                ...old,                
                showModal: false,
                showModalTicket: false,
                showModalObligacion: false
            };
        });
        if (datosPagoEfectivo?.confirmacionTicket === "ResumenTrx" && !loadingPeticionPayCartera) {
            HandleCloseTrx();
        } else if (datosPagoEfectivo?.confirmacionTicket === "TransaccionExitosa") {
            HandleCloseTrxExitosa();
        }
    }, [
        datosPagoEfectivo,
        HandleCloseTrx,
        HandleCloseTrxExitosa,
        loadingPeticionPayCartera,
    ]);

    const tableObligacion = useMemo(() => {
        if (datosPagoEfectivo?.resConsultCartera?.length > 0) {
            return [
                ...datosPagoEfectivo?.resConsultCartera?.map((obligacion) => {
                    return {
                        "Número de obligación": obligacion?.numero_obligacion,
                        "Tipo de Crédito": obligacion?.tipo_credito,
                    };
                }),
            ];
        }
    }, [datosPagoEfectivo?.resConsultCartera]);

    const onSelectAutorizador = useCallback(
        (e, i) => {
            setShowModalGenerico((old) => {
                return { ...old, showModalObligacion: true };
            });
            setSelectIndiceObligacion(i)
        }
    );

    return (
        <Fragment>
            <SimpleLoading show={loadingPeticionConsultPagoCartera || loadingPayCartera}></SimpleLoading>
            <h1 className='text-3xl mt-6'>Pago de cartera en efectivo</h1>
            <Form>
                <div className={styleComponents}>
                    <Select
                        id='opciones'
                        label=''
                        options={options_select}
                        onChange={onChangeSelect}
                        value={datosPagoEfectivo?.procedimiento}
                        disabled={
                            loadingPeticionConsultPagoCartera
                                ? true
                                : false
                        }
                    />
                </div>
                {datosPagoEfectivo?.seleccionCedulaObligacion === "LecturaNumeroObligacion" && (
                    <LecturaNumeroObligacion
                        loadingPeticion={loadingPeticionConsultPagoCartera}
                        onSubmit={onSubmitConsultPagoCartera}
                        handleClose={HandleCloseTrx}
                        onChange={onChangeNumeroCartera}
                        procedimiento={datosPagoEfectivo?.procedimiento}
                        numero_obligacion={numero_obligacion}
                        numero_cedula={numero_cedula}
                        numeroPagoCartera={datosPagoEfectivo?.numeroPagoCartera}></LecturaNumeroObligacion>
                )}
                {datosPagoEfectivo?.seleccionCedulaObligacion === "LecturaNumeroCedula" && (
                    <LecturaNumeroCedula
                        loadingPeticion={loadingPeticionConsultPagoCartera}
                        onSubmit={onSubmitConsultPagoCartera}
                        handleClose={HandleCloseTrx}
                        onChange={onChangeNumeroCartera}
                        procedimiento={datosPagoEfectivo?.procedimiento}
                        numero_obligacion={numero_obligacion}
                        numero_cedula={numero_cedula}
                        numeroPagoCartera={datosPagoEfectivo?.numeroPagoCartera}></LecturaNumeroCedula>
                )}
            </Form>
            {datosPagoEfectivo?.confirmacionConsulta === "ResumenConsulta" && (
                <TableEnterprise
                    title="Seleccione el número de obligación a pagar"
                    headers={["Número de obligación", "Tipo de Crédito"]}
                    data={tableObligacion}
                    onSelectRow={onSelectAutorizador}
                >
                </TableEnterprise>
            )}
            {showModalGenerico?.showModalObligacion === true && (
                <Modal show={showModalGenerico?.showModal} handleClose={HandleCloseModal}>
                    <ComponentsModalSummaryTrx
                        documento={datosPagoEfectivo?.documento}
                        numero_obligacion={numero_obligacion}
                        numero_cedula={numero_cedula}
                        numeroPagoCartera={datosPagoEfectivo?.numeroPagoCartera}
                        summary={datosPagoEfectivo?.resConsultCartera}
                        loadingPeticion={loadingPeticionPayCartera}
                        peticion={onSubmitPayCartera}
                        handleClose={HandleCloseTrx}
                        posicion={selectIndiceObligacion}
                    >
                        <Select></Select>
                    </ComponentsModalSummaryTrx>
                </Modal>
            )}
            {infTicket && datosPagoEfectivo?.confirmacionTicket === "TransaccionExitosa" && (
                <Modal show={showModalGenerico?.showModalTicket} handleClose={HandleCloseModal}>
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

export default PagoCarteraEfectivo;
