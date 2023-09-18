import React, {
  Fragment,
  useCallback,
  useRef,
  useState,
  useEffect,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import Tickets from "../../../../components/Base/Tickets";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notify, notifyError, notifyPending } from "../../../../utils/notify";
import { toPhoneNumber } from "../../../../utils/functions";
import { v4 } from "uuid";
import { useFetchPractisistemas } from "../../hooks/fetchPractisistemasHook";

const URL_RECARGA = `${process.env.REACT_APP_PRACTISISTEMAS}/recargasCelular/recarga`;
const URL_CONSULTA_RECARGA = `${process.env.REACT_APP_PRACTISISTEMAS}/recargasCelular/consulta-estado-trx`;


const RecargarPaquetes = () => {
  //Variables
  const printDiv = useRef();
  const { roleInfo, pdpUser } = useAuth();
  const [inputCelular, setInputCelular] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [respuesta, setRespuesta] = useState(false);
  const [typeInfo, setTypeInfo] = useState("Ninguno");
  const { state } = useLocation();
  const validNavigate = useNavigate();
  const id_uuid = v4();
  const [infTicket, setInfTicket] = useState("");
  const onCelChange = (e) => {
    const valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");

    if (valueInput[0] != 3) {
      if (valueInput.length == 1 && inputCelular == "") {
        notifyError(
          "Número inválido, el No. de celular debe comenzar con el número 3"
        );
        return;
      }
    }
    setInputCelular(valueInput);
  };

  const onSubmitCheck = (e) => {
    e.preventDefault();
    setShowModal(true);
    setTypeInfo("ResumenRecarga");
    if (inputCelular[0] != 3) {
      notifyError(
        "Número inválido, el No. de celular debe comenzar con el número 3"
      );
      handleClose();
    }
  };
  
  const [loadingPeticionRecargaPaquetes, peticionRecargaPaquetes] = useFetchPractisistemas(
    URL_RECARGA,
    URL_CONSULTA_RECARGA,
    "Realizar recarga practisistemas"
  );

  const fecthEnvioTransaccion = useCallback(
    (ev) => {
      ev.preventDefault();
      setRespuesta(true);
      const data = {
        comercio: {
          id_comercio: roleInfo.id_comercio,
          id_terminal: roleInfo.id_dispositivo,
          id_usuario: roleInfo.id_usuario,
          id_uuid_trx: id_uuid,
        },
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" || roleInfo?.tipo_comercio === "KIOSCO" ? true : false,
        nombre_comercio: roleInfo["nombre comercio"],
        valor_total_trx: parseInt(state?.valor_paquete),
        address: roleInfo?.direccion,
        nombre_usuario: pdpUser?.uname ?? "",
        datos_recargas: {
          celular: inputCelular,
          operador: state?.operador,
          jsonAdicional: {
            operador: state?.operadorPaquete,
            operador_paquete: state?.operador_recargar,
            descripcion: state?.descripcion,
            cod_paquete: state?.codigo_paq,
          },
        },
      };
      const dataAditional = {
        id_uuid_trx: id_uuid,
      };
      notifyPending(
        peticionRecargaPaquetes(data, dataAditional),
        {
          render: () => {
            return "Procesando compra de paquete";
          },
        },
        {
          render: ({ data: res }) => {
            setInfTicket(res?.obj?.ticket);
            setTypeInfo("RecargaExitosa");
            return "Compra de paquete exitosa";
          },
        },
        {
          render: ({ data: error }) => {
            validNavigate("/recargas-paquetes");
            return error?.message ?? "Compra paquete fallida";
          },
        }
      );
    },
    [roleInfo, id_uuid, pdpUser, state, inputCelular, validNavigate]
  );

  const handleClose = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    setInputCelular("");
    setInfTicket("");
  }, []);

  const handleCloseRecarga = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    validNavigate("/recargas-paquetes");
    handleClose();
  }, []);

  const handleCloseCancelada = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    notifyError("Transacción cancelada por el usuario");
    validNavigate("/recargas-paquetes");
    handleClose();

  }, []);

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  useEffect(() => {
    if (!state?.operador_recargar) {
      validNavigate("../recargas-paquetes");
    }
  }, [state?.operador_recargar]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">{state?.operador_recargar}</h1>
      <p> {state?.descripcion} </p>
      <p> Valor: {formatMoney.format(state?.valor_paquete)} </p>
      <Form onSubmit={onSubmitCheck} >
        <Input
          name="celular"
          label="Número de celular"
          type="tel"
          autoComplete="off"
          minLength={"10"}
          maxLength={"10"}
          value={inputCelular}
          onChange={onCelChange}
          required
          disabled={loadingPeticionRecargaPaquetes}
        />

        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Realizar venta de paquete</Button>
        </ButtonBar>
      </Form>

      <Modal show={showModal} handleClose={handleClose}>
        {/**************** Resumen de la recarga **********************/}
        {typeInfo === "ResumenRecarga" && (
          <PaymentSummary
            title="¿Está seguro de realizar la transacción?"
            subtitle="Resumen de transacción"
            summaryTrx={{
              Celular: toPhoneNumber(inputCelular),
              Valor: formatMoney.format(state?.valor_paquete),
              Descripción: (
                <div className="absolute text-left">{state?.descripcion}</div>
              ),
            }}>
            <>
              <ButtonBar>
                <Button 
                  onClick={handleCloseCancelada}
                  disabled={loadingPeticionRecargaPaquetes}>
                  Cancelar
                </Button>
                <Button 
                  type={"submit"} 
                  onClick={fecthEnvioTransaccion}
                  disabled= {loadingPeticionRecargaPaquetes}>
                  Aceptar
                </Button>
                </ButtonBar>
            </>
            <SimpleLoading show={respuesta} />
          </PaymentSummary>
        )}
        {/**************** Recarga Exitosa **********************/}
        {infTicket && typeInfo === "RecargaExitosa" && (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <Tickets
              refPrint={printDiv}
              ticket={infTicket}
              handleClose={handleClose}
            />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={handleCloseRecarga}>Cerrar</Button>
            </ButtonBar>
          </div>
        )}
        {/*************** Recarga Exitosa **********************/}
      </Modal>
    </Fragment>
  );
};

export default RecargarPaquetes;
