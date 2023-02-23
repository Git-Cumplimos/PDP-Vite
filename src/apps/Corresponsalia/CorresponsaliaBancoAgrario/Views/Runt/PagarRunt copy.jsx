import { useState, useCallback, Fragment, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import Input from "../../../../../components/Base/Input";
import BarcodeReader from "../../../../../components/Base/BarcodeReader";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Form from "../../../../../components/Base/Form";
import Modal from "../../../../../components/Base/Modal";
import Select from "../../../../../components/Base/Select";
import Tickets from "../../../../../components/Base/Tickets";
import { useAuth } from "../../../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../../../utils/notify";
import { useFetch } from "../../../../../hooks/useFetch";

import { fetchCustom, ErrorCustom } from "../../utils/fetchRunt";
import { ComponentsModalSummaryTrx } from "../Runt/components/components_modal";

//Constantes
const url_get_barcode = `${process.env.REACT_APP_URL_CORRESPONSALIA_AGRARIO_RUNT}/banco-agrario/get-codigo-barras`;
const url_consult_runt = `${process.env.REACT_APP_URL_CORRESPONSALIA_AGRARIO_RUNT}/banco-agrario/consulta-runt`;
const url_pagar_runt = `${process.env.REACT_APP_URL_CORRESPONSALIA_AGRARIO_RUNT}/banco-agrario/pago-runt`;
const option_manual = "Manual";
const option_barcode = "Código de barras";
const options_select = [
  { value: option_manual, label: option_manual },
  { value: option_barcode, label: option_barcode },
];

const PagarRunt = () => {
  const [paso, setPaso] = useState("LecturaRunt");
  const [numeroRunt, setNumeroRunt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [resConsultRunt, setResConsultRunt] = useState({});
  const [infTicket, setInfTicket] = useState(null);
  const printDiv = useRef();
  const validNavigate = useNavigate();
  const { roleInfo, pdpUser } = useAuth();

  const [loadingPeticionBarcode, peticionBarcode] = useFetch(
    fetchCustom(url_get_barcode, "POST", "Leer código de barras")
  );
  const [loadingPeticionConsultRunt, peticionConsultRunt] = useFetch(
    fetchCustom(url_consult_runt, "POST", "Consultar runt")
  );
  const [loadingPeticionPayRunt, peticionPayRunt] = useFetch(
    fetchCustom(url_pagar_runt, "POST", "Pago runt")
  );

  const onChangeSelect = useCallback((e) => {
    if (e.target.value === option_manual) {
      setPaso("LecturaRunt");
    } else if (e.target.value === option_barcode) {
      setPaso("LecturaRunt");
    }
  }, []);

  const onSubmitBarcode = useCallback(
    (info) => {
      const data = {
        codigo_barras: info,
      };
      peticionBarcode({}, data)
        .then((response) => {
          if (response?.status === true) {
            setNumeroRunt(response?.obj?.result?.numero_runt);
            setPaso("RespuestaLecturaRunt");
          }
        })
        .catch((error) => {
          CallErrorPeticion(error);
        });
    },
    [peticionBarcode]
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

  const onSubmitPayRunt = (e) => {
    const data = {
      comercio: {
        id_comercio: roleInfo.id_comercio,
        id_terminal: roleInfo.id_dispositivo,
        id_usuario: roleInfo.id_usuario,
      },
      nombre_usuario: pdpUser["uname"],
      numero_runt: numeroRunt,
      id_trx: resConsultRunt.id_trx,
      valor_mt: resConsultRunt.valor_mt,
      valor_runt: resConsultRunt.valor_runt,
      valor_total_trx: resConsultRunt.valor_total_trx,
      nombre_comercio: roleInfo["nombre comercio"],
      ciudad: roleInfo.ciudad,
      direccion: roleInfo.direccion,
    };
    peticionPayRunt({}, data)
      .then((response) => {
        if (response?.status === true) {
          const voucher = response.obj.result.ticket;
          setInfTicket(JSON.parse(voucher));
          setPaso("TransaccionExitosa");
        }
        notify("Pago del runt exitoso");
      })
      .catch((error) => {
        CallErrorPeticion(error);
      });
  };

  function CallErrorPeticion(error) {
    let msg = "Recarga no exitosa";
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
      notifyError(msg);
    }
    setPaso("LecturaRunt");
    setNumeroRunt(null);
    setResConsultRunt(null);
    setShowModal(false);
  }

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  //********************Funciones para cerrar el Modal**************************
  const HandleCloseTrx = useCallback(() => {
    setPaso("LecturaRunt");
    setShowModal(false);
    notify("Transacción cancelada");
    setNumeroRunt(null);
    setResConsultRunt(null);
  }, []);

  const HandleCloseTrxExitosa = useCallback(() => {
    setPaso("LecturaRunt");
    setShowModal(false);
    setNumeroRunt(null);
    setResConsultRunt(null);
    setInfTicket(null);
    validNavigate("/corresponsalia/corresponsalia-banco-agrario");
  }, [validNavigate]);

  const HandleCloseModal = useCallback(() => {
    if (paso === "LecturaRunt" && !loadingPeticionBarcode) {
      HandleCloseTrx();
    } else if (paso === "RespuestaLecturaRunt" && !loadingPeticionConsultRunt) {
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
      <h1 className="text-3xl mt-6">Pago de RUNT</h1>
      <Form grid>
        {/******************************Lectura runt*******************************************************/}
        {paso === "LecturaRunt" && (
          <Fragment>
            <Select
              id="opciones"
              label=""
              options={options_select}
              // value={banco}
              onChange={onChangeSelect}
              required
            />
            <br></br>
            <BarcodeReader onSearchCodigo={onSubmitBarcode} />
            <ButtonBar className="lg:col-span-2">
              <Button type="reset">Volver a ingresar código de barras</Button>
            </ButtonBar>
          </Fragment>
        )}
        {/******************************Lectura runt*******************************************************/}

        {/******************************Respuesta Lectura runt*******************************************************/}
        {paso === "RespuestaLecturaRunt" && (
          <Fragment>
            <Input
              label="Número de RUNT"
              type="text"
              autoComplete="off"
              value={numeroRunt}
              disabled
            />
            <ButtonBar className="lg:col-span-2">
              <Button
                type={"submit"}
                onClick={onSubmitConsultRunt}
                disabled={loadingPeticionConsultRunt}
              >
                Tramitar RUNT
              </Button>
              <Button
                type={"reset"}
                onClick={HandleCloseTrx}
                disabled={loadingPeticionConsultRunt}
              >
                Cancelar
              </Button>
            </ButtonBar>
          </Fragment>
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
            handleClose={HandleCloseTrx}
          ></ComponentsModalSummaryTrx>
        )}
        {/******************************Resumen de trx*******************************************************/}

        {/**************** TransaccionExitosa **********************/}
        {infTicket && paso === "TransaccionExitosa" && (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <Tickets refPrint={printDiv} ticket={infTicket} />
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
