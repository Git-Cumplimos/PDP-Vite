import { useState, useCallback, Fragment, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Modal from "../../../../components/Base/Modal";
import Input from "../../../../components/Base/Input"
import SimpleLoading from "../../../../components/Base/SimpleLoading/SimpleLoading"
import Table from "../../../../components/Base/Table";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notify, notifyError} from "../../../../utils/notify";
import { useFetch } from "../../../../hooks/useFetch";
import { fetchCustom, ErrorCustom } from "../../utils/fetchMoviliza";
import { ComponentsMsgFallaNotificacion } from "./components/components_falla_notificacion";
import classes from "./pagarMoviliza.module.css";
import TicketMoviliza from "../../components/TicketsMoviliza/TicketMoviliza";
import { useFetchMoviliza } from "../../hooks/hookMoviliza";

//Constantes Style
const { styleComponents } = classes;

//Constantes
const url_consult_pago = `${process.env.REACT_APP_URL_PASARELA_GOU}/backend/pasarela-pagos/consultar-pago`;

const ConsultarPago = () => {
  const [numLiquidacion, setNumLiquidacion] = useState("");
  const [paso, setPaso] = useState("LecturaLiquidacion");
  const [respLiquidacion, setRespLiquidacion] = useState([]);
  const [infTicket, setInfTicket] = useState(null);
  const navigate = useNavigate();
  const validNavigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [showModalMsg, setShowModalMsg] = useState(false);
  const printDiv = useRef();

  const [loadingPeticionMicrositio, peticionConsultMoviliza] = useFetch(
    fetchCustom(url_consult_pago, "POST", "Consultar pago")
  );

  useEffect(() => {
    console.log("loadingPeticionMicrositio-->",loadingPeticionMicrositio)
  }, [loadingPeticionMicrositio]);

  const CallErrorPeticion = useCallback((error) => {
    let msg = "Error respuesta PDP: Consulta de pago no exitoso";
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
        "Error respuesta Front-end PDP: Timeout al consumir el servicio (Micrositio GOU) [0010002]"
      ) {
      } else {
        notifyError(msg);
      }
    }
    setPaso("LecturaLiquidacion");
    setShowModal(false);
  }, []);

  //********************Funciones para cerrar el Modal**************************
  const HandleCloseTrx = useCallback(() => {
    setPaso("LecturaLiquidacion")
    setShowModal(false)
    notifyError("Respuesta PDP: Transacción cancelada")
    validNavigate("/moviliza")
  }, []);

  const HandleCloseMsg = useCallback(() => {
    setShowModalMsg(false);
  }, []);

  const HandleCloseTrxExitosa = useCallback(() => {
    setPaso("LecturaLiquidacion");
    setShowModal(false);
    setNumLiquidacion("");
    setInfTicket(null);
    validNavigate("/moviliza")
  }, [validNavigate]);

  const HandleCloseModal = useCallback(() => {
    if (paso === "LecturaLiquidacion" && !loadingPeticionMicrositio) {
      HandleCloseTrx(true);
    } 
  }, [paso, HandleCloseTrx, loadingPeticionMicrositio]);

  const onSubmitConsulta = useCallback(
    (e) => {
      e.preventDefault();
      const data = {
        numLiquidacion:numLiquidacion,
      };
      peticionConsultMoviliza({},data)
        .then((response) => {
          console.log("response-->",response)
          if (response?.status === true) {
            setPaso("showLiquidacion");
            setRespLiquidacion(response?.obj?.result?.info)
          } else {
            const msg_error=response?.obj?.error_msg?.ErrorBuscandoLiquidacion?.error_context
            console.log("msg_error-->",msg_error)
            notifyError(msg_error)
            setNumLiquidacion("")                       
          }        
        })
        .catch((error) => {
          CallErrorPeticion(error);
        });
    },
    [CallErrorPeticion,peticionConsultMoviliza,numLiquidacion]
  );

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  return (
    <Fragment>
      <SimpleLoading show={loadingPeticionMicrositio}></SimpleLoading>
      <h1 className="text-3xl mt-6">Consulta Pagos</h1>
      <Form className=" flex flex-col content-center items-center">
        <div className={styleComponents}>
          <Input
            id="numLiquidacion"
            label="Liquidación"
            type="text"
            minLength="1"
            maxLength="30"
            required={true}
            autoComplete="off"
            value={numLiquidacion}
            onInput={(e) => {
              if (!isNaN(e.target.value)) {
                const num = e.target.value;
                setNumLiquidacion(num);
              }
            }}
          />
        </div>  
        <ButtonBar className="flex justify-center py-6">
          <Button 
            type="submit"
            onClick={onSubmitConsulta}
            disabled={loadingPeticionMicrositio}
            >
              Realizar consulta
            </Button>
          <Button 
            type={"button"} 
            onClick={() => HandleCloseTrx(true)}
            disabled={loadingPeticionMicrositio}
          >
            Cancelar
          </Button>
        </ButtonBar>
      </Form>
      {paso === "showLiquidacion" && (
        <Table
          headers={["Número de liquidación", "Valor", "Fecha y hora"]}
          data={respLiquidacion.map(
            ({ liquidacion, valor, fecha_hora }) => {
              return { liquidacion, valor, fecha_hora };
            }
          )}
        />
      )}
      <Modal show={showModal} handleClose={HandleCloseModal}>        
        {/**************** TransaccionExitosa **********************/}
        {infTicket && paso === "TrxExitosa" && (
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

      {/**************** Transaccion Fallida por notificación **********************/}
      <Modal show={showModalMsg} handleClose={HandleCloseMsg}>
      {(
          <ComponentsMsgFallaNotificacion
          handleClose={HandleCloseMsg}
          ></ComponentsMsgFallaNotificacion>
          )}
          </Modal>
    </Fragment>
  );
};

export default ConsultarPago;
