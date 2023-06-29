import { useState, useMemo, useCallback, Fragment, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import Button from "../../../../../../components/Base/Button";
import ButtonBar from "../../../../../../components/Base/ButtonBar";
import Form from "../../../../../../components/Base/Form"
import Modal from "../../../../../../components/Base/Modal";
import Select from "../../../../../../components/Base/Select";
import { useAuth } from "../../../../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../../../../utils/notify";
import { fetchCustom, ErrorCustom } from "../../../utils/fetchRunt";
import { ComponentsModalSummaryTrxTarjCredito } from "../PagoCarteraTargCredito/components/components_modal_PagoCarteraTarCredito";
import classes from "../../Runt/PagarRunt.module.css"
import TicketsAgrario from "../../../components/TicketsBancoAgrario/TicketsAgrario/TicketsAgrario";
import { v4 } from 'uuid';
import { useFetchPagoCartera } from "../../../hooks/hookPagoCartera";
import SimpleLoading from "../../../../../../components/Base/SimpleLoading/SimpleLoading";
import Input from "../../../../../../components/Base/Input/Input";
const { styleComponents } = classes;
const url_pago_cartera_tarjcredito = `${process.env.REACT_APP_URL_BANCO_AGRARIO}/banco-agrario/pago_cartera_tarjCredito`;
const urlreintentos = `${process.env.REACT_APP_URL_CORRESPONSALIA_AGRARIO_RUNT}/banco-agrario/reintento-runt`;
const PagoCarteraTargCredito = () => {
    const uniqueId = v4();
    const [inputNumTarCredi, setInputNumTarCredi] = useState("");
    const [confirmacionDatos, setConfirmacionDatos] = useState(false);
    const [inputValorTarCredi, setInputValorTarCredi] = useState("");
    const [paso, setPaso] = useState("LecturaNumeroObligacion");
    const [numeroPagoCartera, setNumeroPagoCartera] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showModalTicket, setShowModalTicket] = useState(false);
    const [infTicket, setInfTicket] = useState({});
    const printDiv = useRef();
    const validNavigate = useNavigate();
    const { roleInfo, pdpUser } = useAuth();
    const [loadingPeticionPayCarteraTarjCredito, peticionPayCarteraTarjCredito] = useFetchPagoCartera(
        url_pago_cartera_tarjcredito,
        urlreintentos,
        "PagoCartera"
    );

    const CallErrorPeticion = useCallback((error) => {
        let msg = "Pago Cartera tarjeta crédito no exitosa";
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
        setNumeroPagoCartera("");
        setShowModal(false);
        setInputValorTarCredi("")
        setInputNumTarCredi("")
    }, []);

    const onSubmitPayCarteraTarjCredito = useCallback(
        (e, numero_tarjcredito, valor_pagar) => {
            e.preventDefault();
            const data = {
                oficina_propia:
                    roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
                        roleInfo?.tipo_comercio === "KIOSCO"
                        ? true
                        : false,
                valor_total_trx: parseInt(valor_pagar !== "" ? valor_pagar : 0),
                nombre_comercio: roleInfo?.["nombre comercio"],
                nombre_usuario: pdpUser?.uname ?? "",
                comercio: {
                    id_comercio: roleInfo.id_comercio,
                    id_terminal: roleInfo.id_dispositivo,
                    id_usuario: roleInfo.id_usuario,
                },
                PagoCarteraTarjCredito: {
                    numeroTarjCredito: parseInt(numero_tarjcredito),
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
            peticionPayCarteraTarjCredito(data, dataAditional)
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
            peticionPayCarteraTarjCredito,
            CallErrorPeticion,
        ]
    );
   
    const validacionDatos = (e) => {
        e.preventDefault();
        setConfirmacionDatos(true)
        setShowModal(true)
    }    

    const handlePrint = useReactToPrint({
        content: () => printDiv.current,
    });

    const HandleCloseTrx = useCallback(() => {
        setInputValorTarCredi("")
        setConfirmacionDatos(false)
        setInputNumTarCredi("")
        setShowModal(false);
        notify("Transacción cancelada");
        setNumeroPagoCartera("");
    }, []);

    const HandleCloseTrxExitosa = useCallback(() => {
        setShowModal(false);
        setShowModalTicket(false)
        setNumeroPagoCartera("");
        setInfTicket(null);
        validNavigate("/corresponsalia/corresponsalia-banco-agrario");
    }, [validNavigate]);

    const HandleCloseModal = useCallback(() => {
        setShowModalTicket(false)
        setShowModal(false);
        if (paso === "ResumenTrx" && !loadingPeticionPayCarteraTarjCredito) {
            HandleCloseTrx();
        } else if (paso === "TransaccionExitosa") {
            HandleCloseTrxExitosa();
        }
    }, [
        paso,
        HandleCloseTrx,
        HandleCloseTrxExitosa,
        loadingPeticionPayCarteraTarjCredito,        
    ]);

    function onChangeInput(e) {
        const { name, value } = e.target;
        const numericValue = (value.replace(/[^0-9]/g, '').slice(0, 16));
        setInputNumTarCredi(numericValue);    
        if (value === "") { 
            setInputNumTarCredi("")
        }
    }

    function onChangeInput2(e) {
        const { name, value } = e.target;
        const numericValue = (value.replace(/[^0-9]/g, '').slice(0, 8));
        setInputValorTarCredi(numericValue);
        if (value === "" || value === 0) { 
            setInputValorTarCredi("")
        }
    }

    return (
        <Fragment>
            <SimpleLoading show={loadingPeticionPayCarteraTarjCredito}></SimpleLoading>
            <h1 className='text-3xl mt-6'>Pago Tarjeta Crédito</h1>
            <Form>
                <div className={styleComponents}>
                    <Input
                    name="credito"
                    label="Número tarjeta crédito"
                    type="number"
                    minLength="5"
                    maxLength="16"
                    autoComplete="off"
                    value={inputNumTarCredi}
                    onChange={onChangeInput}
                    required
                    ></Input>
                </div>
                <div className={styleComponents}>
                    <Input
                    name="ValorPagar"
                    label="Valor a pagar"
                    type="number"
                    minLength="4"
                    maxLength="8"
                    autoComplete="off"
                    value={inputValorTarCredi}
                    onChange={onChangeInput2}
                    required
                    ></Input>
                </div>
                    <ButtonBar className="flex justify-center py-6">
                    <Button type={"submit"} onClick={validacionDatos} disabled={inputNumTarCredi === "" || inputValorTarCredi === "" || inputNumTarCredi.length > 16 || inputValorTarCredi.length > 8}>
                            Realizar Pago
                        </Button>
                    <Button type={"reset"} onClick={HandleCloseTrx} disabled={inputNumTarCredi === "" || inputValorTarCredi === "" || inputNumTarCredi.length > 16 || inputValorTarCredi.length > 8}>
                            Cancelar
                        </Button>
                    </ButtonBar>
            </Form>

            {confirmacionDatos === true && (
                <Modal show={showModal} handleClose={HandleCloseModal}>
                    <ComponentsModalSummaryTrxTarjCredito
                        numero_tarjcredito={inputNumTarCredi}
                        valor_pagar={inputValorTarCredi}
                        loadingPeticion={loadingPeticionPayCarteraTarjCredito}
                        peticion={onSubmitPayCarteraTarjCredito}
                        handleClose={HandleCloseTrx}
                    >
                        <Select></Select>
                    </ComponentsModalSummaryTrxTarjCredito>
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

export default PagoCarteraTargCredito;
