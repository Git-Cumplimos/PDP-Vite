import { useState, useCallback, Fragment } from "react";
import Input from "../../../../../components/Base/Input";
import BarcodeReader from "../../../../../components/Base/BarcodeReader";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Form from "../../../../../components/Base/Form";
import Modal from "../../../../../components/Base/Modal";
import { useAuth } from "../../../../../hooks/AuthHooks";
import {
  notify,
  notifyError,
  notifyPending,
} from "../../../../../utils/notify";
import { useFetch } from "../../../../../hooks/useFetch";

import { fetchCustom, ErrorCustom } from "../../utils/fetchRunt";
import { ComponentsModalSummaryTrx } from "../Runt/components/components_modal";

//Constantes
const url_get_barcode = `${process.env.REACT_APP_URL_CORRESPONSALIA_AGRARIO_RUNT}/banco-agrario/get-codigo-barras`;
const url_consult_runt = `${process.env.REACT_APP_URL_CORRESPONSALIA_AGRARIO_RUNT}/banco-agrario/consulta-runt`;
const url_pagar_runt = `${process.env.REACT_APP_URL_CORRESPONSALIA_AGRARIO_RUNT}/banco-agrario/pago-runt`;

//Funciones Constantes

const PagarRunt = () => {
  const [paso, setPaso] = useState("LecturaRunt");
  const [numeroRunt, setNumeroRunt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [resConsultRunt, setResConsultRunt] = useState({});
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
      oficina_propia: false,
      numero_runt: numeroRunt,
      valor_mt: resConsultRunt.valor_mt,
      valor_runt: resConsultRunt.valor_runt,
      valor_total_trx: resConsultRunt.valor_total_trx,
    };
    peticionPayRunt({}, data)
      .then((response) => {
        if (response?.status === true) {
          setPaso("LecturaRunt");
          setShowModal(false);
        }
      })
      .catch((error) => {
        CallErrorPeticion(error);
      });
  };

  const searchCodigo = useCallback(
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

  //********************Funciones para cerrar el Modal**************************
  const HandleCloseResLecturaRunt = useCallback(() => {
    setPaso("LecturaRunt");
    notify("Transacción cancelada");
    setNumeroRunt(null);
  }, []);

  const HandleCloseResumenTrx = useCallback(() => {
    setPaso("LecturaRunt");
    setShowModal(false);
    notify("Transacción cancelada");
    setNumeroRunt(null);
    setResConsultRunt(null);
  }, []);

  const HandleCloseModal = useCallback(() => {
    if (paso === "RespuestaLecturaRunt" && !loadingPeticionBarcode) {
      HandleCloseResLecturaRunt();
    } else if (paso === "LecturaRunt" && !loadingPeticionConsultRunt) {
      HandleCloseResumenTrx();
    }
  }, [
    paso,
    HandleCloseResLecturaRunt,
    HandleCloseResumenTrx,
    loadingPeticionBarcode,
    loadingPeticionConsultRunt,
  ]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Pago de runt</h1>
      <Form>
        {/******************************Lectura runt*******************************************************/}
        {paso === "LecturaRunt" && (
          <Fragment>
            <BarcodeReader onSearchCodigo={(codigo) => searchCodigo(codigo)} />
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
              label="Número de runt"
              type="text"
              autoComplete="off"
              value={numeroRunt}
              disabled
            />
            <ButtonBar className="lg:col-span-2">
              <Button type={"submit"} onClick={onSubmitConsultRunt}>
                Tramitar runt
              </Button>
              <Button
                type={"reset"}
                onClick={HandleCloseResLecturaRunt}
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
            loadingPeticion={loadingPeticionConsultRunt}
            peticion={onSubmitPayRunt}
            handleClose={HandleCloseResumenTrx}
          ></ComponentsModalSummaryTrx>
        )}
        {/******************************Resumen de trx*******************************************************/}
      </Modal>
    </Fragment>
  );
};

export default PagarRunt;
